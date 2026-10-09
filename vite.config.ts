/// <reference types="vitest" />
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { componentTagger } from "lovable-tagger";
import { VitePWA } from "vite-plugin-pwa";

export default defineConfig(({ mode }) => ({
  server: {
    host: "::",
    port: 8080,
  },
  plugins: [react(), mode === "development" && componentTagger(),
    VitePWA({
      // "prompt", not "autoUpdate": a new worker waits until the user applies it from
      // PwaUpdatePrompt, so the app is never swapped out from under a clinician mid-entry.
      registerType: "prompt",
      injectRegister: null,
      devOptions: { enabled: false },
      filename: "sw.js",
      includeAssets: ["favicon.png", "app-icon-192.png", "app-icon-512.png"],
      manifest: {
        name: "StrokeSuite ID",
        short_name: "Stroke",
        description: "Evidence-based stroke decision support",
        start_url: "/",
        scope: "/",
        display: "standalone",
        theme_color: "#0f1219",
        background_color: "#0f1219",
        icons: [
          { src: "/app-icon-192.png", sizes: "192x192", type: "image/png" },
          { src: "/app-icon-512.png", sizes: "512x512", type: "image/png" },
          { src: "/app-icon-512.png", sizes: "512x512", type: "image/png", purpose: "maskable" },
        ],
      },
      workbox: {
        // App shell only: HTML, JS, CSS. Never cache API, auth, payment or clinical data responses.
        globPatterns: ["**/*.{html,js,css}"],
        maximumFileSizeToCacheInBytes: 8 * 1024 * 1024,
        navigateFallback: "/index.html",
        navigateFallbackDenylist: [/^\/~oauth/, /^\/api/, /^\/functions/],
        runtimeCaching: [
          { urlPattern: ({ request }) => request.mode === "navigate", handler: "NetworkFirst", options: { cacheName: "pages", networkTimeoutSeconds: 4 } },
        ],
      },
    })].filter(Boolean),
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
      react: path.resolve(__dirname, "./node_modules/react"),
      "react-dom": path.resolve(__dirname, "./node_modules/react-dom"),
      "react/jsx-runtime": path.resolve(__dirname, "./node_modules/react/jsx-runtime"),
      "react/jsx-dev-runtime": path.resolve(__dirname, "./node_modules/react/jsx-dev-runtime"),
    },
    dedupe: ["react", "react-dom", "react/jsx-runtime", "react/jsx-dev-runtime"],
  },
  test: {
    globals: true,
    environment: "node",
    include: ["src/test/**/*.test.ts"],
    coverage: {
      provider: "v8",
      include: ["src/services/**", "src/compliance/**", "src/test/**"],
      reportsDirectory: "./coverage",
    },
  },
}));