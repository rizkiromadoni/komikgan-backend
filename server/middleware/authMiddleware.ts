import { getCookie } from "hono/cookie"
import { createMiddleware } from "hono/factory"
import { AuthenticationError, AuthorizationError } from "../lib/error"
import tokenManager from "../lib/tokenManager"

const authMiddleware = (disallowRoles: string[] = []) =>
  createMiddleware<{Variables: {
    user: {
        id: number,
        role: string,
        exp: number
    }
  }}>(async (c, next) => {
    const accessToken = getCookie(c, "accessToken")
    if (!accessToken) throw new AuthenticationError("Unauthenticated")

    const payload = await tokenManager.verifyAccessToken(accessToken) as any
    if (!payload) throw new AuthenticationError("Unauthenticated")

    if (disallowRoles.includes(payload.role)) throw new AuthorizationError("You are not allowed to access this resource")

    c.set("user", payload as any)
    await next()
  })

export default authMiddleware