import {
  mysqlTable,
  varchar,
  text,
  boolean,
  int,
  timestamp,
  index,
  uniqueIndex,
} from "drizzle-orm/mysql-core";
import { relations } from "drizzle-orm";

// ─── Better Auth tables (auto-generated schema) ────────────────────
export const user = mysqlTable("user", {
  id: varchar("id", { length: 36 }).primaryKey(),
  name: varchar("name", { length: 255 }).notNull(),
  email: varchar("email", { length: 255 }).notNull().unique(),
  emailVerified: boolean("email_verified").notNull().default(false),
  image: text("image"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow().onUpdateNow(),
});

export const session = mysqlTable("session", {
  id: varchar("id", { length: 36 }).primaryKey(),
  expiresAt: timestamp("expires_at").notNull(),
  token: varchar("token", { length: 255 }).notNull().unique(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow().onUpdateNow(),
  ipAddress: varchar("ip_address", { length: 45 }),
  userAgent: text("user_agent"),
  userId: varchar("user_id", { length: 36 })
    .notNull()
    .references(() => user.id, { onDelete: "cascade" }),
});

export const account = mysqlTable("account", {
  id: varchar("id", { length: 36 }).primaryKey(),
  accountId: varchar("account_id", { length: 255 }).notNull(),
  providerId: varchar("provider_id", { length: 255 }).notNull(),
  userId: varchar("user_id", { length: 36 })
    .notNull()
    .references(() => user.id, { onDelete: "cascade" }),
  accessToken: text("access_token"),
  refreshToken: text("refresh_token"),
  idToken: text("id_token"),
  accessTokenExpiresAt: timestamp("access_token_expires_at"),
  refreshTokenExpiresAt: timestamp("refresh_token_expires_at"),
  scope: varchar("scope", { length: 255 }),
  password: text("password"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow().onUpdateNow(),
});

export const verification = mysqlTable("verification", {
  id: varchar("id", { length: 36 }).primaryKey(),
  identifier: varchar("identifier", { length: 255 }).notNull(),
  value: varchar("value", { length: 255 }).notNull(),
  expiresAt: timestamp("expires_at").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow().onUpdateNow(),
});

// ─── Application tables ────────────────────────────────────────────
export const pages = mysqlTable(
  "pages",
  {
    id: int("id").primaryKey().autoincrement(),
    userId: varchar("user_id", { length: 36 })
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
    slug: varchar("slug", { length: 100 }).notNull(),
    title: varchar("title", { length: 255 }).notNull(),
    bio: text("bio"),
    avatarUrl: text("avatar_url"),
    theme: varchar("theme", { length: 50 }).default("default"),
    backgroundPattern: varchar("background_pattern", { length: 255 }).default("gradient-indigo-emerald"),
    isActive: boolean("is_active").notNull().default(true),
    createdAt: timestamp("created_at").notNull().defaultNow(),
    updatedAt: timestamp("updated_at").notNull().defaultNow().onUpdateNow(),
  },
  (table) => [
    uniqueIndex("slug_idx").on(table.slug),
    index("user_id_idx").on(table.userId),
  ],
);

export const links = mysqlTable(
  "links",
  {
    id: int("id").primaryKey().autoincrement(),
    pageId: int("page_id")
      .notNull()
      .references(() => pages.id, { onDelete: "cascade" }),
    title: varchar("title", { length: 255 }).notNull(),
    url: text("url").notNull(),
    icon: varchar("icon", { length: 100 }),
    customIcon: text("custom_icon"),
    color: varchar("color", { length: 20 }).default("default"),
    textColor: varchar("text_color", { length: 20 }).default("default"),
    position: int("position").notNull().default(0),
    isActive: boolean("is_active").notNull().default(true),
    createdAt: timestamp("created_at").notNull().defaultNow(),
    updatedAt: timestamp("updated_at").notNull().defaultNow().onUpdateNow(),
  },
  (table) => [index("page_id_idx").on(table.pageId)],
);

export const clicks = mysqlTable(
  "clicks",
  {
    id: int("id").primaryKey().autoincrement(),
    linkId: int("link_id")
      .notNull()
      .references(() => links.id, { onDelete: "cascade" }),
    ipAddress: varchar("ip_address", { length: 45 }),
    userAgent: text("user_agent"),
    referer: text("referer"),
    clickedAt: timestamp("clicked_at").notNull().defaultNow(),
  },
  (table) => [index("link_id_idx").on(table.linkId)],
);

// ─── Relations ─────────────────────────────────────────────────────
export const userRelations = relations(user, ({ many }) => ({
  sessions: many(session),
  accounts: many(account),
  pages: many(pages),
}));

export const sessionRelations = relations(session, ({ one }) => ({
  user: one(user, { fields: [session.userId], references: [user.id] }),
}));

export const accountRelations = relations(account, ({ one }) => ({
  user: one(user, { fields: [account.userId], references: [user.id] }),
}));

export const pagesRelations = relations(pages, ({ one, many }) => ({
  user: one(user, { fields: [pages.userId], references: [user.id] }),
  links: many(links),
}));

export const linksRelations = relations(links, ({ one, many }) => ({
  page: one(pages, { fields: [links.pageId], references: [pages.id] }),
  clicks: many(clicks),
}));

export const clicksRelations = relations(clicks, ({ one }) => ({
  link: one(links, { fields: [clicks.linkId], references: [links.id] }),
}));
