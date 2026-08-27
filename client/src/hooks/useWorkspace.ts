import { useEffect, useState } from "react";
import type { Workspace } from "../../../shared/workspace";

const STORAGE_KEY = "ostazi-workspace";
const EVENT_NAME = "ostazi-workspace-change";

function readWorkspace(): Workspace {
  const value = localStorage.getItem(STORAGE_KEY);
  return value === "school" || value === "center" || value === "online" ? value : "center";
}

export function useWorkspace() {
  const [workspace, setWorkspaceState] = useState<Workspace>(readWorkspace);
  useEffect(() => {
    const sync = () => setWorkspaceState(readWorkspace());
    window.addEventListener(EVENT_NAME, sync);
    return () => window.removeEventListener(EVENT_NAME, sync);
  }, []);
  const setWorkspace = (next: Workspace) => {
    localStorage.setItem(STORAGE_KEY, next);
    setWorkspaceState(next);
    window.dispatchEvent(new Event(EVENT_NAME));
  };
  return [workspace, setWorkspace] as const;
}
