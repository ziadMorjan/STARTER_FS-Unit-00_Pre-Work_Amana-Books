import mongoose from 'mongoose';
import dbConnect from '../src/lib/dbConnect';
import Book from '../src/models/Book';
import Review from '../src/models/Review';
import { books } from '../src/app/data/books';
import { reviews } from '../src/app/data/reviews';

async function seedDatabase() {
  try {
    await dbConnect();
    console.log('Connected to database for seeding.');

    // Clear existing data
    console.log('Deleting old data...');
    await Book.deleteMany({});
    await Review.deleteMany({});
    console.log('Old data deleted.');

    // Insert books
    console.log('Inserting books...');
    // Mongoose models expect Date objects for Date fields
    const booksWithDateObjects = books.map(book => ({
      ...book,
      datePublished: new Date(book.datePublished)
    }));
    const insertedBooks = await Book.insertMany(booksWithDateObjects);
    console.log(`${insertedBooks.length} books inserted.`);

    // Create a map from old string ID to new MongoDB ObjectId
    const bookIdMap = new Map<string, mongoose.Types.ObjectId>();
    insertedBooks.forEach((book, index) => {
      // 'books[index].id' is the original static ID like "1", "2", etc.
      bookIdMap.set(books[index].id, book._id);
    });

    // Transform reviews to use new book IDs
    const transformedReviews = reviews.map(review => {
      const newBookId = bookIdMap.get(review.bookId);
      if (!newBookId) {
        console.warn(`Could not find new ID for old bookId: ${review.bookId}`);
        return null;
      }
      return {
        ...review,
        bookId: newBookId,
        timestamp: new Date(review.timestamp),
      };
    }).filter(review => review !== null); // Filter out any reviews that couldn't be mapped

    // Insert reviews
    console.log('Inserting reviews...');
    if (transformedReviews.length > 0) {
      const insertedReviews = await Review.insertMany(transformedReviews);
      console.log(`${insertedReviews.length} reviews inserted.`);
    } else {
      console.log('No reviews to insert.');
    }

    console.log('Database seeded successfully!');

  } catch (error) {
    console.error('Error seeding database:', error);
  } finally {
    // Close the connection
    await mongoose.connection.close();
    console.log('Database connection closed.');
  }
}

seedDatabase();