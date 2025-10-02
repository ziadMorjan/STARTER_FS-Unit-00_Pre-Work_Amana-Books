import mongoose, { Schema, Document } from 'mongoose';

// Interface to define the properties for a Book document
export interface IBook extends Document {
  title: string;
  author: string;
  description: string;
  price: number;
  image: string;
  isbn: string;
  genre: string[];
  tags: string[];
  datePublished: Date;
  pages: number;
  language: string;
  publisher: string;
  rating: number;
  reviewCount: number;
  inStock: boolean;
  featured: boolean;
}

const BookSchema: Schema = new Schema({
  title: { type: String, required: true },
  author: { type: String, required: true },
  description: { type: String, required: true },
  price: { type: Number, required: true },
  image: { type: String },
  isbn: { type: String, required: true },
  genre: [{ type: String }],
  tags: [{ type: String }],
  datePublished: { type: Date, required: true },
  pages: { type: Number, required: true },
  language: { type: String, required: true },
  publisher: { type: String, required: true },
  rating: { type: Number, default: 0 },
  reviewCount: { type: Number, default: 0 },
  inStock: { type: Boolean, default: true },
  featured: { type: Boolean, default: false },
});

// Prevent model recompilation in Next.js
export default mongoose.models.Book || mongoose.model<IBook>('Book', BookSchema);