import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/dbConnect";
import Asset from "@/models/Asset";
import { getUserId, unauthorized } from "@/lib/auth";
import { parseAssetInput } from "@/lib/assetInput";
import { AssetLike, assetTotals, toAssetDTO } from "@/lib/assetSeries";

// GET /api/assets — every holding with derived value/gain, plus totals
export async function GET(req: NextRequest) {
  const userId = getUserId(req.headers.get("authorization") || "");
  if (!userId) return unauthorized();

  try {
    await connectDB();
    const docs = await Asset.find({ userId }).sort({ createdAt: 1 }).lean<AssetLike[]>();
    const assets = docs.map(toAssetDTO);
    return NextResponse.json({ assets, totals: assetTotals(assets) });
  } catch {
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}

// POST /api/assets — add a holding
export async function POST(req: NextRequest) {
  const userId = getUserId(req.headers.get("authorization") || "");
  if (!userId) return unauthorized();

  try {
    const parsed = parseAssetInput(await req.json().catch(() => ({})));
    if ("error" in parsed) return NextResponse.json({ error: parsed.error }, { status: 400 });

    await connectDB();
    const doc = await Asset.create({ ...parsed.data, userId, valuations: [] });
    return NextResponse.json(toAssetDTO(doc.toObject()), { status: 201 });
  } catch {
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
