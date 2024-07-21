import { Hono } from "hono"
import { zValidator } from "@hono/zod-validator"

import UserSchema from "./schema"
import { InvariantError } from "../../lib/error"
import { createUser, getUser } from "../../models/userModel"
import prisma from "../../lib/prisma"

const users = new Hono()

.post("/register",
    zValidator("json", UserSchema.RegisterUserSchema),
    async (c) => {
        const payload = c.req.valid("json")

        const isExist = await getUser({ username: payload.username, email: payload.email })
        if (isExist) throw new InvariantError("User already exist")

        const userCount = await prisma.user.count({ where: { role: "SUPERADMIN" }})
        
        const user = await createUser({
            ...payload,
            role: userCount === 0 ? "SUPERADMIN" : "USER"
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

export default users
