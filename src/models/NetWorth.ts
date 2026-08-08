import mongoose, { Schema, Document } from "mongoose";

export interface INetWorthSnapshot {
  date: Date;
  balance: number;
  /** True when the point was interpolated to fill a gap, not actually recorded. */
  estimated?: boolean;
}

export interface INetWorth extends Document {
  userId: string;
  bankBalance: number;
  history: INetWorthSnapshot[];
}

const NetWorthSchema: Schema = new Schema({
  userId:      { type: String, required: true, unique: true },
  bankBalance: { type: Number, default: 0 },
  history: [{
    date:      { type: Date, default: Date.now },
    balance:   { type: Number, required: true },
    estimated: { type: Boolean, default: false },
  }],
});

export default mongoose.models.NetWorth ||
  mongoose.model<INetWorth>("NetWorth", NetWorthSchema);
