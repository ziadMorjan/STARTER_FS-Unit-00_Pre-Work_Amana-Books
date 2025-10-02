// src/app/api/books/[id]/route.ts

import { NextResponse } from 'next/server';
import dbConnect from '@/lib/dbConnect';
import Book from '@/models/Book';

// Define the shape of the request parameters
interface Context {
  params: {
    id: string; // The book ID from the URL segment
  };
}

// GET /api/books/[id] - Return a single book
export async function GET(request: Request, context: Context) {
  const { id } = context.params;

  try {
    await dbConnect();

    // Find the book by its MongoDB ObjectId (_id)
    const book = await Book.findById(id).lean();

    if (!book) {
      return NextResponse.json(
        { error: `Book with ID ${id} not found` },
        { status: 404 }
      );
    }

    return NextResponse.json(book);
  } catch (err:any) {
    console.error(`Error fetching book ${id}:`, err);
    
    // Mongoose CastError often indicates an invalid ID format
    if (err.name === 'CastError') {
      return NextResponse.json(
        { error: 'Invalid book ID format' },
        { status: 400 }
      );
    }

    // General server error
    return NextResponse.json(
      { error: 'Failed to fetch book' },
      { status: 500 }
    );
  }
}
