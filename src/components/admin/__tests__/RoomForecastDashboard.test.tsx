import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { getRoomForecast } from "@/src/lib/actions/forecast.actions";
import RoomForecastDashboard from "../RoomForecastDashboard";
import type Room from "@/src/types/Room";

jest.mock("@/src/lib/actions/forecast.actions", () => ({
  getRoomForecast: jest.fn(),
}));

const mockGetRoomForecast = jest.mocked(getRoomForecast);

const rooms: Room[] = [
  {
    id: "room-one",
    roomName: "Room 1",
    type: "STANDARD",
    description: "",
    price: 100,
    capacity: 2,
    photoUrl: [],
  },
  {
    id: "room-two",
    roomName: "Room 2",
    type: "DELUXE",
    description: "",
    price: 150,
    capacity: 3,
    photoUrl: [],
  },
];

describe("RoomForecastDashboard", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("shows booking values, forecast, and profit limitations", async () => {
    mockGetRoomForecast.mockResolvedValue({
      success: true,
      forecast: {
        canForecast: true,
        activeBaselineMonths: 3,
        ignoredOrderCount: 0,
        points: [
          {
            month: "2026-11",
            label: "Nov 2026",
            amount: 500,
            kind: "actual",
          },
          {
            month: "2026-12",
            label: "Dec 2026",
            amount: 300,
            kind: "forecast",
          },
        ],
      },
    });

    render(<RoomForecastDashboard rooms={rooms} />);

    expect(await screen.findAllByText("Forecast")).not.toHaveLength(0);
    expect(screen.getByText("UAH 500")).toBeInTheDocument();
    expect(screen.getByText("UAH 300")).toBeInTheDocument();
    expect(
      screen.getByText(/Profit forecasting is unavailable/),
    ).toBeInTheDocument();
    expect(mockGetRoomForecast).toHaveBeenCalledWith("room-one");
  });

  it("loads the selected room and reports errors", async () => {
    mockGetRoomForecast
      .mockResolvedValueOnce({
        success: false,
        error: "Could not load the forecast.",
      })
      .mockResolvedValueOnce({
        success: false,
        error: "Room forecast failed.",
      });

    render(<RoomForecastDashboard rooms={rooms} />);
    expect(await screen.findByRole("alert")).toHaveTextContent(
      "Could not load the forecast.",
    );

    fireEvent.change(screen.getByLabelText("Select a room"), {
      target: { value: "room-two" },
    });
    await waitFor(() =>
      expect(mockGetRoomForecast).toHaveBeenLastCalledWith("room-two"),
    );
    expect(await screen.findByRole("alert")).toHaveTextContent(
      "Room forecast failed.",
    );
  });

  it("handles an empty room list", () => {
    render(<RoomForecastDashboard rooms={[]} />);

    expect(screen.getByText("No rooms available")).toBeInTheDocument();
    expect(mockGetRoomForecast).not.toHaveBeenCalled();
  });
});
