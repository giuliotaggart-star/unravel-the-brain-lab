import { defineConfig } from "@lovable.dev/vite-tanstack-config";

export default defineConfig({
  base: "/unravel-the-brain-lab/",
  tanstackStart: {
    spa: { enabled: true },
    server: { entry: "server" },
  },
});
