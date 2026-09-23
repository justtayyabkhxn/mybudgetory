import mongoose, { Schema, Document } from "mongoose";

export const ASSET_MARKETS = ["indian_stock", "crypto", "precious_metal"] as const;
export type AssetMarket = (typeof ASSET_MARKETS)[number];

export interface IAssetValuation {
  _id: mongoose.Types.ObjectId;
  /** When the user read this value (date & time). */
  at: Date;
  /** Total current value of the holding, not per unit. */
  value: number;
}

export interface IAsset extends Document {
  userId: mongoose.Types.ObjectId;
  market: AssetMarket;
  name: string;
  quantity: number;
  /** Per-unit purchase price. */
  buyPrice: number;
  buyDate: Date;
  valuations: IAssetValuation[];
  createdAt: Date;
  updatedAt: Date;
}

const AssetSchema = new Schema<IAsset>(
  {
    userId:    { type: Schema.Types.ObjectId, ref: "User", required: true, index: true },
    market:    { type: String, enum: ASSET_MARKETS, required: true },
    name:      { type: String, required: true, trim: true, maxlength: 60 },
    quantity:  { type: Number, required: true, min: 0 },
    buyPrice:  { type: Number, required: true, min: 0 },
    buyDate:   { type: Date, required: true },
    valuations: [{
      at:    { type: Date, required: true },
      value: { type: Number, required: true, min: 0 },
    }],
  },
  { timestamps: true }
);

export default mongoose.models.Asset ||
  mongoose.model<IAsset>("Asset", AssetSchema);
