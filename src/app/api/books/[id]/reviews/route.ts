// src/app/api/books/[id]/reviews/route.ts

import { NextResponse } from 'next/server';
import dbConnect from '@/lib/dbConnect';
import Review from '@/models/Review';

// Define the shape of the request parameters
interface Context {
  params: {
    id: string; // The book ID from the URL segment
  };
}

// GET /api/books/[id]/reviews - Returns all reviews for a specific book ID
export async function GET(request: Request, context: Context) {
  const { id } = context.params;

  try {
    await dbConnect();

    // 1. Query the Review model for all reviews where 'bookId' matches the URL ID
    const reviews = await Review.find({ bookId: id }).lean();

    // Note: It's okay if reviews is an empty array; the book might just have no reviews yet.
    return NextResponse.json(reviews);
  } catch (err:any) {
    console.error(`Error fetching reviews for book ${id}:`, err);

    // Handle Mongoose CastError for invalid ID format
    if (err.name === 'CastError') {
      return NextResponse.json(
        { error: 'Invalid book ID format for fetching reviews' },
        { status: 400 }
      );
    }

    // General server error
    return NextResponse.json(
      { error: 'Failed to fetch reviews' },
      { status: 500 }
    );
  }
}