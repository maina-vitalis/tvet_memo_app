import type { Href } from "expo-router";

export const MEMO_ROUTE_PATHS = {
  create: "/memo/create",
} as const;

export const MEMO_ROUTES: Record<keyof typeof MEMO_ROUTE_PATHS, Href> = {
  create: MEMO_ROUTE_PATHS.create,
};
