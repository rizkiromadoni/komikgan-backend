import { db } from "../db";
import { users } from "../db/schema";
import { Role } from "./../db/schema"
import { eq, or } from "drizzle-orm";

import passwordManager from "../lib/passwordManager";
import { InvariantError } from "../lib/error";

type GetUserArgs = {
    id?: number
    username?: string
    email?: string
}

export async function getUser({ id, username, email }: GetUserArgs) {
    const user = await db.query.users.findFirst({
        where: or(
            eq(users.id, id || 0),
            eq(users.username, username || ""),
            eq(users.email, email || "")
        )
    })
    
    return user
}

type CreateUserArgs = {
    username: string
    email: string
    password: string
    role?: typeof Role.enumValues[number]
    image?: string
}
export async function createUser(data: CreateUserArgs) {
    const hashedPassword = await passwordManager.hash(data.password)

    const newUser = await db.insert(users).values({
        username: data.username,
        email: data.email,
        password: hashedPassword,
        role: data.role || "user",
        image: data.image
    }).returning()

    return newUser[0]
}

type UpdateUserArgs = {
    where: {
        id?: number
        username?: string
    },
    username?: string
    email?: string
    password?: string
    role?: typeof Role.enumValues[number]
    image?: string
}
export async function updateUser(data: UpdateUserArgs) {
    if (!data.where?.id && !data.where?.username) throw new InvariantError("id or username must be provided")

    const updatedUser = await db
    .update(users)
    .set({
        username: data.username,
        email: data.email,
        password: data.password ? await passwordManager.hash(data.password) : undefined,
        role: data.role,
        image: data.image
    })
    .where(or(
        eq(users.id, data.where.id || 0),
        eq(users.username, data.where.username || "")
    ))
    .returning()

    return updatedUser[0]
}

type DeleteUserArgs = {
    where: {
        id?: number
        username?: string
    }
}
export async function deleteUser(data: DeleteUserArgs) {
    if (!data.where?.id && !data.where?.username) throw new InvariantError("id or username must be provided")

    const deletedUser = await db
    .delete(users)
    .where(or(
        eq(users.id, data.where.id || 0),
        eq(users.username, data.where.username || "")
    ))
    .returning()

    return deletedUser[0]
}