import { currentProfile } from "@/lib/current-profile";
import { NextResponse } from "next/server";
import { db } from "@/db/db";
import { member, server, profile } from "@/db/schema";
import { and, eq, ne, asc } from "drizzle-orm";

export async function DELETE (
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = await params;
    const curProfile = await currentProfile();
    const { searchParams } = new URL(req.url);

    const serverId = searchParams.get("serverId");

    if (!curProfile) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    if (!serverId) {
      return new NextResponse("Server ID Missing", { status: 400 });
    }

    if (!id) {
      return new NextResponse("Member ID Missing", { status: 400 });
    }

    const serverExists = await db
      .select()
      .from(server)
      .where(and(eq(server.id, serverId), eq(server.profileId, curProfile.id)))
      .limit(1)
      .execute();

    if (serverExists.length === 0) {
      return new NextResponse("Server not found or unauthorized", { status: 404 });
    }

    await db
      .delete(member)
      .where(
        and(
          eq(member.serverId, serverId),
          eq(member.id, id),
          ne(member.profileId, curProfile.id) // Ensure that the current profile is not deleted
        )
      )
      .execute();

    const updatedServerData = await db
      .select()
      .from(server)
      .leftJoin(member, eq(member.serverId, server.id))
      .leftJoin(profile, eq(profile.id, member.profileId))
      .where(eq(server.id, serverId))
      .orderBy(asc(member.role))
      .execute();

    const responseServer = {
      ...updatedServerData[0].servers,
      members: updatedServerData.map((item) => ({
        ...item.members,
        profile: item.profiles,
      })),
    };

     return NextResponse.json(responseServer);

  } catch (error) {
    console.log("[MEMBER_ID_DELETE]",error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}

export async function PATCH (
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = await params; // Await the params object here
    const curProfile = await currentProfile();
    const { searchParams } = new URL(req.url);
    const { role } = await req.json();

    const serverId = searchParams.get("serverId");

    if (!curProfile) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    if (!serverId) {
      return new NextResponse("Server ID Missing", { status: 400 });
    }

    if (!id) {
      return new NextResponse("Member ID Missing", { status: 400 });
    }

    const serverExists = await db
      .select()
      .from(server)
      .where(and(eq(server.id, serverId), eq(server.profileId, curProfile.id)))
      .limit(1)
      .execute();

    if (serverExists.length === 0) {
      return new NextResponse("Server not found or unauthorized", { status: 404 });
    }

    await db
      .update(member)
      .set({ role })
      .where(
        and(
          eq(member.serverId, serverId),
          eq(member.id, id),
          ne(member.profileId, curProfile.id) 
        )
      )
      .execute();

    const updatedServerData = await db
      .select()
      .from(server)
      .leftJoin(member, eq(member.serverId, server.id))
      .leftJoin(profile, eq(profile.id, member.profileId))
      .where(eq(server.id, serverId))
      .orderBy(asc(member.role)) 
      .execute();

    const responseServer = {
      ...updatedServerData[0].servers,
      members: updatedServerData.map((item) => ({
        ...item.members,
        profile: item.profiles,
      })),
    };

    return NextResponse.json(responseServer);

  } catch (error) {
    console.log("[MEMBERS_ID_PATCH]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}