import { createRoute } from "@hono/zod-openapi";
import authMiddleware from "../middleware/authMiddleware";
import errorRoute from "./errorRoute";
import ChapterSchema from "../schema/chapterSchema";

export const getChaptersRoute = createRoute({
    path: "/",
    method: "get",
    tags: ["chapters"],
    description: "Get chapters",
    request: {
        query: ChapterSchema.GetChaptersSchema.query
    },
    responses: {
        200: {
            description: "success",
            content: {
                "application/json": {
                    schema: ChapterSchema.GetChaptersSchema.response
                }
            }
        }
    }
})

export const getChapterRoute = createRoute({
    path: "/:slug",
    method: "get",
    tags: ["chapters"],
    description: "Get chapter",
    request: {
        params: ChapterSchema.GetChapterSchema.params
    },
    responses: {
        200: {
            description: "success",
            content: {
                "application/json": {
                    schema: ChapterSchema.GetChapterSchema.response
                }
            }
        },
        404: errorRoute[404]
    }
})

export const createChapterRoute = createRoute({
    path: "/",
    method: "post",
    tags: ["chapters"],
    description: "Create chapter",
    security: [{ JWT: [] }],
    middleware: [authMiddleware(["user"])],
    request: {
        body: {
            content: {
                "application/json": {
                    schema: ChapterSchema.CreateChapterSchema.requestBody
                }
            }
        }
    },
    responses: {
        200: {
            description: "success",
            content: {
                "application/json": {
                    schema: ChapterSchema.CreateChapterSchema.response
                }
            }
        },
        401: errorRoute[401],
        403: errorRoute[403]
    }
})

export const updateChapterRoute = createRoute({
    path: "/:id",
    method: "patch",
    tags: ["chapters"],
    description: "Update chapter",
    security: [{ JWT: [] }],
    middleware: [authMiddleware(["user"])],
    request: {
        params: ChapterSchema.UpdateChapterSchema.params,
        body: {
            content: {
                "application/json": {
                    schema: ChapterSchema.UpdateChapterSchema.requestBody
                }
            }
        }
    },
    responses: {
        200: {
            description: "success",
            content: {
                "application/json": {
                    schema: ChapterSchema.UpdateChapterSchema.response
                }
            }
        },
        401: errorRoute[401],
        403: errorRoute[403],
        404: errorRoute[404]
    }
})

export const deleteChapterRoute = createRoute({
    path: "/:id",
    method: "delete",
    tags: ["chapters"],
    description: "Delete chapter",
    security: [{ JWT: [] }],
    middleware: [authMiddleware(["user"])],
    request: {
        params: ChapterSchema.DeleteChapterSchema.params
    },
    responses: {
        200: {
            description: "success",
            content: {
                "application/json": {
                    schema: ChapterSchema.DeleteChapterSchema.response
                }
            }
        },
        401: errorRoute[401],
        403: errorRoute[403],
        404: errorRoute[404]
    }
})