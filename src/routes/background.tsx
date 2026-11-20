import { createFileRoute, redirect } from "@tanstack/react-router";

/* The topic intro now opens the warm-up poll; old links land there. */
export const Route = createFileRoute("/background")({
  beforeLoad: () => {
    throw redirect({ to: "/poll" });
  },
});
