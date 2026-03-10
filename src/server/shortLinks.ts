import { createServerFn } from "@tanstack/react-start";
import { getRequestHeaders } from "@tanstack/react-start/server";
import { z } from "zod";
import { db } from "../db";
import { shortLinks, shortLinkClicks } from "../db/schema";
import { eq, sql, and, gte, desc } from "drizzle-orm";
import { ensureSession } from "./auth";

// Types
export type ShortLink = typeof shortLinks.$inferSelect;
export type ShortLinkClick = typeof shortLinkClicks.$inferSelect;
export type ShortLinkWithStats = ShortLink & { clickCount: number };

export interface CreateShortLinkInput {
  slug?: string;
  targetUrl: string;
  title?: string;
  description?: string;
}

export interface UpdateShortLinkInput {
  id: number;
  slug?: string;
  targetUrl?: string;
  title?: string;
  description?: string;
  isActive?: boolean;
}

export interface ShortLinkStats {
  totalClicks: number;
  recentClicks: number;
  browsers: Record<string, number>;
  operatingSystems: Record<string, number>;
  topIPs: { ip: string; count: number }[];
  recentClicksList: (ShortLinkClick & { browser: string; os: string })[];
}

// Server-side slug resolver - checks if slug is a short link and tracks click
export const resolveShortLinkRedirect = createServerFn({ method: "GET" })
  .inputValidator(z.string())
  .handler(async ({ data }) => {
    const slug = data;
    const headers = getRequestHeaders();
    const shortLink = await db.query.shortLinks.findFirst({
      where: (s, { and, eq: e }) => and(e(s.slug, slug), e(s.isActive, true)),
    });

    if (!shortLink) return null;

    // Track the click server-side
    const ipAddress =
      headers.get("x-forwarded-for")?.split(",")[0].trim() ||
      headers.get("x-real-ip") ||
      headers.get("cf-connecting-ip") ||
      null;
    const userAgent = headers.get("user-agent") || null;
    const referer = headers.get("referer") || null;

    // Fire and forget - don't block redirect for tracking
    db.insert(shortLinkClicks).values({
      shortLinkId: shortLink.id,
      ipAddress,
      userAgent,
      referer,
    }).catch(() => {});

    return { targetUrl: shortLink.targetUrl };
  },
);

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
  async (): Promise<ShortLink[]> => {
    const session = await ensureSession();
    const result = await db.query.shortLinks.findMany({
      where: eq(shortLinks.userId, session.user.id),
      orderBy: (shortLinks, { desc }) => [desc(shortLinks.createdAt)],
    });
    return result;
  },
);

export const getShortLinkBySlug = createServerFn({ method: "GET" })
  .inputValidator(z.string())
  .handler(async ({ data }) => {
    const slug = data;
    const shortLink = await db.query.shortLinks.findFirst({
      where: (s, { and, eq: e }) => and(e(s.slug, slug), e(s.isActive, true)),
    });
    return shortLink;
  },
);

export const getShortLinkById = createServerFn({ method: "GET" })
  .inputValidator(z.number())
  .handler(async ({ data }) => {
    const id = data;
    const session = await ensureSession();
    const shortLink = await db.query.shortLinks.findFirst({
      where: (s, { and, eq: e }) =>
        and(e(s.id, id), e(s.userId, session.user.id)),
    });
    if (!shortLink) throw new Error("Short link not found");
    return shortLink;
  },
);

export const createShortLink = createServerFn({ method: "POST" })
  .inputValidator(
    z.object({
      slug: z.string().optional(),
      targetUrl: z.string().url(),
      title: z.string().optional().nullable(),
      description: z.string().optional().nullable(),
    }),
  )
  .handler(async ({ data }) => {
    const typedData = data;
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
    
    return { id: Number(result.insertId), slug };
  },
);

export const updateShortLink = createServerFn({ method: "POST" })
  .inputValidator(
    z.object({
      id: z.number(),
      slug: z.string().optional(),
      targetUrl: z.string().url().optional(),
      title: z.string().optional().nullable(),
      description: z.string().optional().nullable(),
      isActive: z.boolean().optional(),
    }),
  )
  .handler(async ({ data }) => {
    const typedData = data;
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

export const deleteShortLink = createServerFn({ method: "POST" })
  .inputValidator(z.number())
  .handler(async ({ data }) => {
    const id = data;
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



export const trackShortLinkClick = createServerFn({ method: "POST" })
  .inputValidator(
    z.object({
      shortLinkId: z.number(),
      userAgent: z.string().optional(),
      referer: z.string().optional(),
    }),
  )
  .handler(async ({ data }) => {
    const typedData = data;
    const headers = getRequestHeaders();
    // Extract IP address from request headers
    const ipAddress =
      headers.get("x-forwarded-for")?.split(",")[0].trim() ||
      headers.get("x-real-ip") ||
      headers.get("cf-connecting-ip") ||
      null;
    
    const userAgent = headers.get("user-agent") || null;
    const referer = headers.get("referer") || null;

    await db.insert(shortLinkClicks).values({
      shortLinkId: typedData.shortLinkId,
      ipAddress: ipAddress,
      userAgent: typedData.userAgent ?? userAgent,
      referer: typedData.referer ?? referer,
    });
    
    return { success: true };
  },
);

export const getShortLinkStats = createServerFn({ method: "GET" })
  .inputValidator(z.number())
  .handler(async ({ data }) => {
    const shortLinkId = data;
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

// Dashboard stats for all short links (aggregate)
export interface ShortLinkDashboardStats {
  totalClicks: number;
  recentClicks: number;
  browsers: Record<string, number>;
  operatingSystems: Record<string, number>;
  topIPs: { ip: string; count: number }[];
  recentClicksList: {
    id: number;
    clickedAt: Date;
    ipAddress: string | null;
    browser: string;
    os: string;
    linkTitle: string;
    linkSlug: string;
  }[];
}

export const getShortLinkDashboardStats = createServerFn({ method: "GET" }).handler(
  async (): Promise<ShortLinkDashboardStats> => {
    const session = await ensureSession();

    // Get all short links for the user
    const userShortLinks = await db.query.shortLinks.findMany({
      where: eq(shortLinks.userId, session.user.id),
      columns: { id: true, title: true, slug: true },
    });

    if (userShortLinks.length === 0) {
      return {
        totalClicks: 0,
        recentClicks: 0,
        browsers: {},
        operatingSystems: {},
        topIPs: [],
        recentClicksList: [],
      };
    }

    const linkIds = userShortLinks.map((l) => l.id);

    // Get all clicks for these short links
    const allClicks = await db.query.shortLinkClicks.findMany({
      where: sql`${shortLinkClicks.shortLinkId} IN (${sql.join(
        linkIds.map((id) => sql`${id}`),
        sql`, `,
      )})`,
    });

    // Recent clicks (last 24h)
    const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
    const recentClicksList = await db.query.shortLinkClicks.findMany({
      where: and(
        sql`${shortLinkClicks.shortLinkId} IN (${sql.join(
          linkIds.map((id) => sql`${id}`),
          sql`, `,
        )})`,
        gte(shortLinkClicks.clickedAt, oneDayAgo),
      ),
      limit: 20,
      orderBy: (c, { desc: d }) => [d(c.clickedAt)],
    });

    // Aggregate statistics
    const browsers: Record<string, number> = {};
    const operatingSystems: Record<string, number> = {};
    const ipMap: Record<string, number> = {};

    allClicks.forEach((click) => {
      const { browser, os } = parseUserAgent(click.userAgent || "");
      browsers[browser] = (browsers[browser] || 0) + 1;
      operatingSystems[os] = (operatingSystems[os] || 0) + 1;
      if (click.ipAddress) {
        ipMap[click.ipAddress] = (ipMap[click.ipAddress] || 0) + 1;
      }
    });

    const topIPs = Object.entries(ipMap)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([ip, count]) => ({ ip, count }));

    const enrichedRecentClicks = recentClicksList.map((click) => {
      const link = userShortLinks.find((l) => l.id === click.shortLinkId);
      const { browser, os } = parseUserAgent(click.userAgent || "");
      return {
        id: click.id,
        clickedAt: click.clickedAt,
        ipAddress: click.ipAddress,
        browser,
        os,
        linkTitle: link?.title || link?.slug || "Unknown",
        linkSlug: link?.slug || "",
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
  async (): Promise<ShortLinkWithStats[]> => {
    const session = await ensureSession();
    
    // Use single query with LEFT JOIN to avoid N+1 problem
    const results = await db
      .select({
        id: shortLinks.id,
        userId: shortLinks.userId,
        slug: shortLinks.slug,
        targetUrl: shortLinks.targetUrl,
        title: shortLinks.title,
        description: shortLinks.description,
        isActive: shortLinks.isActive,
        createdAt: shortLinks.createdAt,
        updatedAt: shortLinks.updatedAt,
        clickCount: sql<number>`COALESCE(COUNT(${shortLinkClicks.id}), 0)`.as("click_count"),
      })
      .from(shortLinks)
      .leftJoin(shortLinkClicks, eq(shortLinks.id, shortLinkClicks.shortLinkId))
      .where(eq(shortLinks.userId, session.user.id))
      .groupBy(shortLinks.id)
      .orderBy(desc(shortLinks.createdAt));
    
    return results.map((r) => ({
      id: r.id,
      userId: r.userId,
      slug: r.slug,
      targetUrl: r.targetUrl,
      title: r.title,
      description: r.description,
      isActive: r.isActive,
      createdAt: r.createdAt,
      updatedAt: r.updatedAt,
      clickCount: Number(r.clickCount),
    }));
  },
);
