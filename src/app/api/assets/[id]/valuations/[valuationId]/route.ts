import { NextRequest, NextResponse } from "next/server";
import mongoose from "mongoose";
import connectDB from "@/lib/dbConnect";
import Asset from "@/models/Asset";
import { getUserId, unauthorized } from "@/lib/auth";
import { AssetLike, toAssetDTO } from "@/lib/assetSeries";

type Ctx = { params: Promise<{ id: string; valuationId: string }> };

// DELETE /api/assets/:id/valuations/:valuationId
export async function DELETE(req: NextRequest, { params }: Ctx) {
  const userId = getUserId(req.headers.get("authorization") || "");
  if (!userId) return unauthorized();
  const { id, valuationId } = await params;
  if (!mongoose.Types.ObjectId.isValid(id) || !mongoose.Types.ObjectId.isValid(valuationId)) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  try {
    await connectDB();
    const doc = await Asset.findOneAndUpdate(
      { _id: id, userId },
      { $pull: { valuations: { _id: valuationId } } },
      { new: true },
    ).lean<AssetLike>();
    if (!doc) return NextResponse.json({ error: "Asset not found" }, { status: 404 });
    return NextResponse.json(toAssetDTO(doc));
  } catch {
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
