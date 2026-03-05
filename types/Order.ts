import { ObjectId } from "mongodb";
export default interface Order {
    userId: ObjectId | string,
    roomId: ObjectId | string,
    price: number,
    checkInDate: Date,
    checkOutDate: Date,
    orderDate: Date,
    status: "PENDING" | "CONFIRMED" | "CANCELLED",
}