import { z } from "zod"

const AuthSchema = {
    LoginUserSchema: z.object({
        email: z.string().email(),
        password: z.string().min(4)
    })
}

export default AuthSchema