// src/app/api/books/route.ts

import { NextResponse } from 'next/server';
// 1. Import DB connection utility and Mongoose Model
import dbConnect from '@/lib/dbConnect';
import Book from '@/models/Book';

// GET /api/books - Return all books from MongoDB
export async function GET() {
  try {
    // 2. Connect to the database
    await dbConnect();

    // 3. Fetch all books
    // Using .lean() makes the query faster by returning plain JavaScript objects instead of Mongoose Documents
    const books = await Book.find({}).lean();
    
    return NextResponse.json(books);
  } catch (err) {
    console.error('Error fetching books from MongoDB:', err);
    
    // Return a 500 status code for database/server errors
    return NextResponse.json(
      { error: 'Failed to fetch books from the database' },
      { status: 500 }
    );
  }
}
