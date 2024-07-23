import { db } from "../db";
import { users } from "../db/schema";
import { Role } from "./../db/schema"
import { eq, or } from "drizzle-orm";

import passwordManager from "../lib/passwordManager";

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