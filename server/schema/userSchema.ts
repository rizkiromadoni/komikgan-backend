import { z } from "@hono/zod-openapi"

const UserSchema = {
  RegisterUserSchema: {
    requestBody: z.object({
      username: z.string().min(4).max(20),
      email: z.string().email(),
      password: z.string().min(4)
    }),
    response: z.object({
      status: z.string().default("success"),
      data: z.object({
        id: z.number(),
        username: z.string(),
        email: z.string()
      })
    })
  },
  GetUserProfileSchema: {
    response: z.object({
      status: z.string().default("success"),
      data: z.object({
        id: z.number(),
        username: z.string(),
        email: z.string(),
        role: z.string(),
        image: z.string().nullish()
      })
    })
  },
  UpdateUserProfileSchema: {
    requestBody: z.object({
      username: z.string().min(4).max(20).optional(),
      email: z.string().email().optional(),
      password: z.string().min(4).optional(),
      image: z.string().optional()
    }),
    response: z.object({
      status: z.string().default("success"),
      data: z.object({
        id: z.number(),
        username: z.string(),
        email: z.string()
      })
    })
  },
  GetUsersSchema: {
    query: z.object({
      page: z.coerce.number().optional(),
      limit: z.coerce.number().optional(),
      role: z.enum(["user", "admin", "superadmin"]).optional()
    }),
    response: z.object({
      status: z.string().default("success"),
      data: z.object({
        totalPages: z.number(),
        data: z.array(z.object({
          id: z.number(),
          username: z.string(),
          email: z.string(),
          role: z.string(),
          image: z.string().nullish(),
          createdAt: z.date(),
          updatedAt: z.date()
        }))
      })
    })
  },
  GetUserSchema: {
    requestParams: z.object({
      username: z.string()
    }),
    response: z.object({
      status: z.string().default("success"),
      data: z.object({
        id: z.number(),
        username: z.string(),
        email: z.string(),
        role: z.string(),
        image: z.string().nullish(),
        createdAt: z.date(),
        updatedAt: z.date()
      })
    })
  },
  CreateUserSchema: {
    requestBody: z.object({
      username: z.string().min(4).max(20),
      email: z.string().email(),
      password: z.string().min(4),
      role: z.enum(["user", "admin", "superadmin"])
    }),
    response: z.object({
      status: z.string().default("success"),
      data: z.object({
        id: z.number(),
        username: z.string(),
        email: z.string(),
        role: z.string()
      })
    })
  },
  UpdateUserSchema: {
    requestParams: z.object({
      username: z.string()
    }),
    requestBody: z.object({
      username: z.string().min(4).max(20).optional(),
      email: z.string().email().optional(),
      password: z.string().min(4).optional(),
      image: z.string().optional(),
      role: z.enum(["user", "admin", "superadmin"]).optional()
    }),
    response: z.object({
      status: z.string().default("success"),
      data: z.object({
        id: z.number(),
        username: z.string(),
        email: z.string()
      })
    })
  },
  DeleteUserSchema: {
    requestParams: z.object({
      username: z.string()
    }),
    response: z.object({
      status: z.string().default("success"),
      data: z.object({
        id: z.number(),
        username: z.string(),
        email: z.string()
      })
    })
  }
}

export default UserSchema
