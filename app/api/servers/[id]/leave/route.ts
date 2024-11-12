import { db } from "@/db/db";
import { member, server } from "@/db/schema";
import { currentProfile } from "@/lib/current-profile";
import { eq, ne, and } from "drizzle-orm";
import { NextResponse } from "next/server";

export async function PATCH (
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

    const serverExists = await db
      .select()
      .from(server)
      .where(and(eq(server.id, id), ne(server.profileId, profile.id))) // Corrected: Ensure server's profileId is not equal to current profile's profileId
      .limit(1)
      .execute();   

    if (serverExists.length === 0) {
      return new NextResponse("Server not found or unauthorized", { status: 404 });
    }

    await db
      .delete(member)
      .where(and(eq(member.serverId, id), eq(member.profileId, profile.id)))  // Combine conditions in a single `where` clause
      .execute();

    return NextResponse.json({ message: "Successfully left the server" });

  } catch (error) {
    console.log("[SERVER_ID_LEAVE]", error);
    return new NextResponse("Internal Error", { status : 500});
  }
}