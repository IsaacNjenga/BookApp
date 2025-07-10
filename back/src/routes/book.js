import express from "express";
import cloudinary from "../../config/cloudinary.js";
import BookModel from "../models/Book.js";
import protectRoute from "../middleware/auth.middleware.js";

const router = express.Router();

//create a new book
router.post("/", protectRoute, async (req, res) => {
  try {
    const { title, caption, rating, image } = req.body;

    if (!image || !title || !caption || !rating) {
      return res.status(400).json({ message: "All fields are required" });
    }

    //upload the image to Cloudinary
    const uploadResponse = await cloudinary.uploader.upload(image);
    const imageURL = uploadResponse.secure_url;

    const newBook = new BookModel({
      title,
      caption,
      rating,
      img: imageURL,
      user: req.user._id,
    });

    await newBook.save();

    return res.status(201).json({
      message: "Book created successfully",
      book: {
        id: newBook._id,
        title: newBook.title,
        caption: newBook.caption,
        rating: newBook.rating,
        img: newBook.img,
      },
    });
  } catch (error) {
    console.error("Error creating book:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});

//fetch all books with pagination
router.get("/", protectRoute, async (req, res) => {
  try {
    const page = req.query.page || 1;
    const limit = req.query.limit || 5;
    const skip = (page - 1) * limit;

    const books = await BookModel.find({})
      .sort({ createdAt: -1 }) //descending order
      .skip(skip)
      .limit(limit)
      .populate("user", "username avatar");

    const totalBooks = await BookModel.countDocuments();

    res.status(200).json({
      books,
      currentPage: page,
      totalBooks,
      totalPages: Math.ceil(totalBooks / limit),
    });
  } catch (error) {
    console.error("Error fetching books:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});

//get recommended books by the user
router.get("/user", protectRoute, async (req, res) => {
  try {
    const books = await BookModel.find({ user: req.user._id }).sort({
      createdAt: -1,
    });
    res.status(200).json(books);
  } catch (error) {
    console.error("Error fetching user books:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});

//delete a book
router.delete("/:id", protectRoute, async (req, res) => {
  try {
    const book = await BookModel.findById(req.params.id);
    if (!book) return res.status(404).json({ message: "Book not found" });

    //check if use the creator of the book
    if (book.user.toString() !== req.user._id.toString()) {
      return res
        .status(403)
        .json({ message: "Unauthorized to delete this book" });
    }

    //delete the image from Cloudinary
    if (book.img && book.img.includes("cloudinary")) {
      try {
        const publicId = book.img.split("/").pop().split(".")[0]; // Extract public ID from URL
        await cloudinary.uploader.destroy(publicId);
      } catch (err) {
        console.error("Error deleting image from Cloudinary:", err);
      }
    }

    await book.deleteOne();

    res
      .status(200)
      .json({ success: true, message: "Book deleted successfully" });
  } catch (error) {
    console.error("Error deleting book:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});

export default router;
