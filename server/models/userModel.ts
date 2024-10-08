import { db } from "../db";
import { users } from "../db/schema";
import { Role } from "./../db/schema"
import { and, count, desc, eq, ilike, or } from "drizzle-orm";

import passwordManager from "../lib/passwordManager";

type GetUsersArgs = {
    limit?: number
    page?: number
    role?: typeof Role.enumValues[number]
    search?: string
}

type GetUserArgs = {
    id?: number
    username?: string
    email?: string
}

type CreateUserArgs = {
    username: string
    email: string
    password: string
    role?: typeof Role.enumValues[number]
    image?: string
}

type UpdateUserArgs = {
    username?: string
    email?: string
    password?: string
    role?: typeof Role.enumValues[number]
    image?: string
}

const userModel = {
    getUsers: async ({ limit = 10, page = 1, role, search }: GetUsersArgs) => {
        const whereClause = and(
            role ? eq(users.role, role) : undefined,
            search ? ilike(users.username, `%${search}%`) : undefined
        )

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
            where: whereClause,
            orderBy: [desc(users.id)],
            limit: limit,
            offset: (page - 1) * limit
          })
      
        const counts = await db
            .select({ count: count() })
            .from(users)
            .where(whereClause)
    
        return {
            totalPages: Math.ceil(counts[0].count / limit),
            data: results
        }
    },
    getUser: async ({ id, username, email }: GetUserArgs) => {
        return await db.query.users.findFirst({
            where: or(
                eq(users.id, id || 0),
                eq(users.username, username || ""),
                eq(users.email, email || "")
            )
        })
    },
    createUser: async (data: CreateUserArgs) => {
        const hashedPassword = await passwordManager.hash(data.password)

        const newUser = await db.insert(users).values({
            username: data.username,
            email: data.email,
            password: hashedPassword,
            role: data.role || "user",
            image: data.image,
            createdAt: new Date(Date.now()),
            updatedAt: new Date(Date.now()),
        }).returning()
    
        return newUser[0]
    },
    updateUser: async (identifier: string | number, data: UpdateUserArgs) => {
        const updatedUser = await db
        .update(users)
        .set({
            username: data.username,
            email: data.email,
            password: data.password ? await passwordManager.hash(data.password) : undefined,
            role: data.role,
            image: data.image,
            updatedAt: new Date(Date.now()),
        })
        .where(typeof identifier === "number" ? eq(users.id, identifier) : eq(users.username, identifier))
        .returning()
    
        return updatedUser[0]
    },
    deleteUser: async (identifier: string | number) => {
        const deletedUser = await db
        .delete(users)
        .where(typeof identifier === "number" ? eq(users.id, identifier) : eq(users.username, identifier))
        .returning()

        return deletedUser[0]
    }
}

export default userModel