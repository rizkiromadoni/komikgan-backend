import { OpenAPIHono } from "@hono/zod-openapi"
import { apiReference } from '@scalar/hono-api-reference'

import { HTTPException } from "hono/http-exception"
import { cors } from "hono/cors"
import { logger } from "hono/logger"
import { serveStatic } from "hono/bun"

import authHandler from "./handlers/authHandler"
import userHandler from "./handlers/userHandler"
import genreHandler from "./handlers/genreHandler"
import serieHandler from "./handlers/serieHandler"
import chapterHandler from "./handlers/chapterHandler"
import bookmarkHandler from "./handlers/bookmarkHandler"

const app = new OpenAPIHono()

app.use("*", logger())
app.use("*", cors({
  origin: process.env.CORS_ORIGIN!,
  credentials: true
}))


app.openAPIRegistry.registerComponent('securitySchemes', 'JWT', {
  type: "apiKey",
  in: "cookie",
  name: "accessToken",
  description: "JWT access token",
})

app.get("/", (c) => {
  return c.text("Hello, World!")
})

app.get("/uploads/*", serveStatic({ root: "./" }))

const routes = app
.route("/users", userHandler)
.route("/authentications", authHandler)
.route("/genres", genreHandler)
.route("/series", serieHandler)
.route("/chapters", chapterHandler)
.route("/bookmarks", bookmarkHandler)

app.doc('/doc', {
  openapi: '3.0.0',
  info: {
    version: '1.0.0',
    title: 'Komikgan API',
    description: 'Komikgan API documentation',
  },
})

app.get(
  '/docs',
  apiReference({
    spec: {
      url: '/doc',
    },
  }),
)

app.onError((error, c) => {
  console.log(error)
  if (error instanceof HTTPException) {
    return c.json({
        status: "fail",
        message: error.message
    }, error.status)
  }

  return c.json({
      status: "fail",
      message: "Internal Server Error"
  }, 500)
})

export type HonoRPC = typeof routes
export default app
