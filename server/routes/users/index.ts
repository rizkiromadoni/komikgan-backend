import { users } from "./../../db/schema"
import { Hono } from "hono"
import { zValidator } from "@hono/zod-validator"

import UserSchema from "./schema"
import { InvariantError } from "../../lib/error"
import { createUser, getUser } from "../../models/userModel"
import { db } from "../../db"
import { count, eq } from "drizzle-orm"

const userRoutes = new Hono()

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
