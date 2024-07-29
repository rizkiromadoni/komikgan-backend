import { z } from "zod"

const UserSchema = {
  RegisterUserSchema: z.object({
    username: z.string().min(4).max(20),
    email: z.string().email(),
    password: z.string().min(4)
  }),
  UpdateProfileSchema: z.object({
    username: z.string().min(4).max(20).optional(),
    email: z.string().email().optional(),
    password: z.string().min(4).optional(),
    image: z.string().optional(),
  }),
  GetUsersQuery: z.object({
    cursor: z.coerce.number().optional(),
    limit: z.coerce.number().optional(),
    role: z.enum(["user", "admin", "superadmin"]).optional()
  }),
  UpdateUserSchema: z.object({
    username: z.string().min(4).max(20).optional(),
    email: z.string().email().optional(),
    password: z.string().min(4).optional(),
    image: z.string().optional(),
    role: z.enum(["user", "admin", "superadmin"]).optional()
  })
}

export default UserSchema
