import { db } from "@/db/db";
import { member, conversation, profile } from "@/db/schema";
import { and, eq } from "drizzle-orm";

export const getOrCreateConversation = async (memberOneId: string, memberTwoId: string) => {
  let conversation = await findConversation(memberOneId, memberTwoId) || await findConversation(memberTwoId, memberOneId);

  if (!conversation) {
    conversation = await createNewConversation(memberOneId, memberTwoId);
  }

  return conversation;
}

const findConversation = async (memberOneId: string, memberTwoId: string) => {
  try {
    const conversationData = await db
      .select()
      .from(conversation)
      .where(and(eq(conversation.memberOneId, memberOneId), eq(conversation.memberTwoId, memberTwoId)))
      .limit(1)
      .execute();

    if (!conversationData && conversationData.length === 0) {
      return null;
    }

    const memberOneProfile = await db
      .select()
      .from(member)
      .leftJoin(profile, eq(profile.id, member.profileId))
      .where(eq(member.id, conversationData[0].memberOneId))
      .limit(1)
      .execute();

    const memberTwoProfile = await db
      .select()
      .from(member)
      .leftJoin(profile, eq(profile.id, member.profileId))
      .where(eq(member.id, conversationData[0].memberTwoId))
      .limit(1)
      .execute();

    return {
      ...conversationData[0],
      memberOne: {
        ...memberOneProfile[0],
        profile: memberOneProfile[0]?.profiles,
      },
      memberTwo: {
        ...memberTwoProfile[0],
        profile: memberTwoProfile[0]?.profiles,
      },
    };
  } catch {
    return null;
  }
}

const createNewConversation = async (memberOneId: string, memberTwoId: string) => {
  try {
    
    const conversationData = await db
      .insert(conversation)
      .values({ 
        memberOneId, 
        memberTwoId })
      .returning()
      .execute();

    const conversationId = conversationData[0].id;

    if (!conversationId) {
      return null;
    }

    const memberOneProfile = await db
      .select()
      .from(member)
      .leftJoin(profile, eq(profile.id, member.profileId))
      .where(eq(member.id, memberOneId))
      .limit(1)
      .execute();

    const memberTwoProfile = await db
      .select()
      .from(member)
      .leftJoin(profile, eq(profile.id, member.profileId))
      .where(eq(member.id, memberTwoId))
      .limit(1)
      .execute();

    return {
      ...conversationData[0],
      memberOne: {
        ...memberOneProfile[0],
        profile: memberOneProfile[0]?.profiles,
      },
      memberTwo: {
        ...memberTwoProfile[0],
        profile: memberTwoProfile[0]?.profiles,
      }
    };

  } catch {
    return null;
  }
}