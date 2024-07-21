import { Hono } from "hono"
import { HTTPException } from "hono/http-exception"
import users from "./routes/users"

const app = new Hono()

app.get("/", (c) => {
  return c.text("Hello, World!")
})

const routes = app
.route("/users", users)

app.onError((error, c) => {
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
