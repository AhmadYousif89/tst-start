import { createRouter, Link } from "@tanstack/react-router"
import { setupRouterSsrQueryIntegration } from "@tanstack/react-router-ssr-query"
import * as TanstackQuery from "./integrations/tanstack-query/root-provider"

// Import the generated route tree
import { routeTree } from "./routeTree.gen"

// Create a new router instance
export const getRouter = () => {
  const rqContext = TanstackQuery.getContext()

  const router = createRouter({
    defaultNotFoundComponent: () => {
      return (
        <div>
          <p>404 / Page not found</p>
          <Link to="/">Go home</Link>
        </div>
      )
    },
    routeTree,
    context: {
      ...rqContext,
    },

    defaultPreload: "intent",
  })

  setupRouterSsrQueryIntegration({ router, queryClient: rqContext.queryClient })

  return router
}
