import { ObjectId } from "mongodb"

export default interface User {
    name:string,
    password:string,
    email:string,
    role: "GUEST" | "ADMIN",
    orders: ObjectId[],
}