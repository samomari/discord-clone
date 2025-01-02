import { v4 as uuidv4} from "uuid";
import { NextResponse } from "next/server";
import { currentProfile } from "@/features/profiles/current-profile";
import { db } from "@/db/db";
import { server, member, channel } from '@/db/schema';

export async function POST(req: Request) {
  try {
    const { name, imageUrl } = await req.json();
    const profile = await currentProfile();

    if (!profile) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const newServer = await db
      .insert(server)
      .values({
        profileId: profile.id,
        name,
        imageUrl,
        inviteCode: uuidv4(),
      })
      .returning(); 

    const serverId = newServer[0].id; 

    await db
      .insert(channel)
      .values({
        name: "general",
        profileId: profile.id,
        serverId,
      });

    await db
      .insert(member)
      .values({
        profileId: profile.id,
        serverId,
        role: 'ADMIN',
      });

    return NextResponse.json(newServer[0]);

  } catch (error) {
    console.log("SERVERS_POST", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}
