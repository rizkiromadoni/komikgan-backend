import { createUserRoute, deleteUserRoute, getUserRoute, updateUserRoute } from "./../routes/userRoute"
import { OpenAPIHono } from "@hono/zod-openapi"
import { count, desc, eq } from "drizzle-orm"

import { createUser, deleteUser, getUser, updateUser } from "../models/userModel"
import { db } from "../db"
import { users } from "../db/schema"
import type { Env } from "../factory"
import {
  getUserProfileRoute,
  getUsersRoute,
  registerUserRoute,
  updateUserProfileRoute
} from "../routes/userRoute"
import { AuthorizationError, InvariantError } from "../lib/error"
import { withCursorPagination } from "drizzle-pagination"

const userHandler = new OpenAPIHono<Env>()

  .openapi(registerUserRoute, async (c) => {
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
    return c.json(
      {
        status: "success",
        data: {
          id: user.id,
          username: user.username,
          email: user.email
        }
      },
      200
    )
  })

  .openapi(getUserProfileRoute, async (c) => {
    const { id } = c.get("user")

    const user = await getUser({ id })
    if (!user) throw new InvariantError("User not found")

    return c.json(
      {
        status: "success",
        data: {
          id: user.id,
          username: user.username,
          email: user.email,
          role: user.role,
          image: user.image
        }
      },
      200
    )
  })

  .openapi(updateUserProfileRoute, async (c) => {
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

    return c.json(
      {
        status: "success",
        data: {
          id: updatedUser[0].id,
          username: updatedUser[0].username,
          email: updatedUser[0].email
        }
      },
      200
    )
  })

  .openapi(getUsersRoute, async (c) => {
    const query = c.req.valid("query")

    const limit = query.limit || 10
    const page = query.page || 1


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
      where: query.role ? eq(users.role, query.role) : undefined,
      orderBy: [desc(users.id)],
      limit,
      offset: (page - 1) * limit
    })

    const counts = await db
      .select({ count: count() })
      .from(users)
      .where(query.role ? eq(users.role, query.role) : undefined)

    return c.json({
        status: "success",
        data: {
          totalPages: Math.ceil(counts[0].count / limit),
          data: results
        }
      }, 200)
  })

  .openapi(getUserRoute, async (c) => {
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
    }, 200)
  })

  .openapi(createUserRoute, async (c) => {
    const payload = c.req.valid("json")
    const { role } = c.get("user")

    if (payload.role !== "user" && role !== "superadmin") {
      throw new AuthorizationError("You are not allowed to assign user role")
    }

    const isExist = await getUser({
      username: payload.username,
      email: payload.email
    })
    if (isExist) throw new InvariantError("User already exist")

    const user = await createUser({ ...payload, role: payload.role || "user" })
    return c.json({
      status: "success",
      data: {
        id: user.id,
        username: user.username,
        email: user.email,
        role: user.role
      }
    }, 200)
  })

  .openapi(updateUserRoute, async (c) => {
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
    }, 200)
  })

  .openapi(deleteUserRoute, async (c) => {
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
    }, 200)
  })

export default userHandler
