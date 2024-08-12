import { and, count, desc, eq, ilike } from "drizzle-orm"
import { db } from "../db"
import { genres, seriesToGenres } from "../db/schema"
import { slugify } from "../lib/utils"

type GetGenresArgs = {
    limit?: number
    page?: number
    search?: string
}

const genreModel = {
    getAllGenres: async () => {
        const results = await db.select({
            id: genres.id,
            name: genres.name,
            slug: genres.slug,
            count: count(seriesToGenres.serieId)
        }).from(genres).leftJoin(seriesToGenres, eq(seriesToGenres.genreId, genres.id)).groupBy(genres.id)

        return results
    },
    getGenres: async ({ page = 1, limit = 10, search }: GetGenresArgs) => {
        const results = await db.query.genres.findMany({
            where: search ? ilike(genres.name, `%${search}%`) : undefined,
            orderBy: [desc(genres.id)],
            limit: limit,
            offset: (page - 1) * limit
        })

        const counts = await db
            .select({ count: count() })
            .from(genres)
            .where(search ? ilike(genres.name, `%${search}%`) : undefined)

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