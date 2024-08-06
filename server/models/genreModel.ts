import { count, desc, eq } from "drizzle-orm"
import { db } from "../db"
import { genres } from "../db/schema"
import { slugify } from "../lib/utils"

type GetGenresArgs = {
    limit?: number
    page?: number
}

const genreModel = {
    getAllGenres: async () => {
        return db.query.genres.findMany({
            columns: {
                id: true,
                name: true,
                slug: true
            },
            orderBy: [desc(genres.name)]
        })
    },
    getGenres: async ({ page = 1, limit = 10 }: GetGenresArgs) => {
        const results = await db.query.genres.findMany({
            orderBy: [desc(genres.id)],
            limit: limit,
            offset: (page - 1) * limit
        })

        const counts = await db
            .select({ count: count() })
            .from(genres)

        return {
            totalPages: Math.ceil(counts[0].count / limit),
            data: results
        }
    },
    getGenre: async (identifier: string | number) => {
        return await db.query.genres.findFirst({
            where: typeof identifier === "number" ? eq(genres.id, identifier) : eq(genres.slug, identifier)
        })
    },
    createGenre: async (data: { name: string }) => {
        const result = await db
        .insert(genres)
        .values({ name: data.name, slug: slugify(data.name) })
        .returning()

        return result[0]
    },
    updateGenre: async (identifier: string | number, data: { name: string }) => {
        const result = await db
        .update(genres)
        .set({ name: data.name, slug: slugify(data.name) })
        .where(typeof identifier === "number" ? eq(genres.id, identifier) : eq(genres.slug, identifier))
        .returning()

        return result[0]
    },
    deleteGenre: async (identifier: string | number) => {
        const result = await db
        .delete(genres)
        .where(typeof identifier === "number" ? eq(genres.id, identifier) : eq(genres.slug, identifier))
        .returning()

        return result[0]
    }
}

export default genreModel