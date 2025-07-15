import { View, Text } from "react-native";
import React from "react";
import { useAuthStore } from "@/store/authStore";
import styles from "@/assets/styles/profile.styles";
import { Image } from "expo-image";
import { formatMemberSince } from "@/lib/utils";

const ProfileHeader = () => {
  const { user } = useAuthStore();
  console.log("🚀 ~ ProfileHeader ~ user:", user);

  if(!user) return null

  return (
    <View style={styles.profileHeader}>
      <Image source={{ uri: user.avatar }} style={styles.profileImage} />

      <View style={styles.profileInfo}>
        <Text style={styles.username}>{user.username}</Text>
        <Text style={styles.email}>{user.email}</Text>
        <Text style={styles.memberSince}>
         📅 Joined{" "}
          {formatMemberSince(user.createdAt ? user.createdAt : new Date())}
        </Text>
      </View>
    </View>
  );
};

export default ProfileHeader;
