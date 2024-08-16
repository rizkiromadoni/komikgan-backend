import { OpenAPIHono } from "@hono/zod-openapi"
import type { Env } from "../factory"
import serieModel from "../models/serieModel"
import { slugify } from "../lib/utils"
import { InvariantError, NotFoundError } from "../lib/error"
import { createChapterRoute, deleteChapterRoute, getChapterRoute, getChaptersRoute, updateChapterRoute } from "../routes/chapterRoute"
import chapterModel from "../models/chapterModel"

const chapterHandler = new OpenAPIHono<Env>()

.openapi(getChaptersRoute, async (c) => {
    const { page, limit, status, search } = c.req.valid("query")

    const results = await chapterModel.getChapters({ page, limit, status, search })

    return c.json({
        status: "success",
        data: results
    }, 200)
})

.openapi(getChapterRoute, async (c) => {
    const { slug } = c.req.valid("param")

    const chapter = await chapterModel.getChapter(slug)
    if (!chapter) throw new NotFoundError("Chapter not found")

    return c.json({
        status: "success",
        data: {
            ...chapter,
            content: chapter.content.split('\n')
        }
    }, 200)
})

.openapi(createChapterRoute, async (c) => {
    const user = c.get("user")
    const payload = c.req.valid("json")

    const isSerieExist = await serieModel.getSerie(payload.serieId)
    if (!isSerieExist) throw new InvariantError("Serie not found")

    const isExist = await chapterModel.getChapter(slugify(payload.title))
    if (isExist) throw new InvariantError("Chapter already exist")

    const chapter = await chapterModel.createChapter({
        ...payload,
        userId: user.id
    })

    return c.json({
        status: "success",
        data: {
            id: chapter.id,
            title: chapter.title,
            slug: chapter.slug,
        }
    }, 200)
})

.openapi(updateChapterRoute, async (c) => {
    const payload = c.req.valid("json")
    const { id } = c.req.valid("param")

    const chapter = await chapterModel.getChapter(id)
    if (!chapter) throw new NotFoundError("Chapter not found")

    if (payload.serieId) {
        const serie = await serieModel.getSerie(payload.serieId)
        if (!serie) throw new NotFoundError("Serie not found")
    }

    if (payload.title && payload.title !== chapter.title) {
        const slug = slugify(payload.title)

        const isExist = await chapterModel.getChapter(slug)
        if (isExist) throw new InvariantError("Chapter already exist")
    }

    const updatedChapter = await chapterModel.updateChapter(id, payload)
    return c.json({
        status: "success",
        data: {
            id: updatedChapter.id,
            title: updatedChapter.title,
            slug: updatedChapter.slug
        }
    }, 200)
})

.openapi(deleteChapterRoute, async (c) => {
    const { id } = c.req.valid("param")

    const chapter = await chapterModel.getChapter(id)
    if (!chapter) throw new NotFoundError("Chapter not found")

    const deletedChapter = await chapterModel.deleteChapter(id)

    return c.json({
        status: "success",
        data: {
            id: deletedChapter.id,
            title: deletedChapter.title,
            slug: deletedChapter.slug
        }
    }, 200)
})

export default chapterHandler