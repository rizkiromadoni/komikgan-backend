import type { Role } from "@prisma/client";
import prisma from "../lib/prisma";
import passwordManager from "../lib/passwordManager";

type GetUserArgs = {
    id?: number
    username?: string
    email?: string
}

export async function getUser({ id, username, email }: GetUserArgs) {
    return await prisma.user.findFirst({
        where: {
            OR: [
                { id },
                { username },
                { email }
            ]
        }
    })
}

type CreateUserArgs = {
    username: string
    email: string
    password: string
    role?: Role
    image?: string
}
export async function createUser(data: CreateUserArgs) {
    const hashedPassword = await passwordManager.hash(data.password)

    return await prisma.user.create({
        data: {
            ...data,
            password: hashedPassword,
            role: data.role ?? "USER"
        }
    })
}