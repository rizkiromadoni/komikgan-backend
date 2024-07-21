import { z } from "zod"

const UserSchema = {
  RegisterUserSchema: z.object({
    username: z.string().min(4).max(20),
    email: z.string().email(),
    password: z.string().min(4)
  })
}

export default UserSchema
