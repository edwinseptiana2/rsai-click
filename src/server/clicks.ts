import { createServerFn } from "@tanstack/react-start";
import { db } from "../db";
import { clicks, links } from "../db/schema";
import { eq, sql, and, gte } from "drizzle-orm";

export const trackClick = createServerFn({ method: "POST" }).handler(
  async ({ data }: { data: any }) => {
    const typedData = data as {
      linkId: number;
      ipAddress?: string;
      userAgent?: string;
      referer?: string;
    };
    await db.insert(clicks).values({
      linkId: typedData.linkId,
      ipAddress: typedData.ipAddress ?? null,
      userAgent: typedData.userAgent ?? null,
      referer: typedData.referer ?? null,
    });
    return { success: true };
  },
);

export const getClickStats = createServerFn({ method: "GET" }).handler(
  async ({ data }: { data: any }) => {
    const pageId = data as number;
    // Get total clicks per link for this page
    const pageLinks = await db.query.links.findMany({
      where: eq(links.pageId, pageId),
      columns: { id: true, title: true, url: true },
    });

    if (pageLinks.length === 0) {
      return { totalClicks: 0, linkStats: [], recentClicks: 0 };
    }

    const linkIds = pageLinks.map((l: any) => l.id);

    const clickCounts = await db
      .select({
        linkId: clicks.linkId,
        count: sql<number>`count(*)`.as("count"),
      })
      .from(clicks)
      .where(
        sql`${clicks.linkId} IN (${sql.join(
          linkIds.map((id: any) => sql`${id}`),
          sql`, `,
        )})`,
      )
      .groupBy(clicks.linkId);

    const clickMap = new Map(clickCounts.map((c: any) => [c.linkId, c.count]));

    const linkStats = pageLinks.map((link: any) => ({
      ...link,
      clicks: clickMap.get(link.id) ?? 0,
    }));

    const totalClicks = linkStats.reduce(
      (sum: number, l: any) => sum + l.clicks,
      0,
    );

    // Recent clicks (last 24h)
    const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
    const [recentResult] = await db
      .select({ count: sql<number>`count(*)`.as("count") })
      .from(clicks)
      .where(
        and(
          sql`${clicks.linkId} IN (${sql.join(
            linkIds.map((id: any) => sql`${id}`),
            sql`, `,
          )})`,
          gte(clicks.clickedAt, oneDayAgo),
        ),
      );

    return {
      totalClicks,
      linkStats: linkStats.sort((a: any, b: any) => b.clicks - a.clicks),
      recentClicks: recentResult?.count ?? 0,
    };
  },
);
