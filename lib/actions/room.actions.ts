"use server" 

import clientPromise from "@/lib/mongodb"
import Room from "@/types/Room"
import { revalidatePath } from "next/cache"
import { ObjectId } from "mongodb"
import { auth } from "@/auth"

const client = await clientPromise
const db = client.db(process.env.DB_NAME)
const session = await auth()

export async function getAllRooms() {
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

export async function getRoomById(roomId: string) {
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

export async function createRoom(formData: Omit<Room, "id">) {
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

export async function deleteRoom(roomId: string) {
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

export async function updateRoom(roomId: string, formData: Room) {
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

export async function addRoomImage(roomId: string, imageUrl: string) {
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

export async function removeRoomImage(roomId: string, imageUrl: string) {
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



