import { useCallback, useEffect, useState } from "react";
import type { User } from "@/features/auth/types";
import { getMyTravelers } from "./api";
import { sortTravelers } from "./lib";
import type { Traveler } from "./types";

export type TravelersLoad = { status: "loading" } | { status: "ready"; data: Traveler[] } | { status: "error" };

/** The account's saved travellers, account holder first. `add` and `remove` update the list in place. */
export function useMyTravelers(user: User | null) {
  const [attempt, setAttempt] = useState(0);
  const [state, setState] = useState<{ key: string; result: TravelersLoad } | null>(null);
  const key = `${user?.id ?? ""}:${attempt}`;

  useEffect(() => {
    if (!user) return;
    let live = true;
    getMyTravelers(user.id).then(
      (data) => live && setState({ key, result: { status: "ready", data: sortTravelers(data, user) } }),
      () => live && setState({ key, result: { status: "error" } }),
    );
    return () => {
      live = false;
    };
  }, [user, key]);

  const result: TravelersLoad = state && state.key === key ? state.result : { status: "loading" };

  const retry = useCallback(() => setAttempt((a) => a + 1), []);
  const add = useCallback(
    (t: Traveler) =>
      setState((s) => (s && s.result.status === "ready" ? { ...s, result: { status: "ready", data: [...s.result.data, t] } } : s)),
    [],
  );
  const remove = useCallback(
    (id: string) =>
      setState((s) =>
        s && s.result.status === "ready"
          ? { ...s, result: { status: "ready", data: s.result.data.filter((t) => t.id !== id) } }
          : s,
      ),
    [],
  );
  return { result, retry, add, remove };
}
