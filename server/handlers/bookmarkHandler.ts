import { OpenAPIHono } from "@hono/zod-openapi";
import type { Env } from "../factory";
import { CreateBookmarkRoute, DeleteBookmarkRoute, GetBookmarksRoute } from "../routes/bookmarkRoute";
import bookmarkModel from "../models/bookmarkModel";
import { db } from "../db";
import { eq } from "drizzle-orm";
import { series } from "../db/schema";
import { NotFoundError } from "../lib/error";

const bookmarkHandler = new OpenAPIHono<Env>()

bookmarkHandler.openapi(GetBookmarksRoute, async (c) => {
    const { page, limit } = c.req.valid("query")
    const user = c.get("user")

    const results = await bookmarkModel.getUserBookmarks({
        userId: user.id,
        page,
        limit
    })

    return c.json({
        status: "success",
        data: results
    }, 200)
})

bookmarkHandler.openapi(CreateBookmarkRoute, async (c) => {
    const { serieId } = c.req.valid("json")
    const user = c.get("user")

    const serie = await db.query.series.findFirst({ where: eq(series.id, serieId) })
    if (!serie) {
        throw new NotFoundError("Series not found")
    }

    try {
        await bookmarkModel.createBookmark({ serieId, userId: user.id })
    } catch (error) {}

    return c.json({
        status: "success",
        data: {
            message: "Bookmark created successfully"
        }
    }, 200)
})

bookmarkHandler.openapi(DeleteBookmarkRoute, async (c) => {
    const { id } = c.req.valid("param")
    const user = c.get("user")

    const serie = await db.query.series.findFirst({ where: eq(series.id, id) })
    if (!serie) {
        throw new NotFoundError("Series not found")
    }

    try {
        await bookmarkModel.deleteBookmark({ serieId: id, userId: user.id })
    } catch (error) {}

    return c.json({
        status: "success",
        data: {
            message: "Bookmark deleted successfully"
        }
    }, 200)
})

export default bookmarkHandler