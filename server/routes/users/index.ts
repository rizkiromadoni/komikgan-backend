import { Hono } from "hono"
import { zValidator } from "@hono/zod-validator"

import { users } from "./../../db/schema"
import UserSchema from "./schema"
import { AuthorizationError, InvariantError } from "../../lib/error"
import { createUser, deleteUser, getUser, updateUser } from "../../models/userModel"
import { db } from "../../db"
import { count, eq } from "drizzle-orm"
import authMiddleware from "../../middleware/authMiddleware"
import { withCursorPagination } from "drizzle-pagination"

const userRoutes = new Hono()

  .post("/register",
    zValidator("json", UserSchema.RegisterUserSchema),
    async (c) => {
        const payload = c.req.valid("json")

        const isExist = await getUser({
        username: payload.username,
        email: payload.email
        })
        if (isExist) throw new InvariantError("User already exist")

        const userCount = await db
        .select({ count: count() })
        .from(users)
        .where(eq(users.role, "superadmin"))

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
    })

  .get("/me", authMiddleware(), async (c) => {
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
        image: user.image
      }
    })
  })

  .patch("/me", authMiddleware(),
    zValidator("json", UserSchema.UpdateProfileSchema),
    async (c) => {
      const { id } = c.get("user")
      const payload = c.req.valid("json")

      const user = await getUser({ id })
      if (!user) throw new InvariantError("User not found")

      if (payload.username || payload.email) {
        const isExist = await getUser({
          username: payload.username,
          email: payload.email
        })
        if (isExist && isExist.id !== id)
          throw new InvariantError("User already exist")
      }

      const updatedUser = await db
        .update(users)
        .set({
          username: payload.username,
          email: payload.email,
          password: payload.password
            ? await Bun.password.hash(payload.password, "bcrypt")
            : undefined,
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
  })

  .get("/", authMiddleware(),
    zValidator("query", UserSchema.GetUsersQuery),
    async (c) => {
        const { limit, cursor, role } = c.req.valid("query")
        const paginatedLimit = limit ? limit + 1 : 10 + 1

        const results = await db.query.users.findMany({
        columns: {
            id: true,
            username: true,
            email: true,
            role: true,
            image: true,
            createdAt: true,
            updatedAt: true
        },
        ...withCursorPagination({
            where: role ? eq(users.role, role) : undefined,
            limit: paginatedLimit,
            cursors: [[users.id, "desc", cursor || undefined]]
        })
        })

        return c.json({
        status: "success",
        data: {
            nextCursor:
            results.length >= paginatedLimit
                ? results[results.length - 2].id
                : null,
            data: results
        }
    })
  })

  .get("/:username", authMiddleware(["user"]),
  async (c) => {
    const { username } = c.req.param()
    
    const user = await getUser({ username })
    if (!user) throw new InvariantError("User not found")

    return c.json({
      status: "success",
      data: {
        id: user.id,
        username: user.username,
        email: user.email,
        image: user.image,
        role: user.role,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt
      }
    })
  })

  .patch("/:username", authMiddleware(["user"]),
    zValidator("json", UserSchema.UpdateUserSchema),
    async (c) => {
        const { role } = c.get("user")
        const { username } = c.req.param()
        const payload = c.req.valid("json")

        const user = await getUser({ username })
        if (!user) throw new InvariantError("User not found")

        if (payload.role && role !== "superadmin") {
            throw new AuthorizationError("You are not allowed to update user role")
        }

        if (payload.username || payload.email) {
            const isExist = await getUser({
                username: payload.username,
                email: payload.email
            })
            if (isExist && isExist.id !== user.id) throw new InvariantError("User already exist")
        }

        const updatedUser = await updateUser({ where: { username }, ...payload })

        return c.json({
            status: "success",
            data: {
                id: updatedUser.id,
                username: updatedUser.username,
                email: updatedUser.email
            }
        })
  })

  .delete("/:username", authMiddleware(["user"]),
  async (c) => {
    const { role } = c.get("user")
    const { username } = c.req.param()
    
    const user = await getUser({ username })
    if (!user) throw new InvariantError("User not found")

    if (user.role !== "user" && role !== "superadmin") {
        throw new AuthorizationError("You are not allowed to delete this user")
    }

    const deletedUser = await deleteUser({ where: { username } })

    return c.json({
        status: "success",
        data: {
            id: deletedUser.id,
            username: deletedUser.username,
            email: deletedUser.email
        }
    })
  })

export default userRoutes
