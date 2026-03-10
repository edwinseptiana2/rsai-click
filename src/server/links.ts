import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { db } from "../db";
import { links } from "../db/schema";
import { eq } from "drizzle-orm";
import { ensureSession } from "./auth";

export const getLinksByPageId = createServerFn({ method: "GET" })
  .inputValidator(z.number())
  .handler(async ({ data }) => {
    const pageId = data;
    await ensureSession();
    const result = await db.query.links.findMany({
      where: eq(links.pageId, pageId),
      orderBy: (l: any, { asc }: any) => [asc(l.position)],
    });
    return result;
  },
);

export const createLink = createServerFn({ method: "POST" })
  .inputValidator(
    z.object({
      pageId: z.number(),
      title: z.string(),
      url: z.string(),
      icon: z.string().optional().nullable(),
      customIcon: z
        .object({
          type: z.string(),
          value: z.string(),
        })
        .optional()
        .nullable(),
      color: z.string().optional(),
      textColor: z.string().optional(),
      position: z.number().optional(),
    }),
  )
  .handler(async ({ data }) => {
    const typedData = data;
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

export const updateLink = createServerFn({ method: "POST" })
  .inputValidator(
    z.object({
      id: z.number(),
      title: z.string().optional(),
      url: z.string().optional(),
      icon: z.string().optional().nullable(),
      customIcon: z
        .object({
          type: z.string(),
          value: z.string(),
        })
        .optional()
        .nullable(),
      color: z.string().optional(),
      textColor: z.string().optional(),
      position: z.number().optional(),
      isActive: z.boolean().optional(),
    }),
  )
  .handler(async ({ data }) => {
    const typedData = data;
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

export const deleteLink = createServerFn({ method: "POST" })
  .inputValidator(z.number())
  .handler(async ({ data }) => {
    const id = data;
    await ensureSession();
    await db.delete(links).where(eq(links.id, id));
    return { success: true };
  },
);

export const reorderLinks = createServerFn({ method: "POST" })
  .inputValidator(
    z.object({
      pageId: z.number(),
      orderedIds: z.array(z.number()),
    }),
  )
  .handler(async ({ data }) => {
    const typedData = data;
    await ensureSession();
    const updates = typedData.orderedIds.map((linkId, index) =>
      db.update(links).set({ position: index }).where(eq(links.id, linkId)),
    );
    await Promise.all(updates);
    return { success: true };
  },
);
