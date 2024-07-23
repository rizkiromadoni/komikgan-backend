import { zValidator } from "@hono/zod-validator";
import { Hono } from "hono";
import AuthSchema from "./schema";
import { getUser } from "../../models/userModel";
import { AuthenticationError } from "../../lib/error";
import passwordManager from "../../lib/passwordManager";
import tokenManager from "../../lib/tokenManager";
import redis from "../../lib/redis";

const authRoutes = new Hono()

.post("/",
    zValidator("json", AuthSchema.LoginUserSchema),
    async (c) => {
        const payload = c.req.valid("json")

        const user = await getUser({ email: payload.email })
        if (!user) throw new AuthenticationError("email or password is incorrect")

        const isMatch = await passwordManager.verify(payload.password, user.password)
        if (!isMatch) throw new AuthenticationError("email or password is incorrect")

        const userPayload = {
            id: user.id,
            role: user.role
        }

        const accessToken = await tokenManager.generateAccessToken(userPayload)
        const refreshToken = await tokenManager.generateRefreshToken(userPayload)

        await redis.set(`refreshToken:${user.id}`, refreshToken)

        return c.json({
            status: "success",
            data: { accessToken, refreshToken }
        })
    }
)

export default authRoutes