import { users } from "./../../db/schema"
import { Hono } from "hono"
import { zValidator } from "@hono/zod-validator"

import UserSchema from "./schema"
import { InvariantError } from "../../lib/error"
import { createUser, getUser } from "../../models/userModel"
import { db } from "../../db"
import { count, eq } from "drizzle-orm"
import { jwt, type JwtVariables } from "hono/jwt"
import authMiddleware from "../../middleware/authMiddleware"

type Variables = JwtVariables

const userRoutes = new Hono<{ Variables: Variables }>()

.get("/me",
    authMiddleware(),
    async (c) => {
        const { id } = c.get("jwtPayload")

        const user = await getUser({ id })
        if (!user) throw new InvariantError("User not found")

        return c.json({
            status: "success",
            data: {
                id: user.id,
                username: user.username,
                email: user.email,
                role: user.role,
                image: user.image,
            }
        })
    }
)

.post("/register",
    zValidator("json", UserSchema.RegisterUserSchema),
    async (c) => {
        const payload = c.req.valid("json")

        const isExist = await getUser({ username: payload.username, email: payload.email })
        if (isExist) throw new InvariantError("User already exist")

        const userCount = await db.select({ count: count() }).from(users).where(eq(users.role, "superadmin"))
        
        const user = await createUser({
            ...payload,
            role: userCount[0].count === 0 ? "superadmin" : "user"
        })
        return c.json({
            status: "success",
            data: {
                id: user.id,
                username: user.username,
                email: user.email
            }
        })
    }
)

export default userRoutes
