import tailwindcss from "@tailwindcss/vite"
import {tanstackRouter} from "@tanstack/router-plugin/vite"
import react from "@vitejs/plugin-react"
import path from "path"
import {defineConfig} from "vite"
import {nodePolyfills} from "vite-plugin-node-polyfills"

export default defineConfig({
    plugins: [
        tanstackRouter({
            target: "react",
            autoCodeSplitting: true,
        }),
        react({}),
        tailwindcss(),
        nodePolyfills(),
    ],
    worker: {format: "es", plugins: () => [nodePolyfills()]},
    resolve: {alias: {"@": path.resolve(__dirname, "./src")}},
    build: {target: "esnext", sourcemap: true, emptyOutDir: true},
    base: "/confessionrooms/",
    server: {
        proxy: {
            "/confessionrooms/api": {
                target: "http://127.0.0.1:8000",
                changeOrigin: true,
            },
        },
    },
})
