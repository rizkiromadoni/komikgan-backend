import { z } from "@hono/zod-openapi"

const BookmarkSchema = {
  GetBookmarksSchema: {
    query: z.object({
      page: z.coerce.number().optional(),
      limit: z.coerce.number().optional()
    }),
    response: z.object({
      status: z.string().default("success"),
      data: z.object({
        count: z.number(),
        totalPages: z.number(),
        series: z.array(
          z.object({
            id: z.number(),
            title: z.string(),
            slug: z.string(),
            imageUrl: z.string().nullish(),
            description: z.string().nullish(),
            seriesStatus: z.string(),
            seriesType: z.string(),
            rating: z.string().nullish(),
            status: z.string(),
            createdAt: z.date(),
            updatedAt: z.date(),
            user: z.object({
              username: z.string()
            }),
            genres: z.array(
              z.object({
                id: z.number(),
                name: z.string(),
                slug: z.string()
              })
            )
          })
        )
      })
    })
  },
  CreateBookmarkSchema: {
    requestBody: z.object({
      serieId: z.coerce.number()
    }),
    response: z.object({
      status: z.string().default("success"),
      data: z.object({
        message: z.string()
      })
    })
  },
  DeleteBookmarkSchema: {
    params: z.object({
      id: z.coerce.number()
    }),
    response: z.object({
      status: z.string().default("success"),
      data: z.object({
        message: z.string()
      })
    })
  }
}

export default BookmarkSchema
