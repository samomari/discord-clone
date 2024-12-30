import { db } from "@/db/db";
import { channel, member, profile, server } from "@/db/schema";
import { ServerWithMembersWithProfiles } from "@/types";
import { eq } from "drizzle-orm";

export const getServerInfo = async (serverId: string) => {
  try {
    const serverData = await db
      .select()
      .from(server)
      .leftJoin(member, eq(member.serverId, server.id))
      .leftJoin(profile, eq(profile.id, member.profileId))
      .leftJoin(channel, eq(channel.serverId, server.id))
      .where(eq(server.id, serverId))
      .execute();

    if (!serverData || serverData.length === 0) {
        return null;
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
    

    const reshapedServerItem: ServerWithMembersWithProfiles = {
      id: serverData[0].servers.id,
      name: serverData[0].servers.name,
      imageUrl: serverData[0].servers.imageUrl,
      createdAt: serverData[0].servers.createdAt,
      updatedAt: serverData[0].servers.updatedAt,
      inviteCode: serverData[0].servers.inviteCode,
      profileId: serverData[0].servers.profileId,
      members: membersArray
    };

    return {
      server: reshapedServerItem, 
      channels: channelsArray,
      members: membersArray
    }

  } catch (error) {
    console.error('Error fetching server info: ', error);
    throw error;
  }
}