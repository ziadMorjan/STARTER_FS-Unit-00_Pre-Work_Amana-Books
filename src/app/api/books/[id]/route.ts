// src/app/api/books/[id]/route.ts

import { NextResponse } from 'next/server';
import dbConnect from '@/lib/dbConnect';
import Book from '@/models/Book';

export async function GET(
  request: Request,
  context: { params: Promise<{ id: string }> }
) {
  const { id } = await context.params; // ✅ must await in Next.js 15

  try {
    await dbConnect();

    const book = await Book.findById(id).lean();

    if (!book) {
      return NextResponse.json(
        { error: `Book with ID ${id} not found` },
        { status: 404 }
      );
    }

    return NextResponse.json(book);
  } catch (err: unknown) {
    console.error(`Error fetching book ${id}:`, err);

    if (err instanceof Error && err.name === 'CastError') {
      return NextResponse.json(
        { error: 'Invalid book ID format' },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: 'Failed to fetch book' },
      { status: 500 }
    );
  }
}
