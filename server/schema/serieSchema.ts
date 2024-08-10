import { z } from "@hono/zod-openapi"

const SerieSchema = {
    GetAllSeriesSchema: {
        response: z.object({
            status: z.string().default("success"),
            data: z.array(z.object({
                id: z.number(),
                title: z.string(),
                slug: z.string()
            }))
        })  
    },
    GetSeriesSchema: {
        query: z.object({
            page: z.coerce.number().optional(),
            limit: z.coerce.number().optional(),
            status: z.enum(["draft", "published"]).optional()
        }),
        response: z.object({
            status: z.string().default("success"),
            data: z.object({
                totalPages: z.number(),
                data: z.array(z.object({
                    id: z.number(),
                    title: z.string(),
                    slug: z.string(),
                    imageUrl: z.string().nullish(),
                    description: z.string().nullish(),
                    status: z.string(),
                    createdAt: z.date(),
                    updatedAt: z.date(),
                    user: z.object({
                        id: z.number(),
                        username: z.string(),
                        role: z.string()
                    })
                }))
            })
        })
    },
    GetSerieSchema: {
        params: z.object({
            slug: z.string()
        }),
        response: z.object({
            status: z.string().default("success"),
            data: z.object({
                id: z.number(),
                title: z.string(),
                alternative: z.string().nullish(),
                imageUrl: z.string().nullish(),
                description: z.string().nullish(),
                status: z.string(),
                seriesType: z.string(),
                seriesStatus: z.string(),
                rating: z.string().nullish(),
                released: z.string().nullish(),
                author: z.string().nullish(),
                artist: z.string().nullish(),
                serialization: z.string().nullish(),
                genres: z.array(z.string()).nullish(),
                userId: z.number(),
                createdAt: z.date(),
                updatedAt: z.date()
            })
        })
    },
    CreateSerieSchema: {
        requestBody: z.object({
            title: z.string().min(1),
            alternative: z.string().optional(),
            imageUrl: z.string().optional(),
            image: z.string().optional(),
            description: z.string().optional(),
            status: z.enum(["draft", "published"]).default("draft"),
            seriesType: z.enum(["manga", "manhwa", "manhua"]).default("manga"),
            seriesStatus: z.enum(["ongoing", "completed"]).default("ongoing"),
            rating: z.string().optional(),
            released: z.string().optional(),
            author: z.string().optional(),
            artist: z.string().optional(),
            serialization: z.string().optional(),
            genres: z.array(z.string()).optional()
        }),
        response: z.object({
            status: z.string().default("success"),
            data: z.object({
                id: z.number(),
                title: z.string(),
                slug: z.string(),
                imageurl: z.string().optional(),
                userId: z.number()
            })
        })
    },
    UpdateSerieSchema: {
        params: z.object({
            id: z.coerce.number().min(1)
        }),
        requestBody: z.object({
            title: z.string().optional(),
            alternative: z.string().optional(),
            imageUrl: z.string().optional(),
            image: z.string().optional(),
            description: z.string().optional(),
            status: z.enum(["draft", "published"]).optional(),
            seriesType: z.enum(["manga", "manhwa", "manhua"]).optional(),
            seriesStatus: z.enum(["ongoing", "completed"]).optional(),
            rating: z.string().optional(),
            released: z.string().optional(),
            author: z.string().optional(),
            artist: z.string().optional(),
            serialization: z.string().optional(),
            genres: z.array(z.string()).optional()
        }),
        response: z.object({
            status: z.string().default("success"),
            data: z.object({
                id: z.number(),
                title: z.string(),
                slug: z.string(),
                imageurl: z.string().optional(),
                userId: z.number()
            })
        })
    },
    DeleteSerieSchema: {
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
    },
}

export default SerieSchema