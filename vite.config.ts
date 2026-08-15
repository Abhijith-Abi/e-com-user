import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import viteCompression from "vite-plugin-compression";
import { ViteImageOptimizer } from "vite-plugin-image-optimizer";
import path from "path";

export default defineConfig(({ mode }) => ({
    server: {
        host: "::",
        port: 8080,
        hmr: { overlay: false },
        proxy: {
            "/sales-api": {
                target: "https://sales.sebastianstores.com/api",
                changeOrigin: true,
                rewrite: (path) => path.replace(/^\/sales-api/, ""),
            },
        },
    },

    plugins: [
        react(),
        // Gzip + Brotli for production assets
        mode === "production" &&
            viteCompression({ algorithm: "gzip", ext: ".gz" }),
        mode === "production" &&
            viteCompression({ algorithm: "brotliCompress", ext: ".br" }),
        // Image optimisation
        ViteImageOptimizer({
            webp: { quality: 80 },
            avif: { quality: 70 },
            png: { quality: 80 },
            jpeg: { quality: 80 },
        }),
    ].filter(Boolean),

    resolve: {
        alias: { "@": path.resolve(__dirname, "./src") },
        dedupe: ["react", "react-dom", "react/jsx-runtime"],
    },

    build: {
        target: "es2020",
        sourcemap: false,
        chunkSizeWarningLimit: 600,
        cssCodeSplit: true,

        rollupOptions: {
            output: {
                chunkFileNames: "assets/[name]-[hash].js",
                entryFileNames: "assets/[name]-[hash].js",
                assetFileNames: "assets/[name]-[hash][extname]",

                manualChunks(id) {
                    if (!id.includes("node_modules")) return;

                    if (
                        id.includes("/react/") ||
                        id.includes("/react-dom/") ||
                        id.includes("/react-router") ||
                        id.includes("/scheduler/")
                    )
                        return "vendor-react";

                    // recharts + lodash must stay together for CJS→ESM compat
                    if (
                        id.includes("/recharts/") ||
                        id.includes("/d3-") ||
                        id.includes("/lodash/")
                    )
                        return "vendor-charts";

                    // NOTE: Removed vendor-ui manual chunk so Radix/Lucide components
                    // are naturally tree-shaken and split across specific route chunks.

                    if (
                        id.includes("/@tanstack/") ||
                        id.includes("/axios/") ||
                        id.includes("/zustand/") ||
                        id.includes("/zod/") ||
                        id.includes("/react-hook-form/") ||
                        id.includes("/@hookform/")
                    )
                        return "vendor-data";

                    if (id.includes("/date-fns/")) return "vendor-dates";
                },
            },
        },
    },

    optimizeDeps: {
        include: [
            "react",
            "react-dom",
            "react-router-dom",
            "@tanstack/react-query",
            "axios",
            "zustand",
            "zod",
            "react-hook-form",
            "clsx",
            "tailwind-merge",
        ],
        exclude: ["@aejkatappaja/phantom-ui"],
    },
}));