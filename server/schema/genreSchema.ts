import { z } from "@hono/zod-openapi"

const GenreSchema = {
    GetAllGenres: {
        response: z.object({
            status: z.string().default("success"),
            data: z.array(z.object({
                id: z.number(),
                name: z.string(),
                slug: z.string()
            }))
        })
    },
    GetGenresSchema: {
        query: z.object({
            page: z.coerce.number().optional(),
            limit: z.coerce.number().optional()
        }),
        response: z.object({
            status: z.string().default("success"),
            data: z.object({
                totalPages: z.number(),
                data: z.array(z.object({
                    id: z.number(),
                    name: z.string(),
                    slug: z.string()
                }))
            })
        })
    },
    GetGenreSchema: {
        params: z.object({
            slug: z.string()
        }),
        response: z.object({
            status: z.string().default("success"),
            data: z.object({
                id: z.number(),
                name: z.string(),
                slug: z.string()
            })
        })
    },
    CreateGenreSchema: {
        requestBody: z.object({
            name: z.string()
        }),
        response: z.object({
            status: z.string().default("success"),
            data: z.object({
                id: z.number(),
                name: z.string(),
                slug: z.string()
            })
        })
    },
    UpdateGenreSchema: {
        params: z.object({
            id: z.coerce.number()
        }),
        requestBody: z.object({
            name: z.string()
        }),
        response: z.object({
            status: z.string().default("success"),
            data: z.object({
                id: z.number(),
                name: z.string(),
                slug: z.string()
            })
        })
    },
    DeleteGenreSchema: {
        params: z.object({
            id: z.coerce.number()
        }),
        response: z.object({
            status: z.string().default("success"),
            data: z.object({
                id: z.number(),
                name: z.string(),
                slug: z.string()
            })
        })
    }
}

export default GenreSchema