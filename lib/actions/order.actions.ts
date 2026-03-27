"use server"

import clientPromise from "@/lib/mongodb"
import { ObjectId } from "mongodb"
import User from "@/types/User"
import { auth } from "@/auth/auth"
import { revalidatePath } from "next/cache"
import Order from "@/types/Order"
import Room from "@/types/Room"



export async function createOrder(
    roomId: string, 
    checkInDate: string, 
    checkOutDate: string, 
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

export async function getAvailableRooms(
  checkInDate: Date, 
  checkOutDate: Date, 
  numberOfPeople: number
): Promise<{ success: boolean, rooms?: Room[], error?: string }> {
  
  const client = await clientPromise;
  const db = client.db(process.env.DB_NAME);
  
  try {
    const checkIn = new Date(checkInDate);
    const checkOut = new Date(checkOutDate);

    // 1. Валидация дат
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    if (checkIn < today) {
      return { success: false, error: "The check-in date cannot be in the past." };
    }

    if (checkOut <= checkIn) {
      return { success: false, error: "The check-out date must be later than the check-in date." };
    }

    // 2. Ищем пересечения в реальных ЗАКАЗАХ (Orders)
    const overlappingOrders = await db.collection("orders").find({
      status: { $in: ["CONFIRMED"] },
      $and: [
        { checkInDate: { $lt: checkOut } }, 
        { checkOutDate: { $gt: checkIn } }  
      ]
    }).project({ roomId: 1 }).toArray();

    // 3. Ищем пересечения в РУЧНЫХ БЛОКИРОВКАХ (BlockedDates)
    const overlappingBlocks = await db.collection("blocked_dates").find({
      $and: [
        { startDate: { $lt: checkOut } }, 
        { endDate: { $gt: checkIn } }  
      ]
    }).project({ roomId: 1 }).toArray();

    // 4. Собираем ВСЕ недоступные ID комнат в один массив
    const unavailableRoomIds = [
      ...overlappingOrders.map(order => new ObjectId(order.roomId)),
      ...overlappingBlocks.map(block => new ObjectId(block.roomId))
    ];

    // 5. Ищем комнаты, которых НЕТ в списке недоступных (БЕЗ фильтра по статусу)
    const rawRooms = await db.collection("rooms").find({
      _id: { $nin: unavailableRoomIds },
      capacity: { $gte: numberOfPeople }
    }).toArray();

    // 6. Форматируем результат строго по твоему интерфейсу Room
    const availableRooms: Room[] = rawRooms.map(room => ({
      id: room._id.toString(), 
      roomName: room.roomName,
      type: room.type,  
      price: room.price,
      capacity: room.capacity,
      photoUrl: room.photoUrl,
      status: "AVAILABLE",
    }));

    return { success: true, rooms: JSON.parse(JSON.stringify(availableRooms)) };

  } catch (error) {
    console.error("Database Error:", error);
    return { success: false, error: "An error occurred while searching for rooms." };
  }
}

export async function getUserOrders(): Promise<{ success: boolean, orders?: Order[], error?: string }> {
    const client = await clientPromise;
    const db = client.db(process.env.DB_NAME);
    const session = await auth();
    
    if (!session?.user?.id) {
        return { success: false, error: "Please log in to the system" };
    }

    try {
        let query = {};

        if (session.user.role === "ADMIN") {
            // Получаем начало сегодняшнего дня
            const today = new Date();
            today.setHours(0, 0, 0, 0);

            // Админу показываем все заказы, которые еще актуальны 
            // (дата выезда >= сегодня)
            query = {
                checkOutDate: { $gte: today }
            };
        } else {
            // Обычному пользователю показываем ТОЛЬКО его заказы
            query = {
                userId: new ObjectId(session.user.id)
            };
        }

        const orders = await db.collection<Order>("orders")
            .find(query)
            .sort({ checkInDate: 1 })
            .toArray();

        return { success: true, orders: JSON.parse(JSON.stringify(orders)) };
    } catch (error) {
        console.error("Database Error:", error);
        return { success: false, error: "Something went wrong" };
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

