import { z } from "@hono/zod-openapi"

const errorSchema = z.object({
    status: z.literal("fail"),
    message: z.string()
})

export default errorSchema
