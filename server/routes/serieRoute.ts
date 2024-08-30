import { createRoute } from "@hono/zod-openapi";
import SerieSchema from "../schema/serieSchema";
import authMiddleware from "../middleware/authMiddleware";
import errorRoute from "./errorRoute";

export const getRecommendationRoute = createRoute({
    path: "/recommendation",
    method: "get",
    tags: ["series"],
    description: "Get most recommended series",
    responses: {
        200: {
            description: "success",
            content: {
                "application/json": {
                    schema: SerieSchema.GetRecommendation.response
                }
            }
        }
    }
})

export const getLatestUpdateRoute = createRoute({
    path: "/latest",
    method: "get",
    tags: ["series"],
    description: "Get latest updated series",
    request: {
        query: SerieSchema.GetLatestUpdate.query
    },
    responses: {
        200: {
            description: "success",
            content: {
                "application/json": {
                    schema: SerieSchema.GetLatestUpdate.response
                }
            }
        }
    }
})

export const getAllSeriesRoute = createRoute({
    path: "/all",
    method: "get",
    tags: ["series"],
    description: "Get all series",
    responses: {
        200: {
            description: "success",
            content: {
                "application/json": {
                    schema: SerieSchema.GetAllSeriesSchema.response
                }
            }
        }
    }
})

export const getSeriesRoute = createRoute({
    path: "/",
    method: "get",
    tags: ["series"],
    description: "Get series",
    request: {
        query: SerieSchema.GetSeriesSchema.query
    },
    responses: {
        200: {
            description: "success",
            content: {
                "application/json": {
                    schema: SerieSchema.GetSeriesSchema.response
                }
            }
        }
    }
})

export const getSerieRoute = createRoute({
    path: "/:slug",
    method: "get",
    tags: ["series"],
    description: "Get serie",
    request: {
        params: SerieSchema.GetSerieSchema.params
    },
    responses: {
        200: {
            description: "success",
            content: {
                "application/json": {
                    schema: SerieSchema.GetSerieSchema.response
                }
            }
        },
        404: errorRoute[404]
    }
})

export const createSerieRoute = createRoute({
    path: "/",
    method: "post",
    tags: ["series"],
    description: "Create serie",
    security: [{ JWT: [] }],
    middleware: [authMiddleware(["user"])],
    request: {
        body: {
            content: {
                "application/json": {
                    schema: SerieSchema.CreateSerieSchema.requestBody
                }
            }
        }
    },
    responses: {
        200: {
            description: "success",
            content: {
                "application/json": {
                    schema: SerieSchema.CreateSerieSchema.response
                }
            }
        },
        401: errorRoute[401],
        403: errorRoute[403]
    }
})

export const updateSerieRoute = createRoute({
    path: "/:id",
    method: "patch",
    tags: ["series"],
    description: "Update serie",
    security: [{ JWT: [] }],
    middleware: [authMiddleware(["user"])],
    request: {
        params: SerieSchema.UpdateSerieSchema.params,
        body: {
            content: {
                "application/json": {
                    schema: SerieSchema.UpdateSerieSchema.requestBody
                }
            }
        }
    },
    responses: {
        200: {
            description: "success",
            content: {
                "application/json": {
                    schema: SerieSchema.UpdateSerieSchema.response
                }
            }
        },
        401: errorRoute[401],
        403: errorRoute[403],
        404: errorRoute[404]
    }
})

export const deleteSerieRoute = createRoute({
    path: "/:id",
    method: "delete",
    tags: ["series"],
    description: "Delete serie",
    security: [{ JWT: [] }],
    middleware: [authMiddleware(["user"])],
    request: {
        params: SerieSchema.DeleteSerieSchema.params
    },
    responses: {
        200: {
            description: "success",
            content: {
                "application/json": {
                    schema: SerieSchema.DeleteSerieSchema.response
                }
            }
        },
        401: errorRoute[401],
        403: errorRoute[403],
        404: errorRoute[404]
    }
})