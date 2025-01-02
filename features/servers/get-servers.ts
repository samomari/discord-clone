import { db } from "@/db/db";
import { member, server } from "@/db/schema";
import { eq, asc } from "drizzle-orm";

export const getServers = async (profileId: string) => {
  try {
    const servers = await db
      .select()
      .from(server)
      .innerJoin(member, eq(member.serverId, server.id))
      .where(eq(member.profileId, profileId))
      .orderBy(asc(server.createdAt));

    const simplifiedServers = servers.map(s => s.servers);

    return simplifiedServers;

  } catch (error) {
    console.error('Error fetching servers: ', error);
  }
}