import mongoose, { Schema, Document } from "mongoose";

export interface IBudgetGoal extends Document {
  userId: mongoose.Types.ObjectId;
  category: string;
  limitAmount: number;
  month: number;
  year: number;
}

const BudgetGoalSchema = new Schema<IBudgetGoal>(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    category: { type: String, required: true },
    limitAmount: { type: Number, required: true },
    month: { type: Number, required: true },
    year: { type: Number, required: true },
  },
  { timestamps: true }
);

BudgetGoalSchema.index(
  { userId: 1, category: 1, month: 1, year: 1 },
  { unique: true }
);

export default mongoose.models.BudgetGoal ||
  mongoose.model<IBudgetGoal>("BudgetGoal", BudgetGoalSchema);
