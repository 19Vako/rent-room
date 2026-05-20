import { ObjectId } from "mongodb";

export default interface Order {
  id?: string;
  userId: ObjectId | string;
  numberOfPeople: number;
  roomId: ObjectId | string;
  price: number;
  checkInDate: Date;
  checkOutDate: Date;
  orderDate: Date;
  status: "CONFIRMED" | "CANCELLED";
}
