export default interface Room {
    roomName:string,
    type: "STANDARD" | "DELUXE" | "SUITE",
    price: number,
    capacity: number,
    photoUrl: string[],
    status: "AVAILABLE" | "BOOKED" | "MAINTENANCE",
}