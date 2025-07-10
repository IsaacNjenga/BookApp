import mongoose from "mongoose";

const bookSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    caption: { type: String, required: true },
    rating: { type: Number, required: true, min: 1, max: 5 },
    img: { type: String, required: true },
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  },
  { collection: "books", timestamps: true }
);

const BookModel = mongoose.model("Book", bookSchema);

export default BookModel;
