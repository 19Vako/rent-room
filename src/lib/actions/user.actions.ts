"use server";

import clientPromise from "@/src/lib/mongodb";
import { signOut, signIn } from "@/src/auth/auth";
import User from "@/src/types/User";
import bcrypt from "bcryptjs";

export async function registerUser(
  email: string,
  password: string,
) {
  try {
    if (!email || !password) {
      return { success: false, error: "All fields are required" };
    }

    const client = await clientPromise;
    const db = client.db(process.env.DB_NAME);

    const existingUser = await db.collection("users").findOne({ email });
    if (existingUser) {
        const res = await signIn("credentials", {
          email,
          password,
          redirect: false,
        })
       if (res?.error) {
          return { success: false, error: "Failed to log in" };  
       }
      return { success: true, message: "log in successful" };
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const isAdmin = email === process.env.ADMIN_EMAIL;

    const newUser: User = {
      name: "",
      email,
      password: hashedPassword,
      role: isAdmin ? "ADMIN" : "GUEST",
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

export async function logout() {
  await signOut({ redirectTo: "/login" });
}
