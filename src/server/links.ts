import { createServerFn } from "@tanstack/react-start";
import { db } from "../db";
import { links } from "../db/schema";
import { eq } from "drizzle-orm";
import { ensureSession } from "./auth";

export const getLinksByPageId = createServerFn({ method: "GET" }).handler(
  async ({ data }: { data: any }) => {
    const pageId = data as number;
    await ensureSession();
    const result = await db.query.links.findMany({
      where: eq(links.pageId, pageId),
      orderBy: (l: any, { asc }: any) => [asc(l.position)],
    });
    return result;
  },
);

export const createLink = createServerFn({ method: "POST" }).handler(
  async ({ data }: { data: any }) => {
    const typedData = data as {
      pageId: number;
      title: string;
      url: string;
      icon?: string;
      customIcon?: { type: string; value: string };
      color?: string;
      textColor?: string;
      position?: number;
    };
    await ensureSession();
    const [result] = await db.insert(links).values({
      pageId: typedData.pageId,
      title: typedData.title,
      url: typedData.url,
      icon: typedData.icon ?? null,
      customIcon: typedData.customIcon ? JSON.stringify(typedData.customIcon) : null,
      color: typedData.color ?? "default",
      textColor: typedData.textColor ?? "default",
      position: typedData.position ?? 0,
    });
    return { id: result.insertId };
  },
);

export const updateLink = createServerFn({ method: "POST" }).handler(
  async ({ data }: { data: any }) => {
    const typedData = data as {
      id: number;
      title?: string;
      url?: string;
      icon?: string;
      customIcon?: { type: string; value: string };
      color?: string;
      textColor?: string;
      position?: number;
      isActive?: boolean;
    };
    await ensureSession();
    const { id, customIcon, ...updates } = typedData;
    const setData: any = { ...updates };
    if (customIcon !== undefined) {
      setData.customIcon = customIcon ? JSON.stringify(customIcon) : null;
    }
    await db.update(links).set(setData).where(eq(links.id, id));
    return { success: true };
  },
);

export const deleteLink = createServerFn({ method: "POST" }).handler(
  async ({ data }: { data: any }) => {
    const id = data as number;
    await ensureSession();
    await db.delete(links).where(eq(links.id, id));
    return { success: true };
  },
);

export const reorderLinks = createServerFn({ method: "POST" }).handler(
  async ({ data }: { data: any }) => {
    const typedData = data as { pageId: number; orderedIds: number[] };
    await ensureSession();
    const updates = typedData.orderedIds.map((linkId, index) =>
      db.update(links).set({ position: index }).where(eq(links.id, linkId)),
    );
    await Promise.all(updates);
    return { success: true };
  },
);
