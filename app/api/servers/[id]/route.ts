import { currentProfile } from "@/lib/current-profile";
import { NextResponse } from "next/server";
import { db } from "@/db/db";
import { member, server, profile, channel } from "@/db/schema";
import { eq, and, or, sql } from "drizzle-orm";
import { MemberRole, ServerWithMembersWithProfiles } from "@/types";

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

    const memberRecord = await db
      .select()
      .from(member)
      .where(
        and(
          eq(member.serverId, id),
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
      .set({ 
        name: name, 
        imageUrl: imageUrl,
        updatedAt: sql`CURRENT_TIMESTAMP`, 
      })
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

export async function GET (
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = await params;
    const curProfile = await currentProfile();

    if (!curProfile) {
      return new NextResponse("Unauthorized", { status: 401 });
    }
    console.log("Fetching data for server:", id); 

    const serverData = await db
      .select()
      .from(server)
      .leftJoin(member, eq(member.serverId, server.id))
      .leftJoin(profile, eq(profile.id, member.profileId))
      .leftJoin(channel, eq(channel.serverId, server.id))
      .where(eq(server.id, id))
      .execute();

    if (!serverData || serverData.length === 0) {
      return new NextResponse("Server not found", { status: 404 });
    }

    const membersMap = new Map();
    const channelsMap = new Map();

    serverData.forEach((item) => {
      if (item.members?.id) {
        membersMap.set(item.members.id, {
          id: item.members.id,
          serverId: item.members.serverId,
          profileId: item.members.profileId,
          role: item.members.role,
          profile: item.profiles,
        });
      }
      if (item.channels?.id && !channelsMap.has(item.channels.id)) {
        channelsMap.set(item.channels.id, item.channels);
      }
    });

    const membersArray = Array.from(membersMap.values());
    const channelsArray = Array.from(channelsMap.values());

    const filteredMembers = membersArray.filter(
      (member) => member.profileId !== curProfile.id);

    const reshapedServerItem: ServerWithMembersWithProfiles = {
      id: serverData[0].servers.id,
      name: serverData[0].servers.name,
      imageUrl: serverData[0].servers.imageUrl,
      createdAt: serverData[0].servers.createdAt,
      updatedAt: serverData[0].servers.updatedAt,
      inviteCode: serverData[0].servers.inviteCode,
      profileId: serverData[0].servers.profileId,
      members: membersArray,
    };

    return NextResponse.json({
      server: reshapedServerItem,
      channels: channelsArray,
      members: filteredMembers,
    });

  } catch (error) {
    console.log("[SERVER_ID_GET]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}