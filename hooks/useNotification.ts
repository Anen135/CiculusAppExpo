 
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Notifications from "expo-notifications";
import { Platform } from "react-native";

// ----------------------------
// Управление каналами и правами
// ----------------------------

async function setupNotificationChannel() {
    if (Platform.OS === "android") {
        await Notifications.setNotificationChannelAsync("default", {
            name: "CiculusApp",
            importance: Notifications.AndroidImportance.HIGH,
            vibrationPattern: [0, 255, 255, 255],
            lightColor: "#FF231F7C",
        });
    }
}

export async function requestPermissionsAsync(): Promise<boolean> {
    await setupNotificationChannel();

    const { status } = await Notifications.requestPermissionsAsync({
        ios: {
            allowAlert: true,
            allowBadge: true,
            allowSound: true,
        },
    });

    return status === 'granted';
}

// ----------------------------
// Управление уведомлениями
// ----------------------------

const NOTIFICATION_ID_KEY = '@notification_ids';

async function getStoredNotificationIds(): Promise<Record<string, string>> {
    try {
        const json = await AsyncStorage.getItem(NOTIFICATION_ID_KEY);
        return json ? JSON.parse(json) : {};
    } catch (e) {
        console.error('Ошибка чтения notification IDs', e);
        return {};
    }
}

export async function storeNotificationId(entryId: number, notificationId: string) {
    const ids = await getStoredNotificationIds();
    ids[entryId.toString()] = notificationId;
    await AsyncStorage.setItem(NOTIFICATION_ID_KEY, JSON.stringify(ids));
}

export async function removeStoredNotificationId(entryId: number) {
    const ids = await getStoredNotificationIds();
    delete ids[entryId.toString()];
    await AsyncStorage.setItem(NOTIFICATION_ID_KEY, JSON.stringify(ids));
}

/**
 * Планирует уведомление и возвращает его ID.
 * Не сохраняет ID автоматически — это должен делать вызывающий код.
 */
export async function scheduledNotification(
    title: string,
    body: string,
    datetime: Date,
    data: any = {}
): Promise<string | null> {
    if (datetime.getTime() <= Date.now()) {
        console.warn('Дата в прошлом — уведомление не запланировано');
        return null;
    }

    const notificationId = await Notifications.scheduleNotificationAsync({
        content: {
            title,
            body: body || 'Напоминание',
            sound: true,
            data,
        },
        trigger: {
            type: Notifications.SchedulableTriggerInputTypes.DATE,
            date: datetime,
        },
    });

    return notificationId;
}

/**
 * Мгновенно показывает уведомление (без планирования).
 */
export async function showNotification(title: string, body: string, data: any = {}) {
    await Notifications.scheduleNotificationAsync({
        content: {
            title,
            body,
            sound: true,
            data,
        },
        trigger: null, // показать немедленно
    });
}

// ----------------------------
// Отмена уведомлений
// ----------------------------

export async function cancelNotificationById(notificationId: string) {
    if (notificationId) {
        await Notifications.cancelScheduledNotificationAsync(notificationId);
    }
}

export async function cancelNotificationForEntry(entryId: number) {
    const ids = await getStoredNotificationIds();
    const notificationId = ids[entryId.toString()];
    if (notificationId) {
        await cancelNotificationById(notificationId);
        await removeStoredNotificationId(entryId);
    }
}