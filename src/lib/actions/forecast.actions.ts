"use server";

import { auth } from "@/src/auth/auth";
import clientPromise from "@/src/lib/mongodb";
import {
  buildRoomForecast,
  type ForecastOrder,
  type RoomForecast,
} from "@/src/lib/utils/roomForecast";
import { ObjectId } from "mongodb";

export async function getRoomForecast(
  roomId: string,
): Promise<{ success: boolean; forecast?: RoomForecast; error?: string }> {
  const session = await auth();
  if (session?.user?.role !== "ADMIN") {
    return {
      success: false,
      error: "You do not have permission to view this analytics data.",
    };
  }

  if (!ObjectId.isValid(roomId)) {
    return { success: false, error: "Invalid room ID." };
  }

  try {
    const now = new Date();
    const historyStart = new Date(
      Date.UTC(now.getUTCFullYear(), now.getUTCMonth() - 11, 1),
    );
    const throughDate = new Date(
      Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate() + 1),
    );

    const client = await clientPromise;
    const orders = await client
      .db(process.env.DB_NAME)
      .collection("orders")
      .find({
        roomId: new ObjectId(roomId),
        status: "CONFIRMED",
        checkInDate: { $lt: throughDate },
        checkOutDate: { $gt: historyStart },
      })
      .project({
        status: 1,
        price: 1,
        checkInDate: 1,
        checkOutDate: 1,
      })
      .toArray();

    return {
      success: true,
      forecast: buildRoomForecast(orders as ForecastOrder[], now),
    };
  } catch (error) {
    console.error("Room forecast error:", error);
    return {
      success: false,
      error: "Could not load forecast data. Please try again.",
    };
  }
}
