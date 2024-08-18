import { createRoute } from "@hono/zod-openapi";
import authMiddleware from "../middleware/authMiddleware";
import GenreSchema from "../schema/genreSchema";
import errorRoute from "./errorRoute";

export const GetAllGenresRoute = createRoute({
    path: "/all",
    method: "get",
    tags: ["genres"],
    description: "Get all genres",
    responses: {
        200: {
            description: "success",
            content: {
                "application/json": {
                    schema: GenreSchema.GetAllGenres.response
                }
            }
        }
    }
})

export const GetGenresRoute = createRoute({
    path: "/",
    method: "get",
    tags: ["genres"],
    description: "Get genres",
    request: {
        query: GenreSchema.GetGenresSchema.query
    },
    responses: {
        200: {
            description: "success",
            content: {
                "application/json": {
                    schema: GenreSchema.GetGenresSchema.response
                }
            }
        }
    }
})

export const GetGenreRoute = createRoute({
    path: "/:slug",
    method: "get",
    tags: ["genres"],
    description: "Get genre",
    request: {
        params: GenreSchema.GetGenreSchema.params
    },
    responses: {
        200: {
            description: "success",
            content: {
                "application/json": {
                    schema: GenreSchema.GetGenreSchema.response
                }
            }
        }
    }
})

export const GetGenreSeriesRoute = createRoute({
    path: "/:slug/series",
    method: "get",
    tags: ["genres"],
    description: "Get series by genre",
    request: {
        params: GenreSchema.GetGenreSeriesSchema.params,
        query: GenreSchema.GetGenreSeriesSchema.query
    },
    responses: {
        200: {
            description: "success",
            content: {
                "application/json": {
                    schema: GenreSchema.GetGenreSeriesSchema.response
                }
            }
        }
    }
})

export const CreateGenreRoute = createRoute({
    path: "/",
    method: "post",
    tags: ["genres"],
    description: "Create genre",
    security: [{ JWT: [] }],
    middleware: [authMiddleware(["user"])],
    request: {
        body: {
            content: {
                "application/json": {
                    schema: GenreSchema.CreateGenreSchema.requestBody
                }
            }
        }
    },
    responses: {
        200: {
            description: "success",
            content: {
                "application/json": {
                    schema: GenreSchema.CreateGenreSchema.response
                }
            }
        },
        400: errorRoute[400],
        401: errorRoute[401],
    }
})

export const UpdateGenreRoute = createRoute({
    path: "/:id",
    method: "patch",
    tags: ["genres"],
    description: "Update genre",
    security: [{ JWT: [] }],
    middleware: [authMiddleware(["user"])],
    request: {
        params: GenreSchema.UpdateGenreSchema.params,
        body: {
            content: {
                "application/json": {
                    schema: GenreSchema.UpdateGenreSchema.requestBody
                }
            }
        }
    },
    responses: {
        200: {
            description: "success",
            content: {
                "application/json": {
                    schema: GenreSchema.UpdateGenreSchema.response
                }
            }
        },
        400: errorRoute[400],
        401: errorRoute[401],
        404: errorRoute[404]
    }
})

export const DeleteGenreRoute = createRoute({
    path: "/:id",
    method: "delete",
    tags: ["genres"],
    description: "Delete genre",
    security: [{ JWT: [] }],
    middleware: [authMiddleware(["user"])],
    request: {
        params: GenreSchema.DeleteGenreSchema.params
    },
    responses: {
        200: {
            description: "success",
            content: {
                "application/json": {
                    schema: GenreSchema.DeleteGenreSchema.response
                }
            }
        },
        400: errorRoute[400],
        401: errorRoute[401],
        404: errorRoute[404]
    }
})