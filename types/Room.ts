import { ObjectId } from "mongodb";

export default interface Room {
    id?: string | ObjectId,
    roomName:string,
    type: "STANDARD" | "DELUXE" | "SUITE",
    price: number,
    capacity: number,
    photoUrl: string[],
    status: "AVAILABLE" | "BOOKED" | "MAINTENANCE",
}