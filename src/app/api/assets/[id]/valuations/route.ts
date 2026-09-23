import { NextRequest, NextResponse } from "next/server";
import mongoose from "mongoose";
import connectDB from "@/lib/dbConnect";
import Asset from "@/models/Asset";
import { getUserId, unauthorized } from "@/lib/auth";
import { AssetLike, toAssetDTO } from "@/lib/assetSeries";

type Ctx = { params: Promise<{ id: string }> };

const DAY_MS = 24 * 60 * 60 * 1000;

// POST /api/assets/:id/valuations — record the holding's total current value
export async function POST(req: NextRequest, { params }: Ctx) {
  const userId = getUserId(req.headers.get("authorization") || "");
  if (!userId) return unauthorized();
  const { id } = await params;
  if (!mongoose.Types.ObjectId.isValid(id)) {
    return NextResponse.json({ error: "Asset not found" }, { status: 404 });
  }

  try {
    const body = await req.json().catch(() => ({}));
    const value = Number(body.value);
    if (!Number.isFinite(value) || value < 0) {
      return NextResponse.json({ error: "Value must be 0 or more" }, { status: 400 });
    }
    const at = body.at ? new Date(String(body.at)) : new Date();
    if (isNaN(at.getTime())) {
      return NextResponse.json({ error: "Invalid date" }, { status: 400 });
    }
    // A day of slack for client clock / timezone differences
    if (at.getTime() > Date.now() + DAY_MS) {
      return NextResponse.json({ error: "Date can't be in the future" }, { status: 400 });
    }

    await connectDB();
    const doc = await Asset.findOneAndUpdate(
      { _id: id, userId },
      { $push: { valuations: { $each: [{ at, value }], $sort: { at: 1 } } } },
      { new: true },
    ).lean<AssetLike>();
    if (!doc) return NextResponse.json({ error: "Asset not found" }, { status: 404 });
    return NextResponse.json(toAssetDTO(doc));
  } catch {
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
