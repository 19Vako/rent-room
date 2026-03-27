"use server" 

import clientPromise from "@/lib/mongodb"
import Room from "@/types/Room"
import { revalidatePath } from "next/cache"
import { ObjectId } from "mongodb"
import { auth } from "@/auth/auth"



export async function getAllRooms(): Promise<{ success: boolean, rooms?: Room[], error?: string }> {
    const client = await clientPromise
    const db = client.db(process.env.DB_NAME)

    try {
        const rooms = await db.collection("rooms").find().toArray();
             
        const formattedRooms = rooms.map((room) => {
            const { _id, ...rest } = room;  
            return {
                id: _id.toString(),
                ...rest
            };
        }) as Room[];

        return { success: true, rooms: formattedRooms };
    } catch (error) {
        console.error("Database Error:", error);
        return { success: false, error: "Something went wrong" };
    }
}

export async function getRoomById(roomId: string): Promise<{ success: boolean, room?: Room, error?: string }> {
    const client = await clientPromise
    const db = client.db(process.env.DB_NAME)

    try {
        const room = await db.collection("rooms").findOne({
            _id: new ObjectId(roomId)
        });

        if (!room) {
            return { success: false, error: "Room not found" };
        }

        const { _id, ...rest } = room;
        const formattedRoom = {
            id: _id.toString(),
            ...rest
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
  reason: Room["status"]
): Promise<{ success: boolean; error?: string }> {
  
  const client = await clientPromise;
  const db = client.db(process.env.DB_NAME);

  try {
    const start = new Date(`${startDate}T00:00:00.000Z`);
    const end = new Date(`${endDate}T23:59:59.999Z`);

    // Простая валидация дат
    if (end < start) {
      return { success: false, error: "End date cannot be before start date." };
    }

    // Записываем блокировку в новую коллекцию
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
    return { success: false, error: "Something went wrong while blocking dates." };
  }
}

export async function createRoom(formData: Omit<Room, "id">): Promise<{ success: boolean, roomId?: ObjectId, error?: string }> {
    const client = await clientPromise
    const db = client.db(process.env.DB_NAME)
    const session = await auth()
  if (session?.user?.role !== "ADMIN") {
    throw new Error("Only admins can create rooms")
  }

  try {
    const newRoom = await db.collection("rooms").insertOne({
      ...formData,
    })

    revalidatePath("/") 
    return { success: true, roomId: newRoom.insertedId }
  } catch (error) {
    console.error("Database Error:", error)
    return { success: false, error: "Something went wrong" }
  }
}

export async function deleteRoom(roomId: string): Promise<{ success: boolean, deletedCount?: number, error?: string }> {
    const client = await clientPromise
    const db = client.db(process.env.DB_NAME)
    const session = await auth()
    if (session?.user?.role !== "ADMIN") {
        throw new Error("Only admins can delete rooms")
    }

    try {
        const deletedRoom = await db.collection("rooms").deleteOne({
            _id: new ObjectId(roomId)    
        })

        revalidatePath("/")

        return { success: true, deletedCount: deletedRoom.deletedCount }
    } catch (error) {

        console.error("Database Error:", error)
        return { success: false, error: "Something went wrong" }

    }
}

export async function updateRoom(roomId: string, formData: Omit<Room, "status">): Promise<{ success: boolean, updatedCount?: number, error?: string }> {
    const client = await clientPromise
    const db = client.db(process.env.DB_NAME)
    const session = await auth()
    if (session?.user?.role !== "ADMIN") {
        throw new Error("Only admins can update rooms")
    }

    try {
        const updatedRoom = await db.collection("rooms").updateOne(
            { _id: new ObjectId(roomId) },
            { $set: { ...formData } }
        )

        revalidatePath("/")

        return { success: true, updatedCount: updatedRoom.modifiedCount }
    } catch (error) {
        console.error("Database Error:", error)
        return { success: false, error: "Something went wrong" }
    }
}

export async function getRoomCalendarEvents(roomId: string) {
  const client = await clientPromise;
  const db = client.db(process.env.DB_NAME);

  try {
    
    const orders = await db.collection("orders")
      .find({ roomId: new ObjectId(roomId), status: "CONFIRMED" })
      .toArray();

    const blockedDates = await db.collection("blocked_dates")
      .find({ roomId: new ObjectId(roomId) })
      .toArray();

    return { 
      success: true, 
      orders: JSON.parse(JSON.stringify(orders)), 
      blockedDates: JSON.parse(JSON.stringify(blockedDates)) 
    };
  } catch (error) {
    console.error("Error fetching calendar events:", error);
    return { success: false, error: "Failed to fetch events" };
  }
}

export async function addRoomImage(roomId: string, imageUrl: string): Promise<{ success: boolean, updatedCount?: number, error?: string }> {
    const client = await clientPromise
    const db = client.db(process.env.DB_NAME)
    const session = await auth()
    if (session?.user?.role !== "ADMIN") {
        throw new Error("Only admins can add images to rooms")
    }

    try {
        const updatedRoom = await db.collection<Room>("rooms").updateOne(
            { _id: new ObjectId(roomId) },
            { $push: { images: imageUrl } }
        )

        revalidatePath("/")

        return { success: true, updatedCount: updatedRoom.modifiedCount }
    } catch (error) {
        console.error("Database Error:", error)
        return { success: false, error: "Something went wrong" }
    }
}

export async function removeRoomImage(roomId: string, imageUrl: string): Promise<{ success: boolean, updatedCount?: number, error?: string }> {
    const client = await clientPromise
    const db = client.db(process.env.DB_NAME)
    const session = await auth()
    
    if (session?.user?.role !== "ADMIN") {
        throw new Error("Only admins can remove images from rooms")
    }

    try {
        const updatedRoom = await db.collection<Room>("rooms").updateOne(
            { _id: new ObjectId(roomId) },
            { $pull: { images: imageUrl } }
        )

        revalidatePath("/")

        return { success: true, updatedCount: updatedRoom.modifiedCount }
    } catch (error) {
        console.error("Database Error:", error)
        return { success: false, error: "Something went wrong" }
    }
}



