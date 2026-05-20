"use server";

import clientPromise from "@/src/lib/mongodb";
import { ObjectId } from "mongodb";
import User from "@/src/types/User";
import { auth } from "@/src/auth/auth";
import { revalidatePath } from "next/cache";
import Order from "@/src/types/Order";
import Room from "@/src/types/Room";

export async function createOrder(
  roomId: string,
  checkInDate: string,
  checkOutDate: string,
  price: number,
  numberOfPeople: number,
): Promise<{ success: boolean; error?: string }> {
  const client = await clientPromise;
  const db = client.db(process.env.DB_NAME);

  const session = await auth();
  if (!session?.user?.id) {
    return { success: false, error: "Please log in to the system" };
  }

  try {
    const overlappingBlock = await db.collection("blocked_dates").findOne({
      roomId: new ObjectId(roomId),
      $and: [
        { startDate: { $lt: new Date(checkOutDate) } },
        { endDate: { $gt: new Date(checkInDate) } },
      ],
    });

    if (overlappingBlock) {
      return {
        success: false,
        error: "This room is closed for maintenance on the selected dates",
      };
    }

    const overlappingOrder = await db.collection("orders").findOne({
      roomId: new ObjectId(roomId),
      status: "CONFIRMED",
      $and: [
        { checkInDate: { $lt: new Date(checkOutDate) } },
        { checkOutDate: { $gt: new Date(checkInDate) } },
      ],
    });

    if (overlappingOrder) {
      return {
        success: false,
        error: "This room is already booked for the selected dates",
      };
    }

    const newOrder = {
      userId: new ObjectId(session.user.id),
      numberOfPeople: numberOfPeople,
      roomId: new ObjectId(roomId),
      price: price,
      checkInDate: new Date(checkInDate),
      checkOutDate: new Date(checkOutDate),
      orderDate: new Date(),
      status: "CONFIRMED",
    };

    const result = await db.collection("orders").insertOne(newOrder);

    await db
      .collection<User>("users")
      .updateOne(
        { _id: new ObjectId(session.user.id) },
        { $push: { orders: result.insertedId } },
      );

    revalidatePath("/");
    return { success: true };
  } catch (error) {
    console.error("Database Error:", error);
    return { success: false, error: "Something went wrong" };
  }
}

export async function getAvailableRooms(
  checkInDate: Date,
  checkOutDate: Date,
  numberOfPeople: number,
): Promise<{ success: boolean; rooms?: Room[]; error?: string }> {
  const client = await clientPromise;
  const db = client.db(process.env.DB_NAME);

  try {
    const checkIn = checkInDate;
    const checkOut = checkOutDate;

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    if (checkIn < today) {
      return {
        success: false,
        error: "The check-in date cannot be in the past.",
      };
    }

    if (checkOut <= checkIn) {
      return {
        success: false,
        error: "The check-out date must be later than the check-in date.",
      };
    }

    const overlappingOrders = await db
      .collection("orders")
      .find({
        status: { $in: ["CONFIRMED"] },
        $and: [
          { checkInDate: { $lt: checkOut } },
          { checkOutDate: { $gt: checkIn } },
        ],
      })
      .project({ roomId: 1 })
      .toArray();

    const overlappingBlocks = await db
      .collection("blocked_dates")
      .find({
        $and: [{ startDate: { $lt: checkOut } }, { endDate: { $gt: checkIn } }],
      })
      .project({ roomId: 1 })
      .toArray();

    const unavailableRoomIds = [
      ...overlappingOrders.map((order) => new ObjectId(order.roomId)),
      ...overlappingBlocks.map((block) => new ObjectId(block.roomId)),
    ];

    const rawRooms = await db
      .collection("rooms")
      .find({
        _id: { $nin: unavailableRoomIds },
        capacity: { $gte: numberOfPeople },
      })
      .toArray();

    const availableRooms: Room[] = rawRooms.map((room) => ({
      id: room._id.toString(),
      roomName: room.roomName,
      type: room.type,
      description: room.description,
      price: room.price,
      capacity: room.capacity,
      photoUrl: room.photoUrl,
      status: "AVAILABLE",
    }));

    return { success: true, rooms: JSON.parse(JSON.stringify(availableRooms)) };
  } catch (error) {
    console.error("Database Error:", error);
    return {
      success: false,
      error: "An error occurred while searching for rooms.",
    };
  }
}

export async function getUserOrders(): Promise<{
  success: boolean;
  orders?: Order[];
  error?: string;
}> {
  const client = await clientPromise;
  const db = client.db(process.env.DB_NAME);
  const session = await auth();

  if (!session?.user?.id) {
    return { success: false, error: "Please log in to the system" };
  }

  try {
    let query = {};

    if (session.user.role === "ADMIN") {
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      query = {
        checkOutDate: { $gte: today },
      };
    } else {
      query = {
        userId: new ObjectId(session.user.id),
      };
    }

    const orders = await db
      .collection<Order>("orders")
      .find(query)
      .sort({ checkInDate: 1 })
      .toArray();

    const formattedOrders = orders.reverse().map((order) => {
      const { _id, ...rest } = order;
      return {
        id: _id.toString(),
        ...rest,
      };
    });

    return {
      success: true,
      orders: JSON.parse(JSON.stringify(formattedOrders)),
    };
  } catch (error) {
    console.error("Database Error:", error);
    return { success: false, error: "Something went wrong" };
  }
}

export async function getRoomOrders(
  roomId: string,
): Promise<{ success: boolean; orders?: Order[]; error?: string }> {
  const client = await clientPromise;
  const db = client.db(process.env.DB_NAME);
  const session = await auth();

  if (!session?.user?.id) {
    return { success: false, error: "Please log in to the system" };
  }

  if (session.user.role !== "ADMIN") {
    return {
      success: false,
      error: "You do not have permission to view this data",
    };
  }

  try {
    const orders = await db
      .collection("orders")
      .find({ roomId: new ObjectId(roomId) })
      .sort({ checkInDate: 1 })
      .toArray();

    const formattedOrders = orders.reverse().map((order) => {
      const { _id, ...rest } = order;
      return {
        id: _id.toString(),
        ...rest,
      };
    });

    return {
      success: true,
      orders: JSON.parse(JSON.stringify(formattedOrders)),
    };
  } catch (error) {
    console.error("Database Error:", error);
    return { success: false, error: "Something went wrong" };
  }
}

export async function cancelOrder(
  orderId: string,
): Promise<{ success: boolean; error?: string }> {
  const client = await clientPromise;
  const db = client.db(process.env.DB_NAME);
  const session = await auth();
  if (!session?.user?.id) {
    return { success: false, error: "Please log in to the system" };
  }

  try {
    const order = await db
      .collection("orders")
      .findOne({ _id: new ObjectId(orderId) });

    if (!order) {
      return { success: false, error: "Order not found" };
    }

    if (order.userId.toString() !== session.user.id) {
      return { success: false, error: "You can only cancel your own orders" };
    }

    await db
      .collection("orders")
      .updateOne(
        { _id: new ObjectId(orderId) },
        { $set: { status: "CANCELLED" } },
      );

    revalidatePath("/");
    return { success: true };
  } catch (error) {
    console.error("Database Error:", error);
    return { success: false, error: "Something went wrong" };
  }
}
