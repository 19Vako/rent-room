"use server"

import clientPromise from "@/lib/mongodb"
import { ObjectId } from "mongodb"
import User from "@/types/User"
import { auth } from "@/auth"
import { revalidatePath } from "next/cache"
import Order from "@/types/Order"
import Room from "@/types/Room"



export async function createOrder(
    roomId: string, 
    checkInDate: Date, 
    checkOutDate: Date, 
    price: number,
    numberOfPeople: number,
): Promise<{ success: boolean, error?: string }> {
    const client = await clientPromise
    const db = client.db(process.env.DB_NAME)
    const session = await auth()
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
            numberOfPeople: numberOfPeople,
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
        return { success: true}

    } catch (error) {
        console.error("Database Error:", error)
        return { success: false, error: "Something went wrong" }
    }
}

export async function getAvailableRooms(checkInDate: Date, checkOutDate: Date, numberOfPeople: number): Promise<{ success: boolean, rooms?: Room[], error?: string }> {
    const client = await clientPromise
    const db = client.db(process.env.DB_NAME)
    try {

    const checkIn = new Date(checkInDate);
    const checkOut = new Date(checkOutDate);


    const overlappingOrders = await db.collection<Order>("orders").find({
      status: { $in: ["PENDING", "CONFIRMED"] },
      $and: [
        { checkInDate: { $lt: checkOut } }, 
        { checkOutDate: { $gt: checkIn } }  
      ]
    }).project({ roomId: 1 }).toArray();

 
    const bookedRoomIds = overlappingOrders.map(order => order.roomId);

    const rawRooms = await db.collection("rooms").find({
      _id: { $nin: bookedRoomIds },
      capacity: { $gte: numberOfPeople }
    }).toArray();

    const availableRooms: Room[] = rawRooms.map(room => ({
      id: room._id.toString(), 
      roomName: room.roomName,
      type: room.type,  
      price: room.price,
      capacity: room.capacity,
      photoUrl: room.photoUrl,
      status: room.status,
    }));


    return { success: true, rooms: JSON.parse(JSON.stringify(availableRooms)) };

  } catch (error) {
    console.error("Database Error:", error)
    return { success: false, error: "Something went wrong" }
  }
}

export async function cancelOrder(orderId: string): Promise<{ success: boolean, error?: string }> {
    const client = await clientPromise
    const db = client.db(process.env.DB_NAME)
    const session = await auth()
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

