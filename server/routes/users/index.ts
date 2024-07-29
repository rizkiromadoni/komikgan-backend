import { users } from "./../../db/schema"
import { Hono } from "hono"
import { zValidator } from "@hono/zod-validator"

import UserSchema from "./schema"
import { InvariantError } from "../../lib/error"
import { createUser, getUser } from "../../models/userModel"
import { db } from "../../db"
import { count, eq } from "drizzle-orm"
import authMiddleware from "../../middleware/authMiddleware"

const userRoutes = new Hono()

.get("/me",
    authMiddleware(),
    async (c) => {
        const { id } = c.get("user")

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

.patch("/me",
    zValidator("json", UserSchema.UpdateProfileSchema),
    authMiddleware(),
    async (c) => {
        const { id } = c.get("user")
        const payload = c.req.valid("json")

        const user = await getUser({ id })
        if (!user) throw new InvariantError("User not found")

        if (payload.username || payload.email) {
            const isExist = await getUser({ username: payload.username, email: payload.email })
            if (isExist && isExist.id !== id) throw new InvariantError("User already exist")
        }

        const updatedUser = await db
            .update(users)
            .set({
                username: payload.username,
                email: payload.email,
                password: payload.password ? await Bun.password.hash(payload.password, "bcrypt") : undefined,
                image: payload.image
            })
            .where(eq(users.id, id))
            .returning()

        return c.json({
            status: "success",
            data: {
                id: updatedUser[0].id,
                username: updatedUser[0].username,
                email: updatedUser[0].email
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
