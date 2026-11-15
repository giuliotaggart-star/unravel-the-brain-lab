import { createFileRoute, redirect } from "@tanstack/react-router";

export const Route = createFileRoute("/further")({
  beforeLoad: () => {
    throw redirect({ to: "/prize", statusCode: 301 });
  },
});
