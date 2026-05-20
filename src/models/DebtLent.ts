import mongoose, { Schema, Document } from "mongoose";

export interface IDebtLent extends Document {
  userId: mongoose.Types.ObjectId;
  type: "debt" | "lent";
  person: string;
  amount: number;
  paidAmount: number;
  reason?: string;
  dateAdded: Date;
  dueDate?: Date;
  status: string;
  createdAt: Date;
  updatedAt: Date;
}

const DebtLentSchema = new Schema<IDebtLent>(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    type: { type: String, enum: ["debt", "lent"], required: true },
    person: { type: String, required: true },
    amount: { type: Number, required: true },
    paidAmount: { type: Number, default: 0 },
    reason: { type: String },
    dateAdded: { type: Date, default: Date.now },
    dueDate: { type: Date },
    status: { type: String, required: true },
  },
  { timestamps: true }
);

export default mongoose.models.DebtLent ||
  mongoose.model<IDebtLent>("DebtLent", DebtLentSchema);
