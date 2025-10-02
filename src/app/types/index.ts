// src/app/types/index.ts

export interface Book {
  _id: string; // New MongoDB ID
  id?: string; // Old field is now optional
  title: string;
  author: string;
  description: string;
  price: number;
  image: string;
  isbn: string;
  genre: string[];
  tags: string[];
  datePublished: string;
  pages: number;
  language: string;
  publisher: string;
  rating: number;
  reviewCount: number;
  inStock: boolean;
  featured: boolean;
}

export interface CartItem {
  id: string;
  bookId: string; // Should map to Book._id
  quantity: number;
  addedAt: string;
}

export interface Review {
  _id: string; // New MongoDB ID
  id?: string; // Old field is now optional
  bookId: string; // Should map to Book._id
  author: string;
  rating: number;
  title: string;
  comment: string;
  timestamp: string;
  verified: boolean;
}