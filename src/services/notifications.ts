import * as Notifications from "expo-notifications";
import type { StoredMed } from "../config/localStorageConfig";

export function configureNotificationHandler() {
  Notifications.setNotificationHandler({
    handleNotification: async () => ({
      shouldPlaySound: true,
      shouldSetBadge: false,
      shouldShowBanner: true,
      shouldShowList: true,
    }),
  });
}

export async function requestNotificationPermission(): Promise<boolean> {
  const { status: existingStatus } = await Notifications.getPermissionsAsync();
  let finalStatus = existingStatus;

  if (existingStatus !== "granted") {
    const { status } = await Notifications.requestPermissionsAsync();
    finalStatus = status;
  }

  return finalStatus === "granted";
}

export async function scheduleMedNotification(
  med: StoredMed
): Promise<string | null> {
  const ok = await requestNotificationPermission();
  if (!ok) return null;

  const hours = Number(med.cadaHoras || "0");
  if (!hours || hours <= 0) return null;

  const trigger = {
    type: Notifications.SchedulableTriggerInputTypes.TIME_INTERVAL,
    seconds: hours * 3600,
    repeats: true,
  } as const;

  const id = await Notifications.scheduleNotificationAsync({
    content: {
      title: "Recordatorio de medicamento",
      body: `Es hora de tomar ${med.nombre} (${med.dosisMg} mg)`,
      data: { medId: med.id },
    },
    trigger,
  });

  return id;
}

export async function cancelMedNotification(notificationId?: string) {
  if (!notificationId) return;
  try {
    await Notifications.cancelScheduledNotificationAsync(notificationId);
  } catch (e) {
    console.log("[notifications] cancel error", e);
  }
}

