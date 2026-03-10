import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { db } from "../db";
import { pages, links, shortLinks } from "../db/schema";
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

export const getPageById = createServerFn({ method: "GET" })
  .inputValidator(z.number())
  .handler(async ({ data }) => {
    const id = data;
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

export const getPageBySlug = createServerFn({ method: "GET" })
  .inputValidator(z.string())
  .handler(async ({ data }) => {
    const slug = data;
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

export const checkSlugAvailability = createServerFn({ method: "GET" })
  .inputValidator(z.object({ slug: z.string(), excludeId: z.number().optional() }))
  .handler(async ({ data }) => {
    const { slug, excludeId } = data;
    const [existingPage, existingShort] = await Promise.all([
      db.query.pages.findFirst({
        where: (p, { and, eq: e, ne }) => 
          excludeId 
            ? and(e(p.slug, slug), ne(p.id, excludeId))
            : e(p.slug, slug),
      }),
      db.query.shortLinks.findFirst({
        where: eq(shortLinks.slug, slug),
      }),
    ]);
    return { available: !existingPage && !existingShort };
  });

export const createPage = createServerFn({ method: "POST" })
  .inputValidator(
    z.object({
      slug: z.string(),
      title: z.string(),
      bio: z.string().optional().nullable(),
      avatarUrl: z.string().optional().nullable(),
      theme: z.string().optional(),
      textColor: z.string().optional(),
      titleColor: z.string().optional(),
      bioColor: z.string().optional(),
    }),
  )
  .handler(async ({ data }) => {
    const typedData = data;
    const session = await ensureSession();

    // Check slug uniqueness across pages and short links
    const [existingPage, existingShort] = await Promise.all([
      db.query.pages.findFirst({ where: eq(pages.slug, typedData.slug) }),
      db.query.shortLinks.findFirst({ where: eq(shortLinks.slug, typedData.slug) }),
    ]);
    if (existingPage) {
      throw new Error(`Slug "${typedData.slug}" is already taken.`);
    }
    if (existingShort) {
      throw new Error(`Slug "${typedData.slug}" conflicts with an existing short link.`);
    }

    const [result] = await db.insert(pages).values({
      userId: session.user.id,
      slug: typedData.slug,
      title: typedData.title,
      bio: typedData.bio ?? null,
      avatarUrl: typedData.avatarUrl ?? null,
      theme: typedData.theme ?? "default",
      textColor: typedData.textColor ?? "default",
      titleColor: typedData.titleColor ?? "default",
      bioColor: typedData.bioColor ?? "default",
    });
    return { id: result.insertId };
  },
);

export const updatePage = createServerFn({ method: "POST" })
  .inputValidator(
    z.object({
      id: z.number(),
      slug: z.string().optional(),
      title: z.string().optional(),
      bio: z.string().optional().nullable(),
      avatarUrl: z.string().optional().nullable(),
      theme: z.string().optional(),
      backgroundPattern: z.string().optional().nullable(),
      textColor: z.string().optional(),
      titleColor: z.string().optional(),
      bioColor: z.string().optional(),
      isActive: z.boolean().optional(),
    }),
  )
  .handler(async ({ data }) => {
    const typedData = data;
    await ensureSession();
    const { id, ...updates } = typedData;

    // If slug is being updated, check uniqueness
    if (updates.slug) {
      // Check against other pages
      const existingPage = await db.query.pages.findFirst({
        where: (p, { and, eq: e, ne }) => and(e(p.slug, updates.slug as string), ne(p.id, id)),
      });
      // Check against short links
      const existingShort = await db.query.shortLinks.findFirst({
        where: eq(shortLinks.slug, updates.slug as string),
      });
      if (existingPage) {
        throw new Error(`Slug "${updates.slug}" is already taken.`);
      }
      if (existingShort) {
        throw new Error(`Slug "${updates.slug}" conflicts with an existing short link.`);
      }
    }

    await db.update(pages).set(updates).where(eq(pages.id, id));
    return { success: true };
  },
);

export const deletePage = createServerFn({ method: "POST" })
  .inputValidator(z.number())
  .handler(async ({ data }) => {
    const id = data;
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
