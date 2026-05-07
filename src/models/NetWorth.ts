import mongoose, { Schema, Document } from "mongoose";

export interface INetWorthSnapshot {
  date: Date;
  balance: number;
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
    date:    { type: Date, default: Date.now },
    balance: { type: Number, required: true },
  }],
});

export default mongoose.models.NetWorth ||
  mongoose.model<INetWorth>("NetWorth", NetWorthSchema);
