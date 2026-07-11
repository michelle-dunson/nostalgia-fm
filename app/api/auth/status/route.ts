import { NextResponse } from "next/server";
import { isUserAuthenticated } from "@/lib/spotify-auth";

export async function GET() {
  return NextResponse.json({
    authenticated: await isUserAuthenticated(),
  });
}
