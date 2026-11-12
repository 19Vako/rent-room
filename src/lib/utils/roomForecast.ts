const DAY_MS = 24 * 60 * 60 * 1000;
const HISTORY_MONTHS = 12;
const FORECAST_MONTHS = 3;
const BASELINE_MONTHS = 6;
const MIN_ACTIVE_MONTHS = 3;

export interface ForecastOrder {
  status?: unknown;
  price?: unknown;
  checkInDate?: unknown;
  checkOutDate?: unknown;
}

export interface RoomForecastPoint {
  month: string;
  label: string;
  amount: number;
  kind: "actual" | "forecast";
}

export interface RoomForecast {
  points: RoomForecastPoint[];
  canForecast: boolean;
  activeBaselineMonths: number;
  ignoredOrderCount: number;
}

function parseDate(value: unknown): Date | null {
  const date =
    value instanceof Date
      ? value
      : typeof value === "string" || typeof value === "number"
        ? new Date(value)
        : null;

  return date && Number.isFinite(date.getTime()) ? date : null;
}

function monthKey(date: Date): string {
  return `${date.getUTCFullYear()}-${String(date.getUTCMonth() + 1).padStart(2, "0")}`;
}

function monthStart(offset: number, now: Date): Date {
  return new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth() + offset, 1));
}

function monthLabel(key: string): string {
  const [year, month] = key.split("-").map(Number);
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    year: "numeric",
    timeZone: "UTC",
  }).format(new Date(Date.UTC(year, month - 1, 1)));
}

export function buildRoomForecast(
  orders: readonly ForecastOrder[],
  now = new Date(),
): RoomForecast {
  const historyStart = monthStart(-(HISTORY_MONTHS - 1), now);
  const throughDate = Date.UTC(
    now.getUTCFullYear(),
    now.getUTCMonth(),
    now.getUTCDate() + 1,
  );
  const actualAmounts = new Map<string, number>();
  const monthKeys: string[] = [];
  let ignoredOrderCount = 0;

  for (let offset = -(HISTORY_MONTHS - 1); offset <= 0; offset += 1) {
    const key = monthKey(monthStart(offset, now));
    monthKeys.push(key);
    actualAmounts.set(key, 0);
  }

  for (const order of orders) {
    if (order.status !== "CONFIRMED") continue;
    if (typeof order.price !== "number") {
      ignoredOrderCount += 1;
      continue;
    }

    const checkIn = parseDate(order.checkInDate);
    const checkOut = parseDate(order.checkOutDate);
    if (
      !checkIn ||
      !checkOut ||
      !Number.isFinite(order.price) ||
      order.price < 0
    ) {
      ignoredOrderCount += 1;
      continue;
    }

    const checkInDay = Date.UTC(
      checkIn.getUTCFullYear(),
      checkIn.getUTCMonth(),
      checkIn.getUTCDate(),
    );
    const checkOutDay = Date.UTC(
      checkOut.getUTCFullYear(),
      checkOut.getUTCMonth(),
      checkOut.getUTCDate(),
    );
    const totalNights = (checkOutDay - checkInDay) / DAY_MS;
    if (totalNights <= 0) {
      ignoredOrderCount += 1;
      continue;
    }

    const firstIncludedDay = Math.max(checkInDay, historyStart.getTime());
    const lastIncludedDay = Math.min(checkOutDay, throughDate);

    for (let day = firstIncludedDay; day < lastIncludedDay; day += DAY_MS) {
      const key = monthKey(new Date(day));
      const currentAmount = actualAmounts.get(key);
      if (currentAmount !== undefined) {
        actualAmounts.set(key, currentAmount + order.price / totalNights);
      }
    }
  }

  const baselineKeys = monthKeys.slice(-BASELINE_MONTHS - 1, -1);
  const activeBaselineMonths = baselineKeys.filter(
    (key) => (actualAmounts.get(key) ?? 0) > 0,
  ).length;
  const canForecast = activeBaselineMonths >= MIN_ACTIVE_MONTHS;
  const averageMonthlyAmount = canForecast
    ? baselineKeys.reduce(
        (total, key) => total + (actualAmounts.get(key) ?? 0),
        0,
      ) / BASELINE_MONTHS
    : 0;

  const points: RoomForecastPoint[] = monthKeys.map((month) => ({
    month,
    label: monthLabel(month),
    amount: actualAmounts.get(month) ?? 0,
    kind: "actual",
  }));

  if (canForecast) {
    for (let offset = 1; offset <= FORECAST_MONTHS; offset += 1) {
      const month = monthKey(monthStart(offset, now));
      points.push({
        month,
        label: monthLabel(month),
        amount: averageMonthlyAmount,
        kind: "forecast",
      });
    }
  }

  return {
    points: points.map((point) => ({
      ...point,
      amount: Math.round(point.amount * 100) / 100,
    })),
    canForecast,
    activeBaselineMonths,
    ignoredOrderCount,
  };
}
