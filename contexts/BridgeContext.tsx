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
type State = {
  snapshot: Snapshot;
  loading: boolean;
  error: unknown;
  refresh: () => Promise<void>;
};
const Context = createContext<State | null>(null);
export function BridgeProvider({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  const [snapshot, setSnapshot] = useState<Snapshot>(emptySnapshot);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<unknown>(null);
  const generation = useRef(0);
  const [owner, setOwner] = useState<string | null>(null);
  const refresh = useCallback(async () => {
    const request = ++generation.current;
    if (!user || user.is_anonymous) {
      setSnapshot(emptySnapshot);
      setOwner(null);
      setError(null);
      return;
    }
    setLoading(true);
    try {
      const next = await v2Request<Snapshot>("snapshot");
      if (request === generation.current) {
        setSnapshot(next);
        setOwner(user.id);
        setError(null);
      }
    } catch (err) {
      if (request === generation.current) {
        setError(err);
        setSnapshot(emptySnapshot);
        setOwner(user.id);
      }
    } finally {
      if (request === generation.current) setLoading(false);
    }
  }, [user?.id]);
  useEffect(() => {
    let active = true;
    void refresh();
    const timer = setInterval(() => {
      if (active && document.visibilityState === "visible") void refresh();
    }, 60000);
    return () => {
      active = false;
      clearInterval(timer);
    };
  }, [refresh]);
  return (
    <Context.Provider
      value={{
        snapshot: owner === user?.id ? snapshot : emptySnapshot,
        loading,
        error: owner === user?.id ? error : null,
        refresh,
      }}
    >
      <Fragment key={user?.id || "visitor"}>{children}</Fragment>
    </Context.Provider>
  );
}
export function useBridge() {
  const ctx = useContext(Context);
  if (!ctx) throw new Error("BridgeProvider missing");
  return ctx;
}
