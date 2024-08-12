import { OpenAPIHono } from "@hono/zod-openapi";
import { type Env } from "../factory";
import { CreateGenreRoute, DeleteGenreRoute, GetAllGenresRoute, GetGenreRoute, GetGenresRoute, UpdateGenreRoute } from "../routes/genreRoute";
import genreModel from "../models/genreModel";
import { slugify } from "../lib/utils";
import { InvariantError } from "../lib/error";

const genreHandler = new OpenAPIHono<Env>()

genreHandler.openapi(GetAllGenresRoute, async (c) => {
    const genres = await genreModel.getAllGenres()

    return c.json({
        status: "success",
        data: genres
    }, 200)
})

genreHandler.openapi(GetGenresRoute, async (c) => {
    const { page, limit, search } = c.req.valid("query")

    const results = await genreModel.getGenres({ page, limit, search })

    return c.json({
        status: "success",
        data: results
    }, 200)
})

genreHandler.openapi(GetGenreRoute, async (c) => {
    const { slug } = c.req.valid("param")

    const genre = await genreModel.getGenre(slug)
    if (!genre) throw new Error("Genre not found")

    return c.json({
        status: "success",
        data: genre
    }, 200)
})

genreHandler.openapi(CreateGenreRoute, async (c) => {
    const { name } = c.req.valid("json")

    const isExist = await genreModel.getGenre(slugify(name))
    if (isExist) throw new InvariantError("Genre already exist")

    const genre = await genreModel.createGenre({ name })

    return c.json({
        status: "success",
        data: {
            id: genre.id,
            name: genre.name,
            slug: genre.slug
        }
    }, 200)
})

genreHandler.openapi(UpdateGenreRoute, async (c) => {
    const { id } = c.req.valid("param")
    const { name } = c.req.valid("json")

    const genre = await genreModel.getGenre(id)
    if (!genre) throw new InvariantError("Genre not found")

    const isExist = await genreModel.getGenre(slugify(name))
    if (isExist) throw new InvariantError("Genre already exist")

    const updatedGenre = await genreModel.updateGenre(id, { name })

    return c.json({
        status: "success",
        data: {
            id: updatedGenre.id,
            name: updatedGenre.name,
            slug: updatedGenre.slug
        }
    }, 200)
})

genreHandler.openapi(DeleteGenreRoute, async (c) => {
    const { id } = c.req.valid("param")

    const genre = await genreModel.getGenre(id)
    if (!genre) throw new InvariantError("Genre not found")

    const deletedGenre = await genreModel.deleteGenre(id)

    return c.json({
        status: "success",
        data: {
            id: deletedGenre.id,
            name: deletedGenre.name,
            slug: deletedGenre.slug
        }
    }, 200)
})

export default genreHandler