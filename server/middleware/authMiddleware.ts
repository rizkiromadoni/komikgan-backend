import { getCookie } from "hono/cookie"
import { createMiddleware } from "hono/factory"
import { AuthenticationError } from "../lib/error"
import tokenManager from "../lib/tokenManager"

const authMiddleware = () =>
  createMiddleware<{Variables: {
    user: {
        id: number,
        role: string,
        exp: number
    }
  }}>(async (c, next) => {
    const accessToken = getCookie(c, "accessToken")
    if (!accessToken) throw new AuthenticationError("Unauthenticated")

    const payload = await tokenManager.verifyAccessToken(accessToken)
    if (!payload) throw new AuthenticationError("Unauthenticated")

    c.set("user", payload as any)
    await next()
  })

export default authMiddleware