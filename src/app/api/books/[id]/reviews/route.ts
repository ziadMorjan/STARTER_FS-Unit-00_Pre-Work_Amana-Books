// src/app/api/books/[id]/reviews/route.ts

import { NextResponse } from 'next/server';
import dbConnect from '@/lib/dbConnect';
import Review from '@/models/Review';

export async function GET(
  request: Request,
  context: { params: Promise<{ id: string }> }
) {
  const { id } = await context.params; // ✅ must await in Next.js 15

  try {
    await dbConnect();

    const reviews = await Review.find({ bookId: id }).lean();

    return NextResponse.json(reviews);
  } catch (err: unknown) {
    console.error(`Error fetching reviews for book ${id}:`, err);

    if (err instanceof Error && err.name === 'CastError') {
      return NextResponse.json(
        { error: 'Invalid book ID format for fetching reviews' },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: 'Failed to fetch reviews' },
      { status: 500 }
    );
  }
}
