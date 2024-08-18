import { z } from "@hono/zod-openapi"

const GenreSchema = {
  GetAllGenres: {
    response: z.object({
      status: z.string().default("success"),
      data: z.array(
        z.object({
          id: z.number(),
          name: z.string(),
          slug: z.string(),
          count: z.number()
        })
      )
    })
  },
  GetGenresSchema: {
    query: z.object({
      page: z.coerce.number().optional(),
      limit: z.coerce.number().optional(),
      search: z.string().optional()
    }),
    response: z.object({
      status: z.string().default("success"),
      data: z.object({
        totalPages: z.number(),
        data: z.array(
          z.object({
            id: z.number(),
            name: z.string(),
            slug: z.string()
          })
        )
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
  GetGenreSeriesSchema: {
    params: z.object({
      slug: z.string()
    }),
    query: z.object({
      page: z.coerce.number().optional(),
      limit: z.coerce.number().optional()
    }),
    response: z.object({
      status: z.string().default("success"),
      data: z.object({
        totalPages: z.number(),
        genre: z.object({
          id: z.number(),
          name: z.string(),
          slug: z.string()
        }),
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
