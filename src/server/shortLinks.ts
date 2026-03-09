import { createServerFn } from "@tanstack/react-start";
import { db } from "../db";
import { shortLinks, shortLinkClicks } from "../db/schema";
import { eq, sql, and, gte } from "drizzle-orm";
import { ensureSession } from "./auth";

// Helper function to generate random slug
function generateSlug(length: number = 6): string {
  const chars = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
  let result = "";
  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}

// Helper function to parse user agent
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

export const getShortLinks = createServerFn({ method: "GET" }).handler(
  async () => {
    const session = await ensureSession();
    const result = await db.query.shortLinks.findMany({
      where: eq(shortLinks.userId, session.user.id),
      orderBy: (shortLinks, { desc }) => [desc(shortLinks.createdAt)],
    });
    return result;
  },
);

export const getShortLinkBySlug = createServerFn({ method: "GET" }).handler(
  async ({ data }: { data: any }) => {
    const slug = data as string;
    const shortLink = await db.query.shortLinks.findFirst({
      where: (s, { and, eq: e }) => and(e(s.slug, slug), e(s.isActive, true)),
    });
    return shortLink;
  },
);

export const getShortLinkById = createServerFn({ method: "GET" }).handler(
  async ({ data }: { data: any }) => {
    const id = data as number;
    const session = await ensureSession();
    const shortLink = await db.query.shortLinks.findFirst({
      where: (s, { and, eq: e }) =>
        and(e(s.id, id), e(s.userId, session.user.id)),
    });
    if (!shortLink) throw new Error("Short link not found");
    return shortLink;
  },
);

export const createShortLink = createServerFn({ method: "POST" }).handler(
  async ({ data }: { data: any }) => {
    const typedData = data as {
      slug?: string;
      targetUrl: string;
      title?: string;
      description?: string;
    };
    const session = await ensureSession();

    // Generate slug if not provided
    let slug = typedData.slug || generateSlug(6);
    
    // Check if slug already exists, if so generate new one
    let attempts = 0;
    while (attempts < 10) {
      const existing = await db.query.shortLinks.findFirst({
        where: eq(shortLinks.slug, slug),
      });
      if (!existing) break;
      slug = generateSlug(6);
      attempts++;
    }
    
    if (attempts >= 10) {
      throw new Error("Failed to generate unique slug");
    }

    const [result] = await db.insert(shortLinks).values({
      userId: session.user.id,
      slug,
      targetUrl: typedData.targetUrl,
      title: typedData.title ?? null,
      description: typedData.description ?? null,
    });
    
    return { id: result.insertId, slug };
  },
);

export const updateShortLink = createServerFn({ method: "POST" }).handler(
  async ({ data }: { data: any }) => {
    const typedData = data as {
      id: number;
      slug?: string;
      targetUrl?: string;
      title?: string;
      description?: string;
      isActive?: boolean;
    };
    const session = await ensureSession();
    
    // Verify ownership
    const existing = await db.query.shortLinks.findFirst({
      where: (s, { and, eq: e }) =>
        and(e(s.id, typedData.id), e(s.userId, session.user.id)),
    });
    
    if (!existing) throw new Error("Short link not found");
    
    // If updating slug, check uniqueness
    if (typedData.slug && typedData.slug !== existing.slug) {
      const slugExists = await db.query.shortLinks.findFirst({
        where: eq(shortLinks.slug, typedData.slug),
      });
      if (slugExists) {
        throw new Error("Slug already exists");
      }
    }
    
    const { id, ...updates } = typedData;
    await db.update(shortLinks).set(updates).where(eq(shortLinks.id, id));
    return { success: true };
  },
);

export const deleteShortLink = createServerFn({ method: "POST" }).handler(
  async ({ data }: { data: any }) => {
    const id = data as number;
    const session = await ensureSession();
    
    // Verify ownership
    const existing = await db.query.shortLinks.findFirst({
      where: (s, { and, eq: e }) =>
        and(e(s.id, id), e(s.userId, session.user.id)),
    });
    
    if (!existing) throw new Error("Short link not found");
    
    await db.delete(shortLinks).where(eq(shortLinks.id, id));
    return { success: true };
  },
);

export const trackShortLinkClick = createServerFn({ method: "POST" }).handler(
  async ({ data, request }: { data: any; request: Request }) => {
    const typedData = data as {
      shortLinkId: number;
      userAgent?: string;
      referer?: string;
    };
    
    // Extract IP address from request headers
    const ipAddress =
      request.headers.get("x-forwarded-for")?.split(",")[0].trim() ||
      request.headers.get("x-real-ip") ||
      request.headers.get("cf-connecting-ip") ||
      null;
    
    await db.insert(shortLinkClicks).values({
      shortLinkId: typedData.shortLinkId,
      ipAddress: ipAddress,
      userAgent: typedData.userAgent ?? null,
      referer: typedData.referer ?? null,
    });
    
    return { success: true };
  },
);

export const getShortLinkStats = createServerFn({ method: "GET" }).handler(
  async ({ data }: { data: any }) => {
    const shortLinkId = data as number;
    const session = await ensureSession();
    
    // Verify ownership
    const shortLink = await db.query.shortLinks.findFirst({
      where: (s, { and, eq: e }) =>
        and(e(s.id, shortLinkId), e(s.userId, session.user.id)),
    });
    
    if (!shortLink) throw new Error("Short link not found");
    
    // Get all clicks
    const allClicks = await db.query.shortLinkClicks.findMany({
      where: eq(shortLinkClicks.shortLinkId, shortLinkId),
    });
    
    // Recent clicks (last 24h)
    const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
    const recentClicksList = await db.query.shortLinkClicks.findMany({
      where: and(
        eq(shortLinkClicks.shortLinkId, shortLinkId),
        gte(shortLinkClicks.clickedAt, oneDayAgo),
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
    
    // Enrich recent clicks with browser and OS
    const enrichedRecentClicks = recentClicksList.map((click: any) => {
      const { browser, os } = parseUserAgent(click.userAgent || "");
      return {
        ...click,
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

export const getShortLinksWithStats = createServerFn({ method: "GET" }).handler(
  async () => {
    const session = await ensureSession();
    
    // Get all short links for the user
    const userShortLinks = await db.query.shortLinks.findMany({
      where: eq(shortLinks.userId, session.user.id),
      orderBy: (shortLinks, { desc }) => [desc(shortLinks.createdAt)],
    });
    
    // For each short link, get click count
    const shortLinksWithStats = await Promise.all(
      userShortLinks.map(async (shortLink) => {
        const [clickResult] = await db
          .select({ count: sql<number>`count(*)`.as("count") })
          .from(shortLinkClicks)
          .where(eq(shortLinkClicks.shortLinkId, shortLink.id));
        
        return {
          ...shortLink,
          clickCount: clickResult?.count ?? 0,
        };
      }),
    );
    
    return shortLinksWithStats;
  },
);
