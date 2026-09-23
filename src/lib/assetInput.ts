import { ASSET_MARKETS, AssetMarket } from "@/models/Asset";

export interface AssetInput {
  market: AssetMarket;
  name: string;
  quantity: number;
  buyPrice: number;
  buyDate: Date;
}

/**
 * Validates an asset body. With [partial] only the fields present are
 * checked (PATCH). Returns the cleaned fields or an error message.
 */
export function parseAssetInput(
  body: Record<string, unknown>,
  partial = false,
): { data: Partial<AssetInput> } | { error: string } {
  const data: Partial<AssetInput> = {};
  const has = (k: string) => body[k] !== undefined && body[k] !== null && body[k] !== "";

  if (has("market")) {
    if (!ASSET_MARKETS.includes(body.market as AssetMarket)) return { error: "Invalid market" };
    data.market = body.market as AssetMarket;
  } else if (!partial) return { error: "Market is required" };

  if (has("name")) {
    const name = String(body.name).trim();
    if (!name || name.length > 60) return { error: "Name must be 1–60 characters" };
    data.name = name;
  } else if (!partial) return { error: "Name is required" };

  if (has("quantity")) {
    const q = Number(body.quantity);
    if (!Number.isFinite(q) || q <= 0) return { error: "Quantity must be more than 0" };
    data.quantity = q;
  } else if (!partial) return { error: "Quantity is required" };

  if (has("buyPrice")) {
    const p = Number(body.buyPrice);
    if (!Number.isFinite(p) || p < 0) return { error: "Buy price must be 0 or more" };
    data.buyPrice = p;
  } else if (!partial) return { error: "Buy price is required" };

  if (has("buyDate")) {
    const d = new Date(String(body.buyDate));
    if (isNaN(d.getTime())) return { error: "Invalid buy date" };
    data.buyDate = d;
  } else if (!partial) return { error: "Buy date is required" };

  return { data };
}
