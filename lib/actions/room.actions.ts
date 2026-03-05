"use server" 

import clientPromise from "@/lib/mongodb"
import Room from "@/types/Room"
import { revalidatePath } from "next/cache"
import { ObjectId } from "mongodb"
import { auth } from "@/auth"

const client = await clientPromise
const db = client.db("courseWork")
const session = await auth()

export async function createRoom(formData: Room) {
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

export async function deleteRoom(roomId: string){
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
        const client = await clientPromise
        const db = client.db("courseWork")

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
