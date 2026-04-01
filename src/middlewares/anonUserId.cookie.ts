import { createMiddleware } from "@tanstack/react-start"
import { setCookie } from "@tanstack/react-start/server"

export default createMiddleware().server(async ({ next, request }) => {
  const cookieHeader = request.headers.get("cookie") ?? ""

  const hasAnonUid = cookieHeader.includes("anonUserId=")

  const response = await next()

  if (!hasAnonUid) {
    const id = crypto.randomUUID()
    const maxAge = 60 * 60 * 24 * 365 // 1 year
    const isProd = process.env.NODE_ENV === "production"

    setCookie("anonUserId", id, {
      httpOnly: !!isProd,
      secure: !!isProd,
      sameSite: "lax",
      maxAge,
    })
  }

  return response
})
