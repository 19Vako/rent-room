import { ObjectId } from "mongodb";

export default interface Room {
  id: string | ObjectId;
  roomName: string;
  type: "STANDARD" | "DELUXE" | "SUITE";
  description: string;
  price: number;
  capacity: number;
  photoUrl: string[];
  status?: "AVAILABLE" | "MAINTENANCE" | "CLOSED";
}
