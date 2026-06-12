import * as Notifications from "expo-notifications";
import { medicamentosRepository } from "../database/repositories/medicamentosRepository";

export interface StoredMed {
  id: number;
  nombre: string;
  dosisMg: number | string;
  cadaHoras: number | string;
  notificationId?: string;
}

export function configureNotificationHandler(): void {
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
  try {
    const { status: existingStatus } =
      await Notifications.getPermissionsAsync();

    let finalStatus = existingStatus;

    if (existingStatus !== "granted") {
      const { status } = await Notifications.requestPermissionsAsync();

      finalStatus = status;
    }

    return finalStatus === "granted";
  } catch (error) {
    console.log("[notifications] permission error", error);
    return false;
  }
}

export async function scheduleMedNotification(
  med: StoredMed,
): Promise<string | null> {
  try {
    const ok = await requestNotificationPermission();

    if (!ok) return null;

    const hours = Number(med.cadaHoras);

    if (isNaN(hours) || hours <= 0) {
      return null;
    }

    const id = await Notifications.scheduleNotificationAsync({
      content: {
        title: "Recordatorio de medicamento",
        body: `Es hora de tomar ${med.nombre} (${med.dosisMg} mg)`,
        data: {
          medId: med.id,
        },
      },

      trigger: {
        type: Notifications.SchedulableTriggerInputTypes.TIME_INTERVAL,
        seconds: hours * 3600,
        repeats: true,
      },
    });

    return id;
  } catch (error) {
    console.log("[notifications] schedule error", error);
    return null;
  }
}

export async function cancelMedNotification(
  notificationId?: string,
): Promise<void> {
  if (!notificationId) return;

  try {
    await Notifications.cancelScheduledNotificationAsync(notificationId);
  } catch (error) {
    console.log("[notifications] cancel error", error);
  }
}
