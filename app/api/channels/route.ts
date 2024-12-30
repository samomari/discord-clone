import { db } from "@/db/db";
import { currentProfile } from "@/features/profiles/current-profile";
import { NextResponse } from "next/server";
import { MemberRoleEnum } from "@/db/schema";
import { member, channel, server } from "@/db/schema";
import { eq, and, asc, inArray } from 'drizzle-orm';

export async function POST(
  req: Request,
) {
  try {
    const profile = await currentProfile();
    const { name, type } = await req.json();
    const { searchParams } = new URL(req.url);

    const serverId = searchParams.get("id");

    if (!profile) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    if (!serverId) {
      return new NextResponse("Server ID Missing", { status: 400 });
    }

    if (name === "general") {
      return new NextResponse("Name cannot be 'general'", { status: 400 });
    }

    const authorizedMember = await db
      .select()
      .from(member)
      .where(
        and(
          eq(member.serverId, serverId),
          eq(member.profileId, profile.id),
          inArray(member.role, [MemberRoleEnum["ADMIN"], MemberRoleEnum["MODERATOR"]]) 
        )
      );

    if (!authorizedMember) {
      return new NextResponse("Forbidden", { status: 403 });
    }

    await db
      .insert(channel)
      .values({
        serverId,
        profileId: profile.id,
        name,
        type,
      });
      
    const updatedServerData = await db
      .select()
      .from(server)
      .leftJoin(channel, eq(channel.serverId, server.id)) 
      .where(eq(server.id, serverId))
      .orderBy(asc(channel.createdAt)) 
      .execute();

    const responseServer = {
      ...updatedServerData[0].servers, 
      channels: updatedServerData.map((item) => item.channels), 
    };
  
    return NextResponse.json(responseServer);

  } catch (error) {
    console.log("CHANNEL_POST",error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}