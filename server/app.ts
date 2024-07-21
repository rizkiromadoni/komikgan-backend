import { Hono } from "hono";
import { HTTPException } from "hono/http-exception";

const app = new Hono()

app.get("/", (c) => {
    return c.text("Hello, World!")
})

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

export default app