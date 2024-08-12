import { createUserRoute, deleteUserRoute, getUserRoute, updateUserRoute } from "./../routes/userRoute"
import { OpenAPIHono } from "@hono/zod-openapi"
import { count, eq } from "drizzle-orm"

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
import userModel from "../models/userModel"
import passwordManager from "../lib/passwordManager"

const userHandler = new OpenAPIHono<Env>()

  .openapi(registerUserRoute, async (c) => {
    const payload = c.req.valid("json")

    const isExist = await userModel.getUser({
      username: payload.username,
      email: payload.email
    })
    if (isExist) throw new InvariantError("User already exist")

    const userCount = await db
      .select({ count: count() })
      .from(users)
      .where(eq(users.role, "superadmin"))

    const user = await userModel.createUser({
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

    const user = await userModel.getUser({ id })
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

    const user = await userModel.getUser({ id })
    if (!user) throw new InvariantError("User not found")

    if (payload.username || payload.email) {
      const isExist = await userModel.getUser({
        username: payload.username,
        email: payload.email
      })
      if (isExist && isExist.id !== id)
        throw new InvariantError("User already exist")
    }

    const updatedUser = await userModel.updateUser(id, {
      ...payload,
      password: payload.password ? await passwordManager.hash(payload.password) : undefined
    })

    return c.json(
      {
        status: "success",
        data: {
          id: updatedUser.id,
          username: updatedUser.username,
          email: updatedUser.email
        }
      },
      200
    )
  })

  .openapi(getUsersRoute, async (c) => {
    const { limit, page, role, search } = c.req.valid("query")

    const results = await userModel.getUsers({ limit, page, role, search })

    return c.json({
        status: "success",
        data: results
      }, 200)
  })

  .openapi(getUserRoute, async (c) => {
    const { username } = c.req.param()
    
    const user = await userModel.getUser({ username })
    if (!user) throw new InvariantError("User not found")

    return c.json({
      status: "success",
      data: {
        ...user,
        password: undefined
      }
    }, 200)
  })

  .openapi(createUserRoute, async (c) => {
    const payload = c.req.valid("json")
    const { role } = c.get("user")

    if (payload.role !== "user" && role !== "superadmin") {
      throw new AuthorizationError("You are not allowed to assign user role")
    }

    const isExist = await userModel.getUser({
      username: payload.username,
      email: payload.email
    })
    if (isExist) throw new InvariantError("User already exist")

    const user = await userModel.createUser({ ...payload, role: payload.role || "user" })
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

    const user = await userModel.getUser({ username })
    if (!user) throw new InvariantError("User not found")

    if (payload.role && role !== "superadmin") {
        throw new AuthorizationError("You are not allowed to update user role")
    }

    if (payload.username || payload.email) {
        const isExist = await userModel.getUser({
            username: payload.username,
            email: payload.email
        })
        if (isExist && isExist.id !== user.id) throw new InvariantError("User already exist")
    }

    const updatedUser = await userModel.updateUser(username, { ...payload })

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
    
    const user = await userModel.getUser({ username })
    if (!user) throw new InvariantError("User not found")

    if (user.role !== "user" && role !== "superadmin") {
        throw new AuthorizationError("You are not allowed to delete this user")
    }

    const deletedUser = await userModel.deleteUser(username)

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
