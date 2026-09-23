/**
 * Asset valuation maths shared by the assets and net-worth routes.
 *
 * A holding is worth its cost (qty × buy price) from the buy date until the
 * user records a valuation; from then on it is worth the latest valuation
 * recorded at or before the moment asked about. Readings are not
 * interpolated — they are what the user asserted, and hold until the next.
 */

export interface AssetLike {
  _id?: unknown;
  market: string;
  name: string;
  quantity: number;
  buyPrice: number;
  buyDate: Date | string;
  valuations?: { _id?: unknown; at: Date | string; value: number }[];
}

const DAY_MS = 24 * 60 * 60 * 1000;
const round = (n: number) => Math.round(n * 100) / 100;

export function assetCost(a: AssetLike): number {
  return round((Number(a.quantity) || 0) * (Number(a.buyPrice) || 0));
}

function sortedValuations(a: AssetLike) {
  return (a.valuations ?? [])
    .map(v => ({ _id: v._id, at: new Date(v.at), value: Number(v.value) }))
    .filter(v => Number.isFinite(v.value) && !isNaN(v.at.getTime()))
    .sort((x, y) => x.at.getTime() - y.at.getTime());
}

/** Value of one holding at [atMs] (0 before it was bought). */
export function assetValueAt(a: AssetLike, atMs: number): number {
  if (new Date(a.buyDate).getTime() > atMs) return 0;
  let value = assetCost(a);
  for (const v of sortedValuations(a)) {
    if (v.at.getTime() > atMs) break;
    value = v.value;
  }
  return value;
}

/** Sum of every holding's value at the end of the UTC day starting at [dayMs]. */
export function assetsOnDay(assets: AssetLike[], dayMs: number): number {
  const end = dayMs + DAY_MS - 1;
  return round(assets.reduce((sum, a) => sum + assetValueAt(a, end), 0));
}

/** The shape both clients receive for a holding. */
export function toAssetDTO(a: AssetLike & { createdAt?: Date; updatedAt?: Date }) {
  const valuations = sortedValuations(a);
  const cost = assetCost(a);
  const last = valuations[valuations.length - 1];
  const currentValue = last ? last.value : cost;
  const gain = round(currentValue - cost);
  return {
    _id: String(a._id),
    market: a.market,
    name: a.name,
    quantity: a.quantity,
    buyPrice: a.buyPrice,
    buyDate: new Date(a.buyDate).toISOString(),
    valuations: valuations.map(v => ({ _id: String(v._id), at: v.at.toISOString(), value: v.value })),
    cost,
    currentValue,
    gain,
    gainPct: cost > 0 ? round((gain / cost) * 100) : 0,
    lastValuedAt: last ? last.at.toISOString() : null,
  };
}

export function assetTotals(dtos: ReturnType<typeof toAssetDTO>[]) {
  const cost = round(dtos.reduce((s, a) => s + a.cost, 0));
  const value = round(dtos.reduce((s, a) => s + a.currentValue, 0));
  return { cost, value, gain: round(value - cost) };
}
