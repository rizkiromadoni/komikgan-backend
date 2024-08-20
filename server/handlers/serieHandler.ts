import { OpenAPIHono } from "@hono/zod-openapi"
import { createSerieRoute, deleteSerieRoute, getAllSeriesRoute, getLatestUpdateRoute, getSerieRoute, getSeriesRoute, updateSerieRoute } from "../routes/serieRoute"
import type { Env } from "../factory"
import serieModel from "../models/serieModel"
import { saveBase64, slugify } from "../lib/utils"
import { InvariantError, NotFoundError } from "../lib/error"
import genreModel from "../models/genreModel"
import bookmarkModel from "../models/bookmarkModel"
import { getCookie } from "hono/cookie"
import tokenManager from "../lib/tokenManager"

const serieHandler = new OpenAPIHono<Env>()

.openapi(getLatestUpdateRoute, async (c) => {
    const { page, limit } = c.req.valid("query")

    const results = await serieModel.getLatestUpdate({ page, limit })

    return c.json({
        status: "success",
        data: results
    }, 200)
})

.openapi(getAllSeriesRoute, async (c) => {
    const results = await serieModel.getAllSeries()

    return c.json({
        status: "success",
        data: results
    }, 200)
})

.openapi(getSeriesRoute, async (c) => {
    const { page, limit, status, search } = c.req.valid("query")

    const results = await serieModel.getSeries({ page, limit, status, search })

    return c.json({
        status: "success",
        data: results
    }, 200)
})

.openapi(getSerieRoute, async (c) => {
    const { slug } = c.req.valid("param")

    const serie = await serieModel.getSerie(slug)
    if (!serie) throw new NotFoundError("Serie not found")

    let userId: undefined | number = undefined
    const accessToken = getCookie(c, "accessToken")
    if (accessToken) {
        const payload = await tokenManager.verifyAccessToken(accessToken) as any
        if (payload) {
            userId = payload.id
        }
    }

    const serieBookmark = await bookmarkModel.getSeriesBookmarks({ serieId: serie.id, userId })

    return c.json({
        status: "success",
        data: {
            ...serie,
            user: {
                username: serie.user.username
            },
            bookmarks: serieBookmark
        }
    }, 200)
})

.openapi(createSerieRoute, async (c) => {
    const user = c.get("user")
    const payload = c.req.valid("json")

    const isExist = await serieModel.getSerie(slugify(payload.title))
    if (isExist) throw new InvariantError("Serie already exist")

    let image_url = payload.imageUrl || undefined

    if (payload.image) {
        image_url = await saveBase64(payload.image, `${slugify(payload.title)}.webp`)
    }

    const serie = await serieModel.createSerie({
        title: payload.title,
        alternative: payload.alternative,
        imageUrl: image_url,
        description: payload.description,
        status: payload.status,
        seriesType: payload.seriesType,
        seriesStatus: payload.seriesStatus,
        rating: payload.rating,
        released: payload.released,
        author: payload.author,
        artist: payload.artist,
        serialization: payload.serialization,
        genres: payload.genres,
        userId: user.id
    })

    return c.json({
        status: "success",
        data: {
            id: serie.id,
            title: serie.title,
            slug: serie.slug,
            imageUrl: serie.imageUrl,
            userId: serie.userId
        }
    }, 200)
})

.openapi(updateSerieRoute, async (c) => {
    const payload = c.req.valid("json")
    const { id } = c.req.valid("param")

    const serie = await serieModel.getSerie(id)
    if (!serie) throw new NotFoundError("Serie not found")

    let title = undefined
    let slug = undefined
    if (payload.title && payload.title !== serie.title) {
        title = payload.title
        slug = slugify(payload.title)

        const isExist = await serieModel.getSerie(slug)
        if (isExist) throw new InvariantError("Serie already exist")
    }


    let image_url = payload.imageUrl || undefined
    if (payload.image) {
        image_url = await saveBase64(payload.image, `${slug ?? serie.slug}.png`)
    }

    const updatedSerie = await serieModel.updateSerie(id, {
        title: title,
        alternative: payload.alternative,
        imageUrl: image_url,
        description: payload.description,
        status: payload.status,
        seriesType: payload.seriesType,
        seriesStatus: payload.seriesStatus,
        rating: payload.rating,
        released: payload.released,
        author: payload.author,
        artist: payload.artist,
        serialization: payload.serialization,
        genres: payload.genres
    })

    return c.json({
        status: "success",
        data: {
            id: updatedSerie.id,
            title: updatedSerie.title,
            slug: updatedSerie.slug,
            imageUrl: updatedSerie.imageUrl,
            userId: updatedSerie.userId
        }
    }, 200)
})

.openapi(deleteSerieRoute, async (c) => {
    const { id } = c.req.valid("param")

    const serie = await serieModel.getSerie(id)
    if (!serie) throw new NotFoundError("Serie not found")

    const deletedSerie = await serieModel.deleteSerie(id)

    return c.json({
        status: "success",
        data: {
            id: deletedSerie.id,
            title: deletedSerie.title,
            slug: deletedSerie.slug
        }
    }, 200)
})

export default serieHandler