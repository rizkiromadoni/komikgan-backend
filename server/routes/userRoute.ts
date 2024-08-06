import { createRoute } from "@hono/zod-openapi";
import UserSchema from "../schema/userSchema";
import errorRoute from "./errorRoute";
import authMiddleware from "../middleware/authMiddleware";

export const registerUserRoute = createRoute({
    method: "post",
    path: "/register",
    tags: ["users"],
    description: "Register a user",
    request: {
        body: {
            content: {
                "application/json": {
                    schema: UserSchema.RegisterUserSchema.requestBody
                }
            }
        }
    },
    responses: {
        200: {
            description: "success",
            content: {
                "application/json": {
                    schema: UserSchema.RegisterUserSchema.response
                }
            }
        },
        400: errorRoute[400]
    }
})

export const getUserProfileRoute = createRoute({
    method: "get",
    path: "/me",
    tags: ["users"],
    security: [{ JWT: [] }],
    middleware: [authMiddleware()],
    description: "Get user profile",
    responses: {
        200: {
            description: "success",
            content: {
                "application/json": {
                    schema: UserSchema.GetUserProfileSchema.response
                }
            }
        },
        401: errorRoute[401]
    }
})

export const updateUserProfileRoute = createRoute({
    method: "patch",
    path: "/me",
    tags: ["users"],
    security: [{ JWT: [] }],
    middleware: [authMiddleware()],
    description: "Update user profile",
    request: {
        body: {
            content: {
                "application/json": {
                    schema: UserSchema.UpdateUserProfileSchema.requestBody
                }
            }
        }
    },
    responses: {
        200: {
            description: "success",
            content: {
                "application/json": {
                    schema: UserSchema.UpdateUserProfileSchema.response
                }
            }
        },
        401: errorRoute[401]
    }
})

export const getUsersRoute = createRoute({
    method: "get",
    path: "/",
    tags: ["users"],
    security: [{ JWT: [] }],
    middleware: [authMiddleware(["user"])],
    description: "Get users",
    request: {
        query: UserSchema.GetUsersSchema.query
    },
    responses: {
        200: {
            description: "success",
            content: {
                "application/json": {
                    schema: UserSchema.GetUsersSchema.response
                }
            }
        },
        401: errorRoute[401],
        403: errorRoute[403],
    }
})

export const getUserRoute = createRoute({
    method: "get",
    path: "/:username",
    tags: ["users"],
    security: [{ JWT: [] }],
    middleware: [authMiddleware(["user"])],
    description: "Get user",
    request: {
        params: UserSchema.GetUserSchema.requestParams
    },
    responses: {
        200: {
            description: "success",
            content: {
                "application/json": {
                    schema: UserSchema.GetUserSchema.response
                }
            }
        },
        401: errorRoute[401],
        403: errorRoute[403],
        404: errorRoute[404]
    }
})

export const createUserRoute = createRoute({
    path: "/",
    method: "post",
    tags: ["users"],
    security: [{ JWT: [] }],
    middleware: [authMiddleware(["user"])],
    description: "Create user",
    request: {
        body: {
            content: {
                "application/json": {
                    schema: UserSchema.CreateUserSchema.requestBody
                }
            }
        }
    },
    responses: {
        200: {
            description: "success",
            content: {
                "application/json": {
                    schema: UserSchema.CreateUserSchema.response
                }
            }
        },
        401: errorRoute[401],
        403: errorRoute[403]
    }
})

export const updateUserRoute = createRoute({
    method: "patch",
    path: "/:username",
    tags: ["users"],
    security: [{ JWT: [] }],
    middleware: [authMiddleware(["user"])],
    description: "Update user",
    request: {
        params: UserSchema.UpdateUserSchema.requestParams,
        body: {
            content: {
                "application/json": {
                    schema: UserSchema.UpdateUserSchema.requestBody
                }
            }
        }
    },
    responses: {
        200: {
            description: "success",
            content: {
                "application/json": {
                    schema: UserSchema.UpdateUserSchema.response
                }
            }
        },
        401: errorRoute[401],
        403: errorRoute[403],
        404: errorRoute[404]
    }
})

export const deleteUserRoute = createRoute({
    method: "delete",
    path: "/:username",
    tags: ["users"],
    security: [{ JWT: [] }],
    middleware: [authMiddleware(["user"])],
    description: "Get users",
    request: {
        params: UserSchema.DeleteUserSchema.requestParams
    },
    responses: {
        200: {
            description: "success",
            content: {
                "application/json": {
                    schema: UserSchema.DeleteUserSchema.response
                }
            }
        },
        401: errorRoute[401],
        403: errorRoute[403],
        404: errorRoute[404]
    }
})