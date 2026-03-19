import mongoose, { Schema, Document } from "mongoose";

export interface IRecurringTransaction extends Document {
  userId: mongoose.Types.ObjectId;
  title: string;
  amount: string;
  category: string;
  type: "income" | "expense";
  paymentMode: "Cash" | "UPI";
  frequency: "daily" | "weekly" | "monthly";
  nextDate: Date;
  isActive: boolean;
}

const RecurringTransactionSchema = new Schema<IRecurringTransaction>(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    title: { type: String, required: true },
    amount: { type: String, required: true },
    category: { type: String, required: true },
    type: { type: String, enum: ["income", "expense"], required: true },
    paymentMode: { type: String, enum: ["Cash", "UPI"], required: true },
    frequency: {
      type: String,
      enum: ["daily", "weekly", "monthly"],
      required: true,
    },
    nextDate: { type: Date, required: true },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

export default mongoose.models.RecurringTransaction ||
  mongoose.model<IRecurringTransaction>(
    "RecurringTransaction",
    RecurringTransactionSchema
  );
