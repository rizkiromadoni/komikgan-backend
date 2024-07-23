import { z } from "zod"

const AuthSchema = {
    LoginUserSchema: z.object({
        email: z.string().email(),
        password: z.string().min(4)
    }),
    RefreshTokenSchema: z.object({
        refreshToken: z.string().min(1)
    })
}

export default AuthSchema