import { createServerFn } from "@tanstack/react-start";
import { db } from "../db";
import { clicks, links, pages } from "../db/schema";
import { eq, sql, and, gte } from "drizzle-orm";

// Helper function to parse user agent and extract browser and OS
function parseUserAgent(userAgent: string) {
  if (!userAgent) return { browser: "Unknown", os: "Unknown" };

  let browser = "Unknown";
  let os = "Unknown";

  // Detect OS
  if (/Windows/.test(userAgent)) os = "Windows";
  else if (/Mac OS X/.test(userAgent)) os = "macOS";
  else if (/iPhone/.test(userAgent)) os = "iOS";
  else if (/iPad/.test(userAgent)) os = "iPadOS";
  else if (/Android/.test(userAgent)) os = "Android";
  else if (/Linux/.test(userAgent)) os = "Linux";

  // Detect Browser
  if (/Chrome/.test(userAgent) && !/Chromium/.test(userAgent)) browser = "Chrome";
  else if (/Safari/.test(userAgent) && !/Chrome/.test(userAgent)) browser = "Safari";
  else if (/Firefox/.test(userAgent)) browser = "Firefox";
  else if (/Edge/.test(userAgent)) browser = "Edge";
  else if (/Opera/.test(userAgent)) browser = "Opera";
  else if (/MSIE|Trident/.test(userAgent)) browser = "IE";

  return { browser, os };
}

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

export const getDashboardStats = createServerFn({ method: "GET" }).handler(
  async () => {
    const { ensureSession } = await import("./auth");
    const session = await ensureSession();
    
    // Get all pages for the user
    const userPages = await db.query.pages.findMany({
      where: eq(pages.userId, session.user.id),
      columns: { id: true, title: true, slug: true },
    });

    if (userPages.length === 0) {
      return {
        totalClicks: 0,
        recentClicks: 0,
        browsers: {},
        operatingSystems: {},
        topIPs: [],
        recentClicksList: [],
      };
    }

    const pageIds = userPages.map((p: any) => p.id);

    // Get all links for these pages
    const userLinks = await db.query.links.findMany({
      where: sql`${links.pageId} IN (${sql.join(
        pageIds.map((id: any) => sql`${id}`),
        sql`, `,
      )})`,
      columns: { id: true, pageId: true, title: true },
    });

    if (userLinks.length === 0) {
      return {
        totalClicks: 0,
        recentClicks: 0,
        browsers: {},
        operatingSystems: {},
        topIPs: [],
        recentClicksList: [],
      };
    }

    const linkIds = userLinks.map((l: any) => l.id);

    // Get all clicks for these links
    const allClicks = await db.query.clicks.findMany({
      where: sql`${clicks.linkId} IN (${sql.join(
        linkIds.map((id: any) => sql`${id}`),
        sql`, `,
      )})`,
    });

    // Get recent clicks (last 24h)
    const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
    const recentClicksList = await db.query.clicks.findMany({
      where: and(
        sql`${clicks.linkId} IN (${sql.join(
          linkIds.map((id: any) => sql`${id}`),
          sql`, `,
        )})`,
        gte(clicks.clickedAt, oneDayAgo),
      ),
      limit: 20,
      orderBy: (c, { desc }) => [desc(c.clickedAt)],
    });

    // Aggregate statistics
    const browsers: Record<string, number> = {};
    const operatingSystems: Record<string, number> = {};
    const ipMap: Record<string, number> = {};

    allClicks.forEach((click: any) => {
      const { browser, os } = parseUserAgent(click.userAgent || "");
      browsers[browser] = (browsers[browser] || 0) + 1;
      operatingSystems[os] = (operatingSystems[os] || 0) + 1;
      
      if (click.ipAddress) {
        ipMap[click.ipAddress] = (ipMap[click.ipAddress] || 0) + 1;
      }
    });

    // Get top IPs
    const topIPs = Object.entries(ipMap)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([ip, count]) => ({ ip, count }));

    // Convert recent clicks to include link info
    const enrichedRecentClicks = recentClicksList.map((click: any) => {
      const link = userLinks.find((l: any) => l.id === click.linkId);
      const page = userPages.find((p: any) => p.id === link?.pageId);
      const { browser, os } = parseUserAgent(click.userAgent || "");
      return {
        ...click,
        linkTitle: link?.title,
        pageTitle: page?.title,
        browser,
        os,
      };
    });

    return {
      totalClicks: allClicks.length,
      recentClicks: recentClicksList.length,
      browsers,
      operatingSystems,
      topIPs,
      recentClicksList: enrichedRecentClicks,
    };
  },
);
