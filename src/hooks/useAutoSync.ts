import { useEffect, useRef, useState } from "react";
import { useNetworkStatus } from "./useNetworkStatus";
import {
  processSyncQueue,
  downloadFromCloud,
  repairSyncQueue,
} from "../services/syncService";

export function useAutoSync(userId?: string | null) {
  const { isOnline } = useNetworkStatus();
  const syncingRef = useRef(false);
  const [isSyncing, setIsSyncing] = useState(false);
  const [lastSyncError, setLastSyncError] = useState<string | null>(null);
  const syncNow = async () => {
    if (!userId) return;
    if (!isOnline) return;
    if (syncingRef.current) return;
    syncingRef.current = true;
    setIsSyncing(true);
    setLastSyncError(null);
    try {
      await repairSyncQueue();
      await processSyncQueue();
      await downloadFromCloud(userId);
    } catch (error: any) {
      console.error("Error al sincronizar:", error);
      setLastSyncError(error?.message ?? "Error desconocido");
    } finally {
      syncingRef.current = false;
      setIsSyncing(false);
    }
  };
  useEffect(() => {
    syncNow();
  }, [isOnline, userId]);
  useEffect(() => {
    if (!userId || !isOnline) return;
    const interval = setInterval(() => {
      syncNow();
    }, 30000);
    return () => clearInterval(interval);
  }, [userId, isOnline]);
  return {
    isOnline,
    isSyncing,
    lastSyncError,
  };
}

