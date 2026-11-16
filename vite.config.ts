import { defineConfig } from "@lovable.dev/vite-tanstack-config";

export default defineConfig({
  vite: { base: process.env["GITHUB_ACTIONS"] ? "/unravel-the-brain-lab/" : "/" },
  tanstackStart: {
    spa: { enabled: true },
    server: { entry: "server" },
  },
});
