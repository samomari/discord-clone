import { currentProfile } from "@/lib/current-profile";
import { NextResponse } from "next/server";
import { db } from "@/db/db";
import { channel, member } from "@/db/schema";
import { eq, and, ne, or } from "drizzle-orm";
import { MemberRole } from "@/types";

export async function DELETE(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = await params;
    const profile = await currentProfile();
    const { searchParams } = new URL(req.url);
    const serverId = searchParams.get("serverId");

    if (!profile) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    if (!serverId) {
      return new NextResponse("Server ID Missing", { status: 400 });
    }

    if (!id) {
      return new NextResponse("Channel ID Missing", { status: 400 });
    }

    const memberRecord = await db
      .select()
      .from(member)
      .where(
        and(
          eq(member.serverId, serverId),
          eq(member.profileId, profile.id),
          or(
            eq(member.role, MemberRole.ADMIN),
            eq(member.role, MemberRole.MODERATOR)
          )
        )
      )
      .limit(1)
      .execute();

    if (memberRecord.length === 0) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    await db
      .delete(channel)
      .where(
        and(
          eq(channel.id, id), 
          eq(channel.serverId, serverId), 
          ne(channel.name, "general")))
      .execute();

      return NextResponse.json({ message: "Channel deleted successfully" });

  } catch (error) {
    console.log("[CHANNEL_ID_DELETE]",error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}