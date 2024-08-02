import { z } from "@hono/zod-openapi"

const AuthSchema = {
    LoginUserSchema: {
        requestBody: z.object({
            email: z.string().email(),
            password: z.string().min(4)
        }),
        response: z.object({
            status: z.string(),
            data: z.object({
                accessToken: z.string(),
                refreshToken: z.string()
            })
        })
    },
    RefreshTokenSchema: {
        response: z.object({
            status: z.string(),
            data: z.object({
                accessToken: z.string(),
                refreshToken: z.string()
            })
        })
    },
    LogoutUserSchema: {
        response: z.object({
            status: z.string(),
            message: z.string(),
        })
    }
}

export default AuthSchema