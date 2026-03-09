import { createServerFn } from "@tanstack/react-start";
import { db } from "../db";
import { pages, links } from "../db/schema";
import { eq } from "drizzle-orm";
import { ensureSession } from "./auth";

export const getPages = createServerFn({ method: "GET" }).handler(async () => {
  const session = await ensureSession();
  const result = await db.query.pages.findMany({
    where: eq(pages.userId, session.user.id),
    orderBy: (pages, { desc }) => [desc(pages.createdAt)],
  });
  return result;
});

export const getPageById = createServerFn({ method: "GET" }).handler(
  async ({ data }: { data: any }) => {
    const id = data as number;
    const session = await ensureSession();
    const page = await db.query.pages.findFirst({
      where: (p, { and, eq: e }) =>
        and(e(p.id, id), e(p.userId, session.user.id)),
    });
    if (!page) throw new Error("Page not found");
    
    const pageLinks = await db.query.links.findMany({
      where: eq(links.pageId, id),
      orderBy: (l, { asc }) => [asc(l.position)],
    });
    
    // Debug log the links data
    console.log("Server: Fetched links with textColor:", pageLinks.map(l => ({ 
      id: l.id, 
      title: l.title, 
      textColor: l.textColor,
      text_color: (l as any).text_color,
      color: l.color 
    })));
    
    return { ...page, links: pageLinks };
  },
);

export const getPageBySlug = createServerFn({ method: "GET" }).handler(
  async ({ data }: { data: any }) => {
    const slug = data as string;
    const page = await db.query.pages.findFirst({
      where: (p, { and, eq: e }) => and(e(p.slug, slug), e(p.isActive, true)),
    });
    if (!page) return null;
    
    const pageLinks = await db.query.links.findMany({
      where: (l, { and }) => and(eq(l.pageId, page.id), eq(l.isActive, true)),
      orderBy: (l, { asc }) => [asc(l.position)],
    });
    
    return { ...page, links: pageLinks };
  },
);

export const createPage = createServerFn({ method: "POST" }).handler(
  async ({ data }: { data: any }) => {
    const typedData = data as {
      slug: string;
      title: string;
      bio?: string;
      avatarUrl?: string;
      theme?: string;
    };
    const session = await ensureSession();
    const [result] = await db.insert(pages).values({
      userId: session.user.id,
      slug: typedData.slug,
      title: typedData.title,
      bio: typedData.bio ?? null,
      avatarUrl: typedData.avatarUrl ?? null,
      theme: typedData.theme ?? "default",
    });
    return { id: result.insertId };
  },
);

export const updatePage = createServerFn({ method: "POST" }).handler(
  async ({ data }: { data: any }) => {
    const typedData = data as {
      id: number;
      slug?: string;
      title?: string;
      bio?: string;
      avatarUrl?: string;
      theme?: string;
      backgroundPattern?: string;
      isActive?: boolean;
    };
    await ensureSession();
    const { id, ...updates } = typedData;
    await db.update(pages).set(updates).where(eq(pages.id, id));
    return { success: true };
  },
);

export const deletePage = createServerFn({ method: "POST" }).handler(
  async ({ data }: { data: any }) => {
    const id = data as number;
    await ensureSession();
    await db.delete(pages).where(eq(pages.id, id));
    return { success: true };
  },
);

export const getPagesWithStats = createServerFn({ method: "GET" }).handler(
  async () => {
    const session = await ensureSession();
    const { clicks } = await import("../db/schema");
    const { sql } = await import("drizzle-orm");
    
    // Get all pages for the user
    const userPages = await db.query.pages.findMany({
      where: eq(pages.userId, session.user.id),
      orderBy: (pages, { desc }) => [desc(pages.createdAt)],
    });
    
    // For each page, get link count and click count
    const pagesWithStats = await Promise.all(
      userPages.map(async (page) => {
        // Get links for this page
        const pageLinks = await db.query.links.findMany({
          where: eq(links.pageId, page.id),
          columns: { id: true },
        });
        
        const linkCount = pageLinks.length;
        
        if (linkCount === 0) {
          return {
            ...page,
            linkCount: 0,
            clickCount: 0,
          };
        }
        
        const linkIds = pageLinks.map((l) => l.id);
        
        // Get click count for all links on this page
        const [clickResult] = await db
          .select({ count: sql<number>`count(*)`.as("count") })
          .from(clicks)
          .where(
            sql`${clicks.linkId} IN (${sql.join(
              linkIds.map((id) => sql`${id}`),
              sql`, `,
            )})`,
          );
        
        return {
          ...page,
          linkCount,
          clickCount: clickResult?.count ?? 0,
        };
      }),
    );
    
    return pagesWithStats;
  },
);
