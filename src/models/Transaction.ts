import mongoose, { Schema, Document } from "mongoose";

export interface ITransaction extends Document {
  userId: mongoose.Types.ObjectId;
  title: string;
  amount: string;
  category: string;
  type: "income" | "expense";
  date: Date;
  comment?: string;
  paymentMode?: "Cash" | "UPI";
}

const TransactionSchema = new Schema<ITransaction>(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    title: { type: String, required: true },
    amount: { type: String, required: true },
    category: { type: String, required: true },
    type: { type: String, enum: ["income", "expense"], required: true },
    date: { type: Date, required: true },
    comment: { type: String, default: "" },
    paymentMode: { type: String, enum: ["Cash", "UPI"] },
  },
  { timestamps: true }
);

// Indexes for fast per-user queries
TransactionSchema.index({ userId: 1, date: -1 });
TransactionSchema.index({ userId: 1, type: 1 });
TransactionSchema.index({ userId: 1, category: 1 });

export default mongoose.models.Transaction ||
  mongoose.model<ITransaction>("Transaction", TransactionSchema);
