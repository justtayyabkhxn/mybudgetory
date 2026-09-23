import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/dbConnect";
import NetWorth from "@/models/NetWorth";
import Asset from "@/models/Asset";
import { getUserId, unauthorized } from "@/lib/auth";
import { assetsOnDay, AssetLike } from "@/lib/assetSeries";

/** UTC midnight of the day the given date falls in. */
function toUTCDay(d: Date): number {
  return Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate());
}

/**
 * Bank balance + daily history. Each history point also carries `assets`, the
 * total asset value at the end of that day, so clients can draw the Assets and
 * Total (balance + assets) lines without their own valuation logic.
 */
export async function GET(req: NextRequest) {
  const userId = getUserId(req.headers.get("authorization") || "");
  if (!userId) return unauthorized();

  try {
    await connectDB();
    const [doc, assets] = await Promise.all([
      NetWorth.findOne({ userId }).lean<{ bankBalance?: number; history?: { date: Date; balance: number; estimated?: boolean }[] }>(),
      Asset.find({ userId }).lean<AssetLike[]>(),
    ]);

    // .lean() skips schema casting, and some older rows store balance/date as
    // strings — coerce them so clients never do `"96500" + 0` string concat.
    const history = (doc?.history ?? [])
      .map(h => ({ ...h, date: new Date(h.date), balance: Number(h.balance) }))
      .filter(h => Number.isFinite(h.balance) && !isNaN(h.date.getTime()))
      .sort((a, b) => a.date.getTime() - b.date.getTime())
      .map(h => ({
        ...h,
        assets: assets.length ? assetsOnDay(assets, toUTCDay(h.date)) : 0,
      }));

    const assetsTotal = assets.length ? assetsOnDay(assets, toUTCDay(new Date())) : 0;

    return NextResponse.json({
      bankBalance: doc?.bankBalance ?? 0,
      assetsTotal,
      history,
    });
  } catch {
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
