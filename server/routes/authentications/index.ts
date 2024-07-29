import { zValidator } from "@hono/zod-validator";
import { Hono } from "hono";
import AuthSchema from "./schema";
import { getUser } from "../../models/userModel";
import { AuthenticationError } from "../../lib/error";
import passwordManager from "../../lib/passwordManager";
import tokenManager from "../../lib/tokenManager";
import redis from "../../lib/redis";
import { getCookie, setCookie } from "hono/cookie";

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

        setCookie(c, "accessToken", accessToken, {
            httpOnly: true,
            sameSite: "lax"
        })
        setCookie(c, "refreshToken", refreshToken, {
            httpOnly: true,
            sameSite: "lax"
        })

        return c.json({
            status: "success",
            data: { accessToken, refreshToken }
        })
    }
)

.put("/",
    async (c) => {
        const refreshToken = getCookie(c, "refreshToken")
        if (!refreshToken) throw new AuthenticationError("Unauthenticated")

        const payload = await tokenManager.verifyRefreshToken(refreshToken) as any
        if (!payload) throw new AuthenticationError("Invalid refresh token")

        const user = await getUser({ id: payload.id })
        if (!user) throw new AuthenticationError("Invalid refresh token")

        const storedRefreshToken = await redis.get(`refreshToken:${user.id}`)
        if (storedRefreshToken !== refreshToken) throw new AuthenticationError("Invalid refresh token")

        const accessToken = await tokenManager.generateAccessToken({ id: user.id, role: user.role })
        const newRefreshToken = await tokenManager.generateRefreshToken({ id: user.id, role: user.role })

        await redis.set(`refreshToken:${user.id}`, newRefreshToken)

        setCookie(c, "accessToken", accessToken, {
            httpOnly: true,
            sameSite: "lax"
        })
        setCookie(c, "refreshToken", newRefreshToken, {
            httpOnly: true,
            sameSite: "lax"
        })

        return c.json({
            status: "success",
            data: { accessToken, refreshToken: newRefreshToken }
        })
    }
)

.delete("/",
    async (c) => {
        const refreshToken = getCookie(c, "refreshToken")
        if (!refreshToken) return c.json({ status: "success", message: "Logout success" })

        const payload = await tokenManager.verifyRefreshToken(refreshToken) as any
        if (!payload) return c.json({ status: "success", message: "Logout success" })

        await redis.set(`refreshToken:${payload.id}`, "")
        setCookie(c, "accessToken", "", {
            httpOnly: true,
            sameSite: "lax"
        })
        setCookie(c, "refreshToken", "", {
            httpOnly: true,
            sameSite: "lax"
        })

        return c.json({ status: "success", message: "Logout success" })
    }
)

export default authRoutes