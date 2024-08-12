import { and, count, desc, eq, ilike } from "drizzle-orm"
import { db } from "../db"
import { genres, series, seriesToGenres } from "../db/schema"
import { slugify } from "../lib/utils"
import genreModel from "./genreModel"

type GetSeriesArgs = {
    page?: number
    limit?: number
    status?: "published" | "draft",
    search?: string
}

type CreateSerieArgs = {
    title: string
    alternative?: string
    imageUrl?: string
    description?: string
    status: "draft" | "published"
    seriesType: "manga" | "manhwa" | "manhua"
    seriesStatus: "ongoing" | "completed"
    rating?: string
    released?: string
    author?: string
    artist?: string
    serialization?: string
    genres?: string[]
    userId: number
}

type UpdateSerieArgs = {
    title?: string
    alternative?: string
    imageUrl?: string
    description?: string
    status?: "draft" | "published"
    seriesType?: "manga" | "manhwa" | "manhua"
    seriesStatus?: "ongoing" | "completed"
    rating?: string
    released?: string
    author?: string
    artist?: string
    serialization?: string
    genres?: string[]
    userId?: number
}

const serieModel = {
    getAllSeries: async () => {
        const results = await db.query.series.findMany({
            columns: {
                id: true,
                title: true,
                slug: true
            },
            orderBy: [desc(series.title)]
        })

        return results
    },
    getSeries: async ({ page = 1, limit = 10, status, search }: GetSeriesArgs) => {
        const results = await db.query.series.findMany({
            columns: {
                id: true,
                title: true,
                slug: true,
                imageUrl: true,
                description: true,
                status: true,
                createdAt: true,
                updatedAt: true  
            },
            where: and(
                status ? eq(series.status, status) : undefined,
                search ? ilike(series.title, `%${search}%`) : undefined
            ),
            orderBy: [desc(series.updatedAt)],
            limit: limit,
            offset: (page - 1) * limit,
            with: {
                user: {
                    columns: {
                        id: true,
                        username: true,
                        role: true
                    }
                }
            }
        })

        const counts = await db
            .select({ count: count() })
            .from(series)
            .where(status ? eq(series.status, status) : undefined)
    
        return {
            totalPages: Math.ceil(counts[0].count / limit),
            data: results
        }
    },
    getSerie: async (identifier: string | number) => {
        const result = await db.query.series.findFirst({
            where: typeof identifier === "number" ? eq(series.id, identifier) : eq(series.slug, identifier),
            with: {
                seriesToGenres: {
                    with: {
                        genre: true
                    }
                },
                user: {
                    columns: {
                        id: true,
                        username: true,
                        role: true
                    }
                }
            }
        })

        if (!result) return null
        const genres = result.seriesToGenres.map(s => s.genre)

        return {
            ...result,
            genres,
            seriesToGenres: undefined,
            userId: undefined
        }
    },
    createSerie: async (data: CreateSerieArgs) => {
        const result = await db
        .insert(series)
        .values({
            title: data.title,
            slug: slugify(data.title),
            alternative: data.alternative,
            imageUrl: data.imageUrl,
            description: data.description,
            status: data.status,
            seriesType: data.seriesType,
            seriesStatus: data.seriesStatus,
            rating: data.rating,
            released: data.released,
            author: data.author,
            artist: data.artist,
            serialization: data.serialization,
            userId: data.userId
        })
        .returning()

        // create genres if not exist and connect to them
        if (data.genres) {
            let genreIds: number[] = []
            for (const genre of data.genres) {
                if (genre.length > 0) {
                    const isExist = await db.query.genres.findFirst({ where: eq(genres.slug, slugify(genre)) })
                    
                    if (!isExist) {
                        const newGenre = await genreModel.createGenre({ name: genre })
                        genreIds.push(newGenre.id);
                    } else {
                        genreIds.push(isExist.id);
                    }   
                }
            }

            await db
                .insert(seriesToGenres)
                .values(genreIds.map(id => ({ genreId: id, serieId: result[0].id })))
                .returning()
        }

        return result[0]
    },
    updateSerie: async (id: number, data: UpdateSerieArgs) => {
        const result = await db
        .update(series)
        .set({
            title: data.title,
            slug: data.title ? slugify(data.title) : undefined,
            alternative: data.alternative,
            imageUrl: data.imageUrl,
            description: data.description,
            status: data.status,
            seriesType: data.seriesType,
            seriesStatus: data.seriesStatus,
            rating: data.rating,
            released: data.released,
            author: data.author,
            artist: data.artist,
            serialization: data.serialization,
            updatedAt: new Date(Date.now())
        })
        .where(eq(series.id, id))
        .returning()

        if (data.genres) {
            await db.delete(seriesToGenres).where(eq(seriesToGenres.serieId, id))

            let genreIds: number[] = []
            for (const genre of data.genres) {
                if (genre.length > 0) {
                    const isExist = await db.query.genres.findFirst({ where: eq(genres.slug, slugify(genre)) })
                    
                    if (!isExist) {
                        const newGenre = await genreModel.createGenre({ name: genre })
                        genreIds.push(newGenre.id);
                    } else {
                        genreIds.push(isExist.id);
                    }   
                }
            }

            await db
                .insert(seriesToGenres)
                .values(genreIds.map(genreId => ({ genreId: genreId, serieId: id })))
        }

        return result[0]
    },
    deleteSerie: async (id: number) => {
        const result = await db.delete(series).where(eq(series.id, id)).returning()
        return result[0]
    }
}

export default serieModel