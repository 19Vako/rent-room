"use server"

import clientPromise from "@/lib/mongodb"
import User from "@/types/User";
import bcrypt from "bcryptjs"

export async function registerUser(name: string, email: string, password: string) {
  try {
    if (!name || !email || !password) {
      return { success: false, error: "All fields are required" };
    }

    const client = await clientPromise;
    const db = client.db("courseWork");

    const existingUser = await db.collection("users").findOne({ email });
    if (existingUser) {
      return { success: false, error: "User with this email already exists" };
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser: User = {
      name,
      email,
      password: hashedPassword, 
      role: "GUEST",
      orders: [],
    };

    const result = await db.collection("users").insertOne(newUser);

    if (!result.insertedId) {
      return { success: false, error: "Failed to create user" };
    }

    return { success: true, message: "Registration successful" };

  } catch (error) {
    console.error("Registration error:", error);
    return { success: false, error: "Failed to create user" };
  }
}