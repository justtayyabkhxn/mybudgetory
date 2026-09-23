import { NextRequest, NextResponse } from "next/server";
import mongoose from "mongoose";
import connectDB from "@/lib/dbConnect";
import Asset from "@/models/Asset";
import { getUserId, unauthorized } from "@/lib/auth";
import { parseAssetInput } from "@/lib/assetInput";
import { AssetLike, toAssetDTO } from "@/lib/assetSeries";

type Ctx = { params: Promise<{ id: string }> };

const notFound = () => NextResponse.json({ error: "Asset not found" }, { status: 404 });

// PATCH /api/assets/:id — edit a holding's details
export async function PATCH(req: NextRequest, { params }: Ctx) {
  const userId = getUserId(req.headers.get("authorization") || "");
  if (!userId) return unauthorized();
  const { id } = await params;
  if (!mongoose.Types.ObjectId.isValid(id)) return notFound();

  try {
    const parsed = parseAssetInput(await req.json().catch(() => ({})), true);
    if ("error" in parsed) return NextResponse.json({ error: parsed.error }, { status: 400 });

    await connectDB();
    const doc = await Asset.findOneAndUpdate(
      { _id: id, userId },
      { $set: parsed.data },
      { new: true, runValidators: true },
    ).lean<AssetLike>();
    if (!doc) return notFound();
    return NextResponse.json(toAssetDTO(doc));
  } catch {
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}

// DELETE /api/assets/:id
export async function DELETE(req: NextRequest, { params }: Ctx) {
  const userId = getUserId(req.headers.get("authorization") || "");
  if (!userId) return unauthorized();
  const { id } = await params;
  if (!mongoose.Types.ObjectId.isValid(id)) return notFound();

  try {
    await connectDB();
    const deleted = await Asset.findOneAndDelete({ _id: id, userId });
    if (!deleted) return notFound();
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
