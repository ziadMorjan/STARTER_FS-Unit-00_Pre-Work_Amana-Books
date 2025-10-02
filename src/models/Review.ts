import mongoose, { Schema, Document } from 'mongoose';

export interface IReview extends Document {
  bookId: mongoose.Schema.Types.ObjectId;
  author: string;
  rating: number;
  title: string;
  comment: string;
  timestamp: Date;
  verified: boolean;
}

const ReviewSchema: Schema = new Schema({
  bookId: { type: Schema.Types.ObjectId, ref: 'Book', required: true },
  author: { type: String, required: true },
  rating: { type: Number, required: true, min: 1, max: 5 },
  title: { type: String, required: true },
  comment: { type: String, required: true },
  timestamp: { type: Date, default: Date.now },
  verified: { type: Boolean, default: false },
});

export default mongoose.models.Review || mongoose.model<IReview>('Review', ReviewSchema);