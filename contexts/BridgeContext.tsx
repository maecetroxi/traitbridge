import {
  createContext,
  Fragment,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";
import { useAuth } from "./AuthContext";
import { emptySnapshot, type Snapshot } from "../lib/v2/types";
import { v2Request } from "../lib/v2/client";

type Loaded = { owner: string; snapshot: Snapshot; error: unknown };
type State = {
  snapshot: Snapshot;
  loading: boolean;
  error: unknown;
  refresh: () => Promise<void>;
};
const Context = createContext<State | null>(null);

export function BridgeProvider({
  children,
  keepMounted = false,
}: {
  children: React.ReactNode;
  keepMounted?: boolean;
}) {
  const { user } = useAuth();
  const owner = user && !user.is_anonymous ? user.id : null;
  const [loaded, setLoaded] = useState<Loaded | null>(null);
  const generation = useRef(0);
  const refresh = useCallback(async () => {
    if (!owner) return;
    const request = ++generation.current;
    try {
      const snapshot = await v2Request<Snapshot>(
        "snapshot",
        {},
        undefined,
        owner,
      );
      if (request === generation.current)
        setLoaded({ owner, snapshot, error: null });
    } catch (error) {
      if (request === generation.current)
        setLoaded({ owner, snapshot: emptySnapshot, error });
    }
  }, [owner]);

  useEffect(() => {
    setLoaded(null);
    if (!owner) return;
    void refresh();
    function refreshVisible() {
      if (document.visibilityState === "visible") void refresh();
    }
    const timer = window.setInterval(refreshVisible, 60_000);
    document.addEventListener("visibilitychange", refreshVisible);
    return () => {
      generation.current++;
      window.clearInterval(timer);
      document.removeEventListener("visibilitychange", refreshVisible);
    };
  }, [owner, refresh]);

  const account = loaded?.owner === owner ? loaded : null;
  return (
    <Context.Provider
      value={{
        snapshot: account?.snapshot ?? emptySnapshot,
        loading: Boolean(owner && !account),
        error: account?.error ?? null,
        refresh,
      }}
    >
      <Fragment key={keepMounted ? "auth" : (owner ?? "visitor")}>
        {children}
      </Fragment>
    </Context.Provider>
  );
}

export function useBridge() {
  const ctx = useContext(Context);
  if (!ctx) throw new Error("BridgeProvider missing");
  return ctx;
}
