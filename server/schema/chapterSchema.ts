import { z } from "@hono/zod-openapi"

const ChapterSchema = {
    GetChaptersSchema: {
        query: z.object({
            page: z.coerce.number().optional(),
            limit: z.coerce.number().optional(),
            status: z.enum(["draft", "published"]).optional(),
            search: z.string().optional()
        }),
        response: z.object({
            status: z.string().default("success"),
            data: z.object({
                totalPages: z.number(),
                data: z.array(z.object({
                    id: z.number(),
                    title: z.string(),
                    slug: z.string(),
                    chapter: z.string(),
                    status: z.string(),
                    createdAt: z.date(),
                    updatedAt: z.date(),
                    user: z.object({
                        username: z.string()
                    }),
                    serie: z.object({
                        id: z.number(),
                        title: z.string(),
                        slug: z.string(),
                        imageUrl: z.string().nullish(),
                    })
                }))
            })
        })
    },
    GetChapterSchema: {
        params: z.object({
            slug: z.string()
        }),
        response: z.object({
            status: z.string().default("success"),
            data: z.object({
                id: z.number(),
                title: z.string(),
                slug: z.string(),
                content: z.array(z.string()),
                chapter: z.string(),
                status: z.string(),
                createdAt: z.date(),
                updatedAt: z.date(),
                user: z.object({
                    username: z.string()
                }),
                serie: z.object({
                    id: z.number(),
                    title: z.string(),
                    slug: z.string(),
                    imageUrl: z.string().nullish(),
                })
            })
        })
    },
    CreateChapterSchema: {
        requestBody: z.object({
            title: z.string().min(1),
            content: z.string().min(1),
            chapter: z.string().min(1),
            status: z.enum(["draft", "published"]).default("draft"),
            serieId: z.number()
        }),
        response: z.object({
            status: z.string().default("success"),
            data: z.object({
                id: z.number(),
                title: z.string(),
                slug: z.string(),
            })
        })
    },
    UpdateChapterSchema: {
        params: z.object({
            id: z.coerce.number()
        }),
        requestBody: z.object({
            title: z.string().optional(),
            content: z.string().optional(),
            chapter: z.string().optional(),
            status: z.enum(["draft", "published"]).optional(),
            serieId: z.number().optional()
        }),
        response: z.object({
            status: z.string().default("success"),
            data: z.object({
                id: z.number(),
                title: z.string(),
                slug: z.string(),
            })
        })
    },
    DeleteChapterSchema: {
        params: z.object({
            id: z.coerce.number()
        }),
        response: z.object({
            status: z.string().default("success"),
            data: z.object({
                id: z.number(),
                title: z.string(),
                slug: z.string()
            })
        })
    }
}

export default ChapterSchema