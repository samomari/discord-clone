import { currentProfile } from "@/lib/current-profile";
import { NextResponse } from "next/server";
import { db } from "@/db/db";
import { directMessage, member, message, profile, SelectDirectMessage, SelectMessage } from "@/db/schema";
import { eq, and, desc, lt } from "drizzle-orm";
import { DirectMessageWithMemberWithProfile } from "@/types";

const MESSAGES_BATCH = 10;

export async function GET(req: Request) {
  try {
    const curProfile = await currentProfile();
    const { searchParams } = new URL(req.url);

    const cursor = searchParams.get("cursor");
    const conversationId = searchParams.get("conversationId");

    if (!curProfile) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    if (!conversationId) {
      return new NextResponse("Conversation ID Missing", { status: 400 });
    }

    let messages: DirectMessageWithMemberWithProfile[] = [];

    if (cursor) {
      const cursorDate = new Date(cursor);

      if (isNaN(cursorDate.getTime())) {
        return new NextResponse("Invalid cursor", { status: 400 });
      }

      messages = await db
        .select({
          messages: directMessage,
          members: member,
          profiles: profile
        })
        .from(directMessage)
        .leftJoin(member, eq(directMessage.memberId, member.id))
        .leftJoin(profile, eq(member.profileId, profile.id))
        .where(and(eq(directMessage.conversationId, conversationId), lt(directMessage.createdAt, cursorDate)))
        .orderBy(desc(directMessage.createdAt))
        .limit(MESSAGES_BATCH)
        .execute();
    } else {
      messages = await db
        .select({
          messages: directMessage,
          members: member,
          profiles: profile
        })
        .from(directMessage)
        .leftJoin(member, eq(directMessage.memberId, member.id))
        .leftJoin(profile, eq(member.profileId, profile.id))
        .where(eq(directMessage.conversationId, conversationId))
        .orderBy(desc(directMessage.createdAt))
        .limit(MESSAGES_BATCH)
        .execute();
    }

    let nextCursor = null;

    if (messages.length === MESSAGES_BATCH) {
      nextCursor = messages[MESSAGES_BATCH - 1].messages.createdAt;
    }

    return NextResponse.json({
      items: messages,
      nextCursor
    });

  } catch (error) {
    console.log("[DIRECT_MESSAGES_GET]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}
