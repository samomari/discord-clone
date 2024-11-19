import { currentProfile } from "@/lib/current-profile";
import { NextResponse } from "next/server";
import { db } from "@/db/db";
import { member, message, profile } from "@/db/schema";
import { eq, and, desc } from "drizzle-orm";

const MESSAGES_BATCH = 10;

export async function GET(
  req: Request
) {
  try {
    const curProfile = await currentProfile();
    const { searchParams } = new URL(req.url);

    const cursor = searchParams.get("cursor");
    const channelId = searchParams.get("channelId");

    if (!curProfile) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    if (!channelId) {
      return new NextResponse("Channel ID Missing", { status: 400 });
    }

    let messages = [];
    
    if (cursor) {
      messages = await db
      .select()
      .from(message)
      .leftJoin(member, eq(message.memberId, member.id))
      .leftJoin(profile, eq(member.profileId, profile.id))
      .where(and(eq(message.channelId, channelId),eq(message.id,cursor)))
      .orderBy(desc(message.createdAt))
      .limit(MESSAGES_BATCH)
      .execute();
    } else {
      messages = await db
        .select()
        .from(message)
        .leftJoin(member, eq(message.memberId, member.id))
        .leftJoin(profile, eq(member.profileId, profile.id))
        .where(eq(message.channelId, channelId))
        .orderBy(desc(message.createdAt))
        .limit(MESSAGES_BATCH)
        .execute();
      }

    let nextCursor = null;

    if (messages.length === MESSAGES_BATCH) {
      nextCursor = messages[MESSAGES_BATCH - 1].id;
    }

    return NextResponse.json({
      items: messages,
      nextCursor
    });

  } catch (error) {
    console.log("[MESSAGES_GET]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}