import { and, count, desc, eq, ilike } from "drizzle-orm"
import { db } from "../db"
import { chapters } from "../db/schema"
import { slugify } from "../lib/utils"

type GetChaptersArgs = {
    page?: number
    limit?: number
    status?: "published" | "draft",
    search?: string
}

type CreateChapterArgs = {
    title: string
    content: string
    status: "draft" | "published"
    chapter: string
    serieId: number
    userId: number
}

type UpdateChapterArgs = {
    title?: string
    content?: string
    status?: "draft" | "published"
    chapter?: string
    serieId?: number
}

const chapterModel = {
    getChapters: async ({ page = 1, limit = 10, status, search }: GetChaptersArgs) => {
        const results = await db.query.chapters.findMany({
            where: and(
                status ? eq(chapters.status, status) : undefined,
                search ? ilike(chapters.title, `%${search}%`) : undefined
            ),
            columns: {
                id: true,
                title: true,
                slug: true,
                chapter: true,
                status: true,
                createdAt: true,
                updatedAt: true,
            },
            orderBy: [desc(chapters.updatedAt)],
            limit: limit,
            offset: (page - 1) * limit,
            with: {
                user: {
                    columns: {
                        username: true
                    }
                },
                serie: {
                    columns: {
                        id: true,
                        title: true,
                        slug: true,
                        imageUrl: true
                    }
                }
            }
        })

        const counts = await db
            .select({ count: count() })
            .from(chapters)
            .where(and(
                status ? eq(chapters.status, status) : undefined,
                search ? ilike(chapters.title, `%${search}%`) : undefined
            ))
    
        return {
            totalPages: Math.ceil(counts[0].count / limit),
            data: results
        }
    },
    getChapter: async (identifier: string | number ) => {
        const result = await db.query.chapters.findFirst({
            where: typeof identifier === "number" ? eq(chapters.id, identifier) : eq(chapters.slug, identifier),
            with: {
                user: {
                    columns: {
                        username: true
                    }
                },
                serie: {
                    columns: {
                        id: true,
                        title: true,
                        slug: true,
                        imageUrl: true
                    }
                }
            }
        })

        return result
    },
    createChapter: async (data: CreateChapterArgs) => {
        const result = await db
        .insert(chapters)
        .values({
            title: data.title,
            slug: slugify(data.title),
            content: data.content,
            status: data.status,
            chapter: data.chapter,
            serieId: data.serieId,
            userId: data.userId,
            createdAt: new Date(Date.now()),
            updatedAt: new Date(Date.now()),
        })
        .returning()

        return result[0]
    },
    updateChapter: async (id: number, data: UpdateChapterArgs) => {
        const result = await db.update(chapters).set({
            title: data.title,
            slug: data.title ? slugify(data.title) : undefined,
            content: data.content,
            status: data.status,
            chapter: data.chapter,
            serieId: data.serieId,
            updatedAt: new Date(Date.now())
        })
        .where(eq(chapters.id, id))
        .returning()

        return result[0]
    },
    deleteChapter: async (id: number) => {
        const result = await db.delete(chapters).where(eq(chapters.id, id)).returning()
        return result[0]
    }
}
export default chapterModel