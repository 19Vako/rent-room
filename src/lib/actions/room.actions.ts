"use server";
import { UTApi } from "uploadthing/server";
import clientPromise from "@/src/lib/mongodb";
import Room from "@/src/types/Room";
import { revalidatePath } from "next/cache";
import { ObjectId } from "mongodb";
import { auth } from "@/src/auth/auth";
import BlockedDate from "@/src/types/BlockedDate";

const utapi = new UTApi();

export async function getAllRooms(): Promise<{
  success: boolean;
  rooms?: Omit<Room[], "status">;
  error?: string;
}> {
  const client = await clientPromise;
  const db = client.db(process.env.DB_NAME);

  try {
    const rooms = await db.collection("rooms").find().toArray();

    const formattedRooms = rooms.map((room) => {
      const { _id, ...rest } = room;
      return {
        id: _id.toString(),
        ...rest,
      };
    }) as Room[];

    return { success: true, rooms: formattedRooms };
  } catch (error) {
    console.error("Database Error:", error);
    return { success: false, error: "Something went wrong" };
  }
}

export async function getRoomById(
  roomId: string,
): Promise<{ success: boolean; room?: Room; error?: string }> {
  const client = await clientPromise;
  const db = client.db(process.env.DB_NAME);

  try {
    const room = await db.collection("rooms").findOne({
      _id: new ObjectId(roomId),
    });

    if (!room) {
      return { success: false, error: "Room not found" };
    }

    const { _id, ...rest } = room;
    const formattedRoom = {
      id: _id.toString(),
      ...rest,
      status: "AVAILABLE",
    } as Room;

    return { success: true, room: formattedRoom };
  } catch (error) {
    console.error("Database Error:", error);
    return { success: false, error: "Something went wrong" };
  }
}

export async function blockRoomDates(
  roomId: string,
  startDate: string,
  endDate: string,
  reason: string,
): Promise<{ success: boolean; error?: string }> {
  const client = await clientPromise;
  const db = client.db(process.env.DB_NAME);

  try {
    const start = new Date(`${startDate}T00:00:00.000Z`);
    const end = new Date(`${endDate}T23:59:59.999Z`);

    if (end < start) {
      return { success: false, error: "End date cannot be before start date." };
    }

    const existingBlock = await db.collection("blocked_dates").findOne({
      roomId: new ObjectId(roomId),
      startDate: { $lte: end },
      endDate: { $gte: start },
    });

    if (existingBlock) {
      return {
        success: false,
        error: "Some of these dates are already blocked.",
      };
    }

    const existingOrder = await db.collection("orders").findOne({
      roomId: new ObjectId(roomId),
      status: "CONFIRMED",
      checkInDate: { $lte: end },
      checkOutDate: { $gte: start },
    });

    if (existingOrder) {
      return {
        success: false,
        error: "Cannot block dates: there is an active booking.",
      };
    }

    await db.collection("blocked_dates").insertOne({
      roomId: new ObjectId(roomId),
      startDate: start,
      endDate: end,
      reason: reason,
      createdAt: new Date(),
    });

    revalidatePath("/admin");
    return { success: true };
  } catch (error) {
    console.error("Error blocking dates:", error);
    return {
      success: false,
      error: "Something went wrong while blocking dates.",
    };
  }
}

export async function unblockRoomDates(
  roomId: string,
  startDate: string,
  endDate: string,
): Promise<{ success: boolean; error?: string }> {
  const client = await clientPromise;
  const db = client.db(process.env.DB_NAME);
  const session = await auth();

  if (session?.user?.role !== "ADMIN") {
    throw new Error("Only admins can unblock dates");
  }

  try {
    const uStart = new Date(`${startDate}T00:00:00.000Z`);
    const uEnd = new Date(`${endDate}T23:59:59.999Z`);

    const uStartMs = new Date(`${startDate}T00:00:00.000Z`).getTime();
    const uEndMs = new Date(`${endDate}T00:00:00.000Z`).getTime();
    const DAY_MS = 24 * 60 * 60 * 1000;

    const overlappingBlocks = await db
      .collection<Omit<BlockedDate, "id"> & { _id: ObjectId }>("blocked_dates")
      .find({
        roomId: new ObjectId(roomId),
        startDate: { $lte: uEnd },
        endDate: { $gte: uStart },
      })
      .toArray();

    if (overlappingBlocks.length === 0) {
      return { success: true };
    }

    const blocksToDelete: ObjectId[] = [];
    const blocksToInsert: BlockedDate[] = [];

    for (const block of overlappingBlocks) {
      blocksToDelete.push(block._id);

      const bStartMs = new Date(
        new Date(block.startDate).toISOString().split("T")[0] +
          "T00:00:00.000Z",
      ).getTime();
      const bEndMs = new Date(
        new Date(block.endDate).toISOString().split("T")[0] + "T00:00:00.000Z",
      ).getTime();

      if (uStartMs <= bStartMs && uEndMs >= bEndMs) {
        continue;
      } else if (uStartMs <= bStartMs && uEndMs < bEndMs) {
        blocksToInsert.push({
          roomId: block.roomId,
          reason: block.reason,
          startDate: new Date(uEndMs + DAY_MS),
          endDate: block.endDate,
          createdAt: new Date(),
        });
      } else if (uStartMs > bStartMs && uEndMs >= bEndMs) {
        blocksToInsert.push({
          roomId: block.roomId,
          reason: block.reason,
          startDate: block.startDate,
          endDate: new Date(uStartMs - 1),
          createdAt: new Date(),
        });
      } else if (uStartMs > bStartMs && uEndMs < bEndMs) {
        blocksToInsert.push({
          roomId: block.roomId,
          reason: block.reason,
          startDate: block.startDate,
          endDate: new Date(uStartMs - 1),
        });

        blocksToInsert.push({
          roomId: block.roomId,
          reason: block.reason,
          startDate: new Date(uEndMs + DAY_MS),
          endDate: block.endDate,
        });
      }
    }

    if (blocksToDelete.length > 0) {
      await db.collection("blocked_dates").deleteMany({
        _id: { $in: blocksToDelete },
      });
    }

    if (blocksToInsert.length > 0) {
      await db.collection("blocked_dates").insertMany(blocksToInsert);
    }

    revalidatePath("/admin");
    return { success: true };
  } catch (error) {
    console.error("Error unblocking dates:", error);
    return {
      success: false,
      error: "Something went wrong while unblocking dates.",
    };
  }
}

export async function createRoom(
  formData: Omit<Room, "id" | "status">,
): Promise<{ success: boolean; roomId?: string; error?: string }> {
  const client = await clientPromise;
  const db = client.db(process.env.DB_NAME);
  const session = await auth();

  if (session?.user?.role !== "ADMIN") {
    return { success: false, error: "Only admins can create rooms" };
  }

  try {
    const trimmedName = formData.roomName.trim();

    const existingRoom = await db.collection("rooms").findOne({
      roomName: { $regex: new RegExp(`^${trimmedName}$`, "i") },
    });

    if (existingRoom) {
      return { success: false, error: "A room with this name already exists" };
    }

    const roomToInsert = {
      roomName: trimmedName,
      type: formData.type,
      price: Number(formData.price),
      capacity: Number(formData.capacity),
      description: formData.description,
      photoUrl: [],
    };

    const newRoom = await db.collection("rooms").insertOne(roomToInsert);

    revalidatePath("/admin");

    return { success: true, roomId: newRoom.insertedId.toString() };
  } catch (error) {
    console.error("Database Error:", error);

    return {
      success: false,
      error: "Failed to create room. Check data format.",
    };
  }
}

export async function deleteRoom(
  roomId: string,
): Promise<{ success: boolean; deletedCount?: number; error?: string }> {
  const client = await clientPromise;
  const db = client.db(process.env.DB_NAME);
  const session = await auth();
  if (session?.user?.role !== "ADMIN") {
    throw new Error("Only admins can delete rooms");
  }

  try {
    const deletedRoom = await db.collection("rooms").deleteOne({
      _id: new ObjectId(roomId),
    });

    revalidatePath("/admin");

    return { success: true, deletedCount: deletedRoom.deletedCount };
  } catch (error) {
    console.error("Database Error:", error);
    return { success: false, error: "Something went wrong" };
  }
}

export async function updateRoom(
  roomId: string,
  formData: Pick<
    Room,
    "roomName" | "type" | "capacity" | "price" | "description"
  >,
): Promise<{ success: boolean; updatedCount?: number; error?: string }> {
  const client = await clientPromise;
  const db = client.db(process.env.DB_NAME);
  const session = await auth();
  if (session?.user?.role !== "ADMIN") {
    throw new Error("Only admins can update rooms");
  }

  const updateData = {
    roomName: formData.roomName,
    type: formData.type,
    capacity: Number(formData.capacity),
    price: Number(formData.price),
    description: formData.description,
  };

  try {
    const updatedRoom = await db
      .collection("rooms")
      .updateOne({ _id: new ObjectId(roomId) }, { $set: { ...updateData } });

    revalidatePath("/admin");

    return { success: true, updatedCount: updatedRoom.modifiedCount };
  } catch (error) {
    console.error("Database Error:", error);
    return { success: false, error: "Something went wrong" };
  }
}

export async function getRoomCalendarEvents(roomId: string) {
  const client = await clientPromise;
  const db = client.db(process.env.DB_NAME);

  try {
    const orders = await db
      .collection("orders")
      .find({ roomId: new ObjectId(roomId), status: "CONFIRMED" })
      .toArray();

    const blockedDates = await db
      .collection("blocked_dates")
      .find({ roomId: new ObjectId(roomId) })
      .toArray();

    return {
      success: true,
      orders: JSON.parse(JSON.stringify(orders)),
      blockedDates: JSON.parse(JSON.stringify(blockedDates)),
    };
  } catch (error) {
    console.error("Error fetching calendar events:", error);
    return { success: false, error: "Failed to fetch events" };
  }
}

export async function addRoomImage(
  roomId: string,
  imageUrl: string,
): Promise<{ success: boolean; updatedCount?: number; error?: string }> {
  const client = await clientPromise;
  const db = client.db(process.env.DB_NAME);
  const session = await auth();
  if (session?.user?.role !== "ADMIN") {
    throw new Error("Only admins can add images to rooms");
  }

  try {
    const updatedRoom = await db
      .collection<Room>("rooms")
      .updateOne(
        { _id: new ObjectId(roomId) },
        { $push: { photoUrl: imageUrl } },
      );

    revalidatePath("/");

    return { success: true, updatedCount: updatedRoom.modifiedCount };
  } catch (error) {
    console.error("Database Error:", error);
    return { success: false, error: "Something went wrong" };
  }
}

export async function removeRoomImage(
  roomId: string,
  imageUrl: string,
): Promise<{ success: boolean; updatedCount?: number; error?: string }> {
  const client = await clientPromise;
  const db = client.db(process.env.DB_NAME);
  const session = await auth();

  if (session?.user?.role !== "ADMIN") {
    throw new Error("Only admins can remove images from rooms");
  }

  try {
    const fileKey = imageUrl.split("/").pop();

    if (fileKey) {
      await utapi.deleteFiles(fileKey);
    } else {
      console.warn("Could not extract file key from URL:", imageUrl);
    }

    const updatedRoom = await db
      .collection<Room>("rooms")
      .updateOne(
        { _id: new ObjectId(roomId) },
        { $pull: { photoUrl: imageUrl } },
      );

    revalidatePath("/admin");

    return { success: true, updatedCount: updatedRoom.modifiedCount };
  } catch (error) {
    console.error("Database Error:", error);
    return { success: false, error: "Something went wrong" };
  }
}
