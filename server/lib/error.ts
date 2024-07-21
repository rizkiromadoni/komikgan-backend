import { HTTPException } from "hono/http-exception"

export class InvariantError extends HTTPException {
  constructor(message: string) {
    super(400, { message })
  }
}
export class AuthenticationError extends HTTPException {
  constructor(message: string) {
    super(401, { message })
  }
}
export class Authorization extends HTTPException {
  constructor(message: string) {
    super(403, { message })
  }
}
export class NotFoundError extends HTTPException {
  constructor(message: string) {
    super(404, { message })
  }
}
