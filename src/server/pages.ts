import { createServerFn } from "@tanstack/react-start";
import { db } from "../db";
import { pages } from "../db/schema";
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
      with: { links: { orderBy: (l, { asc }) => [asc(l.position)] } },
    });
    if (!page) throw new Error("Page not found");
    return page;
  },
);

export const getPageBySlug = createServerFn({ method: "GET" }).handler(
  async ({ data }: { data: any }) => {
    const slug = data as string;
    const page = await db.query.pages.findFirst({
      where: (p, { and, eq: e }) => and(e(p.slug, slug), e(p.isActive, true)),
      with: {
        links: {
          where: (l, { eq: e }) => e(l.isActive, true),
          orderBy: (l, { asc }) => [asc(l.position)],
        },
        user: { columns: { name: true, image: true } },
      },
    });
    return page ?? null;
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
