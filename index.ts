import app from "./server/app"

Bun.serve({
  fetch: app.fetch,
  port: parseInt(Bun.env.PORT!)
})

console.log("Listening on http://localhost:" + Bun.env.PORT!)
