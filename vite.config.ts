import { defineConfig } from "@lovable.dev/vite-tanstack-config";

export default defineConfig({
  vite: { base: "/unravel-the-brain-lab/" },
  tanstackStart: {
    spa: { enabled: true },
    server: { entry: "server" },
  },
});
