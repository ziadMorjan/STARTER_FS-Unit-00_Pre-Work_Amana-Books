// src/app/cart/page.tsx
'use client';

import React, { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { Book, CartItem } from '../types';

// Simple fetcher for API calls
const fetcher = (url: string) => fetch(url).then(res => {
  if (!res.ok) throw new Error('Failed to fetch book details');
  return res.json();
});

// A simple utility to get cart items from localStorage
const getLocalCart = (): CartItem[] => {
  const storedCart = localStorage.getItem('cart');
  return storedCart ? JSON.parse(storedCart) : [];
};

// Define a new type for cart display items (extends CartItem with more info)
interface CartDisplayItem extends CartItem {
  bookTitle: string;
  price: number;
  image: string;
  author?: string;
  itemTotal: number;
  found: boolean;
}

export default function CartPage() {
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [bookDetails, setBookDetails] = useState<Record<string, Book>>({});
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Function to load cart data and fetch book details
  const loadAndFetchCart = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    const localCart = getLocalCart();
    setCartItems(localCart);

    if (localCart.length === 0) {
      setIsLoading(false);
      return;
    }

    // Get unique book IDs from the local cart
    const uniqueBookIds = Array.from(new Set(localCart.map(item => item.bookId)));

    try {
      // Fetch details for all unique books concurrently
      const detailPromises = uniqueBookIds.map(id => fetcher(`/api/books/${id}`));
      const details = await Promise.all(detailPromises);

      // Map the details by their ID
      const detailsMap: Record<string, Book> = details.reduce((acc, book) => {
        acc[book._id || book.id] = book;
        return acc;
      }, {} as Record<string, Book>);

      setBookDetails(detailsMap);
    } catch (err) {
      console.error(err);
      setError('Could not load current book details from the store.');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadAndFetchCart();
    // Set up event listener for cart updates
    const handleCartUpdate = () => loadAndFetchCart();
    window.addEventListener('cartUpdated', handleCartUpdate);

    return () => {
      window.removeEventListener('cartUpdated', handleCartUpdate);
    };
  }, [loadAndFetchCart]);

  // Handle quantity change
  const handleUpdateQuantity = (cartItemId: string, newQuantity: number) => {
    if (newQuantity < 1) return;

    const updatedCart = cartItems.map(item =>
      item.id === cartItemId ? { ...item, quantity: newQuantity } : item
    );
    setCartItems(updatedCart);
    localStorage.setItem('cart', JSON.stringify(updatedCart));
  };

  // Handle item removal
  const handleRemoveItem = (cartItemId: string) => {
    const updatedCart = cartItems.filter(item => item.id !== cartItemId);
    setCartItems(updatedCart);
    localStorage.setItem('cart', JSON.stringify(updatedCart));
    // Reload book details
    loadAndFetchCart();
  };

  if (isLoading) {
    return <div className="text-center py-20">Loading shopping cart...</div>;
  }

  if (error) {
    return <div className="text-center py-20 text-red-500">Error: {error}</div>;
  }

  if (cartItems.length === 0) {
    return (
      <div className="text-center py-20">
        <h1 className="text-3xl font-bold mb-4">Your Cart is Empty</h1>
        <p className="text-gray-600">
          Looks like you haven&apos;t added anything to your cart yet.
        </p>
        <Link href="/" className="text-teal-500 hover:underline mt-4 inline-block">
          Start Shopping
        </Link>
      </div>
    );
  }

  // --- Render Logic: Calculate total and prepare display data ---
  let subtotal = 0;
  const cartDisplayItems: CartDisplayItem[] = cartItems.map(item => {
    const book = bookDetails[item.bookId];
    if (!book) {
      return {
        ...item,
        bookTitle: 'Book Details Unavailable',
        price: 0,
        image: '',
        author: undefined,
        itemTotal: 0,
        found: false,
      };
    }
    const itemTotal = book.price * item.quantity;
    subtotal += itemTotal;
    return {
      ...item,
      bookTitle: book.title,
      price: book.price,
      image: book.image,
      author: book.author,
      itemTotal,
      found: true,
    };
  });

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold text-gray-800 mb-8">Shopping Cart</h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Cart Items List */}
        <div className="lg:col-span-2 space-y-6">
          {cartDisplayItems.map(item => (
            <div
              key={item.id}
              className="flex items-center bg-white p-4 rounded-lg shadow-md border border-gray-200"
            >
              <div className="w-16 h-20 bg-gray-200 flex-shrink-0 rounded-md overflow-hidden mr-4 flex items-center justify-center">
                {/* Book Image or Placeholder */}
                <div className="text-3xl text-gray-400">📚</div>
              </div>

              <div className="flex-grow">
                {item.found ? (
                  <>
                    <Link
                      href={`/book/${item.bookId}`}
                      className="text-lg font-semibold text-gray-800 hover:text-teal-600 transition-colors"
                    >
                      {item.bookTitle}
                    </Link>
                    {item.author && (
                      <p className="text-sm text-gray-600 mb-1">by {item.author}</p>
                    )}
                    <p className="text-md font-bold text-teal-600">
                      ${item.price.toFixed(2)}
                    </p>
                  </>
                ) : (
                  <p className="text-lg font-semibold text-red-500">
                    {item.bookTitle} (Not Available)
                  </p>
                )}
              </div>

              <div className="flex items-center space-x-4">
                <input
                  type="number"
                  min="1"
                  value={item.quantity}
                  onChange={(e) =>
                    handleUpdateQuantity(item.id, parseInt(e.target.value))
                  }
                  className="w-16 p-2 border border-gray-300 rounded-md text-center"
                />
                <span className="text-lg font-semibold text-gray-800 w-20 text-right">
                  ${item.itemTotal.toFixed(2)}
                </span>
                <button
                  onClick={() => handleRemoveItem(item.id)}
                  className="text-red-500 hover:text-red-700 transition-colors"
                  aria-label="Remove item"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-6 w-6"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M6 18L18 6M6 6l12 12"
                    />
                  </svg>
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Cart Summary */}
        <div className="lg:col-span-1 bg-white p-6 rounded-lg shadow-xl h-fit sticky top-4">
          <h2 className="text-2xl font-bold text-gray-800 mb-4 border-b pb-2">
            Order Summary
          </h2>

          <div className="flex justify-between text-lg mb-2">
            <span>Subtotal ({cartItems.length} items)</span>
            <span className="font-semibold">${subtotal.toFixed(2)}</span>
          </div>

          <div className="flex justify-between text-lg mb-6 border-b pb-4">
            <span>Shipping</span>
            <span className="font-semibold text-green-600">FREE</span>
          </div>

          <div className="flex justify-between text-xl font-extrabold text-gray-800 mb-6">
            <span>Order Total</span>
            <span>${subtotal.toFixed(2)}</span>
          </div>

          <button className="w-full bg-teal-500 text-white py-3 rounded-md hover:bg-teal-600 transition-colors duration-300 text-lg font-semibold">
            Proceed to Checkout
          </button>
        </div>
      </div>
    </div>
  );
}
