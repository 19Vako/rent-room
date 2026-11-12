import { buildRoomForecast, type ForecastOrder } from "../roomForecast";

const now = new Date("2026-11-12T10:00:00.000Z");

describe("buildRoomForecast", () => {
  it("allocates booking value across months by occupied nights", () => {
    const result = buildRoomForecast(
      [
        {
          status: "CONFIRMED",
          price: 300,
          checkInDate: "2026-10-30",
          checkOutDate: "2026-11-02",
        },
      ],
      now,
    );

    expect(result.points.find((point) => point.month === "2026-10")?.amount).toBe(
      200,
    );
    expect(result.points.find((point) => point.month === "2026-11")?.amount).toBe(
      100,
    );
    expect(result.points.every((point) => point.kind === "actual")).toBe(true);
  });

  it("excludes cancelled, invalid, and future-night booking values", () => {
    const orders: ForecastOrder[] = [
      {
        status: "CANCELLED",
        price: 500,
        checkInDate: "2026-11-10",
        checkOutDate: "2026-11-12",
      },
      {
        status: "CONFIRMED",
        price: Number.NaN,
        checkInDate: "2026-11-10",
        checkOutDate: "2026-11-12",
      },
      {
        status: "CONFIRMED",
        price: 500,
        checkInDate: "2026-11-13",
        checkOutDate: "2026-11-15",
      },
    ];

    const result = buildRoomForecast(orders, now);

    expect(result.points.find((point) => point.month === "2026-11")?.amount).toBe(
      0,
    );
    expect(result.canForecast).toBe(false);
    expect(result.ignoredOrderCount).toBe(1);
  });

  it("forecasts three months using the average of six completed months", () => {
    const result = buildRoomForecast(
      [
        {
          status: "CONFIRMED",
          price: 600,
          checkInDate: "2026-06-01",
          checkOutDate: "2026-06-03",
        },
        {
          status: "CONFIRMED",
          price: 1200,
          checkInDate: "2026-08-01",
          checkOutDate: "2026-08-03",
        },
        {
          status: "CONFIRMED",
          price: 1800,
          checkInDate: "2026-10-01",
          checkOutDate: "2026-10-03",
        },
      ],
      now,
    );

    expect(result.canForecast).toBe(true);
    expect(result.activeBaselineMonths).toBe(3);
    expect(
      result.points
        .filter((point) => point.kind === "forecast")
        .map((point) => [point.month, point.amount]),
    ).toEqual([
      ["2026-12", 600],
      ["2027-01", 600],
      ["2027-02", 600],
    ]);
  });

  it("does not forecast with fewer than three active baseline months", () => {
    const result = buildRoomForecast(
      [
        {
          status: "CONFIRMED",
          price: 400,
          checkInDate: "2026-10-01",
          checkOutDate: "2026-10-02",
        },
      ],
      now,
    );

    expect(result.canForecast).toBe(false);
    expect(result.points).toHaveLength(12);
  });
});
