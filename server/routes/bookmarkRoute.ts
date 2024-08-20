import { createRoute } from "@hono/zod-openapi";
import BookmarkSchema from "../schema/bookmarkSchema";
import authMiddleware from "../middleware/authMiddleware";
import errorRoute from "./errorRoute";

export const GetBookmarksRoute = createRoute({
    path: "/",
    method: "get",
    tags: ["bookmarks"],
    description: "Get bookmarked series",
    security: [{ JWT: [] }],
    middleware: [authMiddleware()],
    request: {
        query: BookmarkSchema.GetBookmarksSchema.query
    },
    responses: {
        200: {
            description: "success",
            content: {
                "application/json": {
                    schema: BookmarkSchema.GetBookmarksSchema.response
                }
            }
        }
    }
})

export const CreateBookmarkRoute = createRoute({
    path: "/",
    method: "post",
    tags: ["bookmarks"],
    description: "bookmark a series",
    security: [{ JWT: [] }],
    middleware: [authMiddleware()],
    request: {
        body: {
            content: {
                "application/json": {
                    schema: BookmarkSchema.CreateBookmarkSchema.requestBody
                }
            }
        }
    },
    responses: {
        200: {
            description: "success",
            content: {
                "application/json": {
                    schema: BookmarkSchema.CreateBookmarkSchema.response
                }
            }
        },
        400: errorRoute[400],
        404: errorRoute[404]
    }
})

export const DeleteBookmarkRoute = createRoute({
    path: "/:id",
    method: "delete",
    tags: ["bookmarks"],
    description: "Remove bookmarked series",
    security: [{ JWT: [] }],
    middleware: [authMiddleware()],
    request: {
        params: BookmarkSchema.DeleteBookmarkSchema.params
    },
    responses: {
        200: {
            description: "success",
            content: {
                "application/json": {
                    schema: BookmarkSchema.DeleteBookmarkSchema.response
                }
            }
        },
        400: errorRoute[400],
        404: errorRoute[404]
    }
})