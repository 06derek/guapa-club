// Build/dev config for deploying GUAPA Club to Cloudflare Workers with @cloudflare/vite-plugin.
// Migration complete: no @lovable.dev/vite-tanstack-config, no Nitro adapter.
// Follows Cloudflare's TanStack Start guide: the Cloudflare plugin owns the "ssr" environment,
// so the server bundle runs in workerd both in `vite dev` and in production (no Nitro adapter).
// Never set ssr.external or resolve.external: the Worker has no runtime module resolution.
// Never add response compression: Cloudflare already compresses at the edge.
import { defineConfig } from "vite";
import { cloudflare } from "@cloudflare/vite-plugin";
import { tanstackStart } from "@tanstack/react-start/plugin/vite";
import viteReact from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import path from "node:path";

export default defineConfig({
  server: {
    host: "::",
    port: 8080,
  },
  css: {
    transformer: "lightningcss",
  },
  resolve: {
    // Native tsconfig "paths" support (replaces the vite-tsconfig-paths plugin on Vite 8).
    tsconfigPaths: true,
    alias: { "@": path.resolve(import.meta.dirname, "./src") },
    dedupe: [
      "react",
      "react-dom",
      "react/jsx-runtime",
      "react/jsx-dev-runtime",
      "@tanstack/react-query",
      "@tanstack/query-core",
    ],
  },
  optimizeDeps: {
    include: ["react", "react-dom", "react-dom/client", "react/jsx-runtime", "react/jsx-dev-runtime"],
  },
  plugins: [
    cloudflare({ viteEnvironment: { name: "ssr" } }),
    tailwindcss(),
    // `entry: "server"` keeps src/server.ts (SSR error wrapper) as TanStack Start's server entry.
    tanstackStart({ server: { entry: "server" } }),
    viteReact(),
  ],
});
