import { ObjectId } from "mongodb";

export default interface BlockedDate {
  id?: string | ObjectId;
  roomId: string | ObjectId;
  startDate: Date;
  endDate: Date;
  reason: "MAINTENANCE" | "CLOSED";
  createdAt?: Date;
}
