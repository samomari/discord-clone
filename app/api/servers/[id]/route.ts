import { currentProfile } from "@/lib/current-profile";
import { NextResponse } from "next/server";
import { db } from "@/db/db";
import { server } from "@/db/schema";
import { eq, and } from "drizzle-orm";

export async function DELETE (
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = await params;
    const profile = await currentProfile();

    if (!profile) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const updatedServer = await db
      .delete(server)
      .where(
        and(
          eq(server.id, id),
          eq(server.profileId, profile.id)
        ) 
      )
      .returning();

    return NextResponse.json(updatedServer[0]);
      
  } catch (error) {
    console.log("[SERVER_ID_DELETE]",error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}

export async function PATCH (
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = await params;
    const profile = await currentProfile();
    const { name, imageUrl } = await req.json();

    if (!profile) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const updatedServer = await db
      .update(server)
      .set({ name: name, imageUrl: imageUrl })
      .where(
        and(
          eq(server.id, id),
          eq(server.profileId, profile.id)
        ) 
      )
      .returning();

    return NextResponse.json(updatedServer[0]);
      
  } catch (error) {
    console.log("[SERVER_ID_PATCH]",error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}