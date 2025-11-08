"use server"
import { auth } from "./auth"; 
import { headers } from "next/headers";

// lib/server.ts
export async function getSession() {
  return auth.api.getSession({ headers: await headers() });
}
