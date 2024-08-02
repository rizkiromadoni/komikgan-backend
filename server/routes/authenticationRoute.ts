import { createRoute } from "@hono/zod-openapi";
import AuthSchema from "../schema/authSchema";
import errorRoute from "./errorRoute";

export const loginRoute = createRoute({
    method: "post",
    path: "/",
    tags: ["authentications"],
    description: "User Login",
    request: {
        body: {
            content: {
                "application/json": {
                    schema: AuthSchema.LoginUserSchema.requestBody
                }
            }
        }
    },
    responses: {
        200: {
            description: "success",
            content: {
                "application/json": {
                    schema: AuthSchema.LoginUserSchema.response
                }
            }
        },
        400: errorRoute[400],
        401: errorRoute[401]
    }
})


export const refreshTokenRoute = createRoute({
    method: "put",
    path: "/",
    tags: ["authentications"],
    security: [{ JWT: [] }],
    description: "Refresh JWT token",
    responses: {
        200: {
            description: "success",
            content: {
                "application/json": {
                    schema: AuthSchema.RefreshTokenSchema.response
                }
            }
        },
        401: errorRoute[401]
    }
})

export const logoutRoute = createRoute({
    method: "delete",
    path: "/",
    tags: ["authentications"],
    security: [{ JWT: [] }],
    description: "User logout",
    responses: {
        200: {
            description: "success",
            content: {
                "application/json": {
                    schema: AuthSchema.LogoutUserSchema.response
                }
            }
        },
    }
})