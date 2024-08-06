import { OpenAPIHono } from "@hono/zod-openapi";
import { type Env } from "../factory";
import { GetGenresRoute } from "../routes/genreRoute";

const genres = new OpenAPIHono<Env>()

export default genres