import {
  View,
  Text,
  Alert,
  FlatList,
  TouchableOpacity,
  Platform,
  ActivityIndicator,
  RefreshControl,
} from "react-native";
import React, { useEffect, useState } from "react";
import { useRouter } from "expo-router";
import { API_URL } from "@/constants/api";
import { useAuthStore } from "@/store/authStore";
import styles from "@/assets/styles/profile.styles";
import ProfileHeader from "@/components/profileHeader";
import LogoutButton from "@/components/logoutButton";
import { Ionicons } from "@expo/vector-icons";
import COLORS from "@/constants/colors";
import { Image } from "expo-image";
import { sleep } from ".";

const Profile = () => {
  const [books, setBooks] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [deleteBookId, setDeleteBookId] = useState(null);

  const { token } = useAuthStore();

  const router = useRouter();

  const fetchData = async () => {
    try {
      setIsLoading(true);

      const response = await fetch(`${API_URL}/books/user`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await response.json();
      if (!response.ok)
        throw new Error(data.message || "Failed to fetch resource");

      setBooks(data);
    } catch (error) {
      console.log("🚀 ~ fetchData ~ error:", error);
      Alert.alert(
        "Error",
        "Failed to load profile data. Scroll down to refresh"
      );
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleDeleteBook = async (id) => {
    try {
      setDeleteBookId(id);
      const response = await fetch(`${API_URL}/books/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
        method: "DELETE",
      });

      const data = await response.json();
      if (!response.ok)
        throw new Error(data.message || "Failed to delete book!");

      setBooks(books.filter((book) => book._id !== id));
      Alert.alert("Success", "Recommendation successfully deleted!");
    } catch (error) {
      console.log("🚀 ~ handleDeleteBook ~ error:", error);
    } finally {
      setDeleteBookId(null);
    }
  };

  const confirmDelete = (id) => {
    if (Platform.OS === "web") {
      if (
        window.confirm("Are you sure you want to delete this recommendation?")
      ) {
        handleDeleteBook(id);
      }
    } else {
      Alert.alert(
        "Delete Recommendation",
        "Are you sure you want to delete this recommendation?",
        [
          { text: "Cancel", style: "cancel" },
          {
            text: "Delete",
            style: "desctructive",
            onPress: () => handleDeleteBook(id),
          },
        ]
      );
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await fetchData();
    await sleep(600);
    setRefreshing(false);
  };

  const renderBookItem = ({ item }) => (
    <View style={styles.bookItem}>
      <Image source={item.img} style={styles.bookImage} />
      <View style={styles.bookInfo}>
        <Text style={styles.bookTitle}>{item.title}</Text>
        <View style={styles.ratingContainer}>
          {renderRatingStars(item.rating)}
        </View>
        <Text style={styles.bookCaption} numberOfLines={2}>
          {item.caption}
        </Text>
        <Text style={styles.bookDate}>
          {new Date(item.createdAt).toLocaleDateString()}
        </Text>
      </View>
      <TouchableOpacity
        style={styles.deleteButton}
        onPress={() => {
          confirmDelete(item._id);
        }}
      >
        {deleteBookId === item._id ? (
          <ActivityIndicator size="small" color={COLORS.primary} />
        ) : (
          <Ionicons name="trash-outline" size={20} color={COLORS.primary} />
        )}
      </TouchableOpacity>
    </View>
  );

  const renderRatingStars = (rating) => {
    const stars = [];
    for (let i = 1; i <= 5; i++) {
      stars.push(
        <Ionicons
          key={i}
          name={i <= rating ? "star" : "star-outline"}
          size={16}
          color={i <= rating ? "#f4b400" : COLORS.textSecondary}
          style={{ marginRight: 2 }}
        />
      );
    }
    return stars;
  };

  return (
    <View style={styles.container}>
      <ProfileHeader />
      <LogoutButton />

      {/* Your recommendations */}
      <View style={styles.booksHeader}>
        <Text style={styles.booksTitle}>Your Recommendations 📚</Text>
        <Text style={styles.booksCount}>{books.length} Books</Text>
      </View>

      <FlatList
        data={books}
        renderItem={renderBookItem}
        keyExtractor={(item) => item._id}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            colors={[COLORS.primary]}
            tintColor={COLORS.primary}
          />
        }
        contentContainerStyle={styles.booksList}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Ionicons
              name="boat-outline"
              size={50}
              color={COLORS.textSecondary}
            />
            <Text style={styles.emptyText}>No recommendations yet</Text>
            <TouchableOpacity
              style={styles.addButton}
              onPress={() => router.push("/create")}
            >
              <Text style={styles.addButtonText}>Add Your First Book</Text>
            </TouchableOpacity>
          </View>
        }
      />
    </View>
  );
};

export default Profile;
