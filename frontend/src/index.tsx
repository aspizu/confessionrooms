// @ts-expect-error Types don't exist
import "@fontsource-variable/inter"
// @ts-expect-error Types don't exist
import "@fontsource/cascadia-code"
// @ts-expect-error Types don't exist
import "@fontsource-variable/gelasio"

import "@/styles/index.css"

import {routeTree} from "@/routeTree.gen"
import * as api from "@/services/api.gen.ts"
import {QueryClient, QueryClientProvider} from "@tanstack/react-query"
import {createRouter, RouterProvider} from "@tanstack/react-router"
import {StrictMode} from "react"
import {createRoot} from "react-dom/client"

api.config.apiPrefix = "/confessionrooms/api/"

export const queryClient = new QueryClient()

const router = createRouter({routeTree, basepath: "/confessionrooms/"})
declare module "@tanstack/react-router" {
    interface Register {
        router: typeof router
    }
}

const root = document.getElementById("root") as HTMLDivElement
createRoot(root).render(
    <StrictMode>
        <QueryClientProvider client={queryClient}>
            <RouterProvider router={router} />
        </QueryClientProvider>
    </StrictMode>,
)
