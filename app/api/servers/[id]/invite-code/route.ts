import { db } from "@/db/db";
import { currentProfile } from "@/lib/current-profile";
import { NextResponse } from "next/server";
import { server } from "@/db/schema";
import { v4 as uuidv4 } from "uuid";
import { and, eq } from "drizzle-orm";

export async function PATCH(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = await params;
    const profile = await currentProfile();

    if (!profile) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    if (!id) {
      return new NextResponse("Server ID Missing", { status: 400 });
    }

    const updatedServer = await db
      .update(server)
      .set({ inviteCode: uuidv4() })
      .where(
        and(
          eq(server.id, id),
          eq(server.profileId, profile.id)
        )
      )
      .returning();
    
    return NextResponse.json(updatedServer[0]); 
  } catch (error) {
    console.log("[SERVER_ID]",error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}