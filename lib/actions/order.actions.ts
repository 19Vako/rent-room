"use server"

import clientPromise from "@/lib/mongodb"
import { ObjectId } from "mongodb"
import User from "@/types/User"
import { auth } from "@/auth"
import { revalidatePath } from "next/cache"

const client = await clientPromise
const db = client.db("courseWork")
const session = await auth()


export async function createOrder(
    roomId: string, 
    checkInDate: Date, 
    checkOutDate: Date, 
    price: number
) {
    
    if (!session?.user?.id) {
        return { success: false, error: "Please log in to the system" }
    }

    try {

        const overlappingOrder = await db.collection("orders").findOne({
            roomId: new ObjectId(roomId),
            status: { $in: ["PENDING", "CONFIRMED"] },
            $and: [
                { checkInDate: { $lt: new Date(checkOutDate) } },
                { checkOutDate: { $gt: new Date(checkInDate) } }
            ]
        })

        if (overlappingOrder) {
            return { 
                success: false, 
                error: "this room is already booked for the selected dates" 
            }
        }

        const newOrder = {
            userId: new ObjectId(session.user.id),
            roomId: new ObjectId(roomId),
            price: price,
            checkInDate: new Date(checkInDate),
            checkOutDate: new Date(checkOutDate),
            orderDate: new Date(),
            status: "PENDING"
        }

        const result = await db.collection("orders").insertOne(newOrder)
      
        await db.collection<User>("users").updateOne(
            { _id: new ObjectId(session.user.id) },
            { $push: { orders: result.insertedId } }
        )

        revalidatePath("/")  
        return { success: true, orderId: result.insertedId }

    } catch (error) {
        console.error("Database Error:", error)
        return { success: false, error: "Something went wrong" }
    }
}

export async function cancelOrder(orderId: string) {
    if (!session?.user?.id) {
        return { success: false, error: "Please log in to the system" }
    }

    try {
        const order = await db.collection("orders").findOne({ _id: new ObjectId(orderId) })

        if (!order) {
            return { success: false, error: "Order not found" }
        }

        if (order.userId.toString() !== session.user.id) {
            return { success: false, error: "You can only cancel your own orders" }
        }

        await db.collection("orders").updateOne(
            { _id: new ObjectId(orderId) },
            { $set: { status: "CANCELLED" } }
        )

        revalidatePath("/")  
        return { success: true }
    }catch (error){
        console.error("Database Error:", error)
        return { success: false, error: "Something went wrong" }
    }
}

