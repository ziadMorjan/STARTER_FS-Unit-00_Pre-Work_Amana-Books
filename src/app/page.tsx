// src/app/page.tsx
'use client';

import { useState } from 'react';
import useSWR from 'swr'; // Import SWR for data fetching
import BookGrid from './components/BookGrid';
import { Book } from './types'; // Import the updated Book type
// import { books } from './data/books'; // REMOVE: No longer needed

// Simple fetcher function for useSWR
const fetcher = (url: string) => fetch(url).then(res => {
  if (!res.ok) {
    throw new Error('Failed to fetch books');
  }
  return res.json();
});

export default function HomePage() {
  // Fetch all books from the API
  const { data: books, error, isLoading } = useSWR<Book[]>('/api/books', fetcher);

  // Simple cart handler for demo purposes (the ID passed here is Book._id)
  const handleAddToCart = (bookId: string) => {
    console.log(`Added book ${bookId} to cart`);
    // Note: The Cart page refactor will handle updating local storage/API calls.
  };

  if (error) {
    return <div className="text-center py-10 text-red-600">Failed to load books: {error.message}</div>;
  }

  if (isLoading) {
    return <div className="text-center py-10">Loading books...</div>;
  }

  // Handle case where data is loaded but empty
  if (!books || books.length === 0) {
    return <div className="text-center py-10 text-gray-600">No books found in the store.</div>;
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Welcome Section */}
      <section className="text-center bg-teal-100 p-8 rounded-lg mb-12 shadow-md">
        <h1 className="text-4xl font-extrabold text-gray-800 mb-2">Welcome to the Amana Bookstore!</h1>
        <p className="text-lg text-gray-600">
          Your one-stop shop for the best books. Discover new worlds and adventures.
        </p>
      </section>

      {/* Book Grid */}
      <BookGrid books={books} onAddToCart={handleAddToCart} />
    </div>
  );
}