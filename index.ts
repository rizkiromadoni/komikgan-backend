import app from "./server/app";

Bun.serve({
    fetch: app.fetch,
    hostname: Bun.env.HOST!,
    port: parseInt(Bun.env.PORT!)
})

console.log("Listening on http://" + Bun.env.HOST! + ":" + Bun.env.PORT!)