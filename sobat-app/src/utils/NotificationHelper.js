import * as Notifications from 'expo-notifications';

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});

export async function requestNotificationPermissions() {
  try {
    const { status: existingStatus } = await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;

    if (existingStatus !== 'granted') {
      const { status } = await Notifications.requestPermissionsAsync();
      finalStatus = status;
    }

    if (finalStatus !== 'granted') {
      return { granted: false };
    }

    return { granted: true };
  } catch (error) {
    console.error('Gagal meminta izin notifikasi:', error);
    return { granted: false };
  }
}

export async function scheduleSmartReminders(medicationName, triggerDate) {
  try {
    const permission = await requestNotificationPermissions();

    if (!permission.granted) {
      return { primaryId: null, warningId: null };
    }

    const primaryDate = new Date(triggerDate);
    const warningDate = new Date(primaryDate.getTime() + 30 * 60 * 1000);

    const primaryId = await Notifications.scheduleNotificationAsync({
      content: {
        title: 'Waktunya Minum Obat!',
        body: `Jangan lupa minum ${medicationName} Anda sekarang.`,
      },
      trigger: {
        type: Notifications.SchedulableTriggerInputTypes.DATE,
        date: primaryDate,
      },
    });

    const warningId = await Notifications.scheduleNotificationAsync({
      content: {
        title: 'Peringatan Kepatuhan AI ⚠️',
        body: `Jika Anda tidak segera meminum ${medicationName}, skor kepatuhan Anda akan turun drastis!`,
      },
      trigger: {
        type: Notifications.SchedulableTriggerInputTypes.DATE,
        date: warningDate,
      },
    });

    return {
      primaryId,
      warningId,
    };
  } catch (error) {
    console.error('Gagal menjadwalkan notifikasi pintar:', error);
    return { primaryId: null, warningId: null };
  }
}

export async function cancelNotification(notificationId) {
  try {
    if (!notificationId) {
      return false;
    }

    await Notifications.cancelScheduledNotificationAsync(notificationId);
    return true;
  } catch (error) {
    console.error('Gagal membatalkan notifikasi:', error);
    return false;
  }
}
