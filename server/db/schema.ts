import { relations } from "drizzle-orm";
import { integer, pgEnum, pgTable, primaryKey, serial, text, timestamp, varchar } from "drizzle-orm/pg-core";

export const Role = pgEnum("role", ["user", "admin", "superadmin"]);
export const Status = pgEnum("status", ["draft", "published"]);

export const users = pgTable("users", {
    id: serial("id").primaryKey(),
    username: varchar("username", { length: 255 }).notNull().unique(),
    email: varchar("email", { length: 255 }).notNull().unique(),
    password: varchar("password", { length: 255 }).notNull(),
    role: Role("role").notNull().default("user"),
    image: text("image"),
    createdAt: timestamp("created_at", { precision: 3 }).notNull().defaultNow(),
    updatedAt: timestamp("updated_at", { precision: 3 }).notNull().defaultNow().$onUpdate(() => new Date()),
})

export const usersRelations = relations(users, ({ many }) => ({
    series: many(series),
    chapters: many(chapters),
    bookmarks: many(bookmarks)
}))

export const genres = pgTable("genres", {
    id: serial("id").primaryKey(),
    name: varchar("name", { length: 255 }).notNull(),
    slug: varchar("slug", { length: 255 }).notNull().unique(),
    createdAt: timestamp("created_at", { precision: 3 }).notNull().defaultNow(),
    updatedAt: timestamp("updated_at", { precision: 3 }).notNull().defaultNow().$onUpdate(() => new Date()),
})

export const genresRelations = relations(genres, ({ many }) => ({
    seriesToGenres: many(seriesToGenres)
}))

export const series = pgTable("series", {
    id: serial("id").primaryKey(),
    title: varchar("title", { length: 255 }).notNull(),
    alternative: varchar("alternative", { length: 255 }),
    slug: varchar("slug", { length: 255 }).notNull(),
    imageUrl: varchar("image_url", { length: 255 }),
    description: text("description"),
    status: Status("status").notNull().default("draft"),
    seriesType: varchar("series_type", { length: 20 }).notNull(),
    seriesStatus: varchar("series_status", { length: 20 }).notNull(),
    rating: varchar("rating", { length: 10 }),
    released: varchar("released", { length: 10 }),
    author: varchar("author", { length: 255 }),
    artist: varchar("artist", { length: 255 }),
    serialization: varchar("serialization", { length: 255 }),
    userId: integer("user_id").notNull().references(() => users.id),

    createdAt: timestamp("created_at", { precision: 3 }).notNull().defaultNow(),
    updatedAt: timestamp("updated_at", { precision: 3 }).notNull().defaultNow().$onUpdate(() => new Date()), 
})

export const seriesRelations = relations(series, ({ one, many }) => ({
    user: one(users, {
        fields: [series.userId],
        references: [users.id]
    }),
    seriesToGenres: many(seriesToGenres),
    chapters: many(chapters),
    bookmarks: many(bookmarks)
}))

export const seriesToGenres = pgTable("series_to_genres", {
    serieId: integer("serie_id").notNull().references(() => series.id, {onDelete: "cascade"}),
    genreId: integer("genre_id").notNull().references(() => genres.id, {onDelete: "cascade"}),
}, (t) => ({
    pk: primaryKey(({ columns: [t.serieId, t.genreId] }))
}))

export const seriesToGenresRelations = relations(seriesToGenres, ({ one }) => ({
    serie: one(series, {
        fields: [seriesToGenres.serieId],
        references: [series.id]
    }),
    genre: one(genres, {
        fields: [seriesToGenres.genreId],
        references: [genres.id]
    })
}))

export const chapters = pgTable("chapters", {
    id: serial("id").primaryKey(),
    title: varchar("title", { length: 255 }).notNull(),
    slug: varchar("slug", { length: 255 }).notNull(),
    chapter: varchar("chapter", { length: 255 }).notNull(),
    content: text("content").notNull(),
    status: Status("status").notNull().default("draft"),
    serieId: integer("serie_id").notNull().references(() => series.id, {onDelete: "cascade"}),
    userId: integer("user_id").notNull().references(() => users.id, {onDelete: "cascade"}),

    createdAt: timestamp("created_at", { precision: 3 }).notNull().defaultNow(),
    updatedAt: timestamp("updated_at", { precision: 3 }).notNull().defaultNow().$onUpdate(() => new Date()), 
})

export const chaptersRelations = relations(chapters, ({ one }) => ({
    serie: one(series, {
        fields: [chapters.serieId],
        references: [series.id]
    }),
    user: one(users, {
        fields: [chapters.userId],
        references: [users.id]
    })
}))

export const bookmarks = pgTable("bookmarks", {
    userId: integer("user_id").notNull().references(() => users.id, {onDelete: "cascade"}),
    serieId: integer("serie_id").notNull().references(() => series.id, {onDelete: "cascade"}),
}, (t) => ({
    pk: primaryKey(({ columns: [t.userId, t.serieId] }))
}))

export const bookmarksRelations = relations(bookmarks, ({ one }) => ({
    user: one(users, {
        fields: [bookmarks.userId],
        references: [users.id]
    }),
    serie: one(series, {
        fields: [bookmarks.serieId],
        references: [series.id]
    })
}))