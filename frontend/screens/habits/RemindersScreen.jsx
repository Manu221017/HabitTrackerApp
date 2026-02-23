import React, { useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, Alert, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import * as Notifications from 'expo-notifications';
import Colors from '../../constants/Colors';
import { useThemedStyles } from '../../contexts/ThemeContext';
import { useHabits } from '../../contexts/HabitsContext';
import { updateHabitReminder } from '../../../backend/config/firebase';

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});

async function ensurePermission() {
  const settings = await Notifications.getPermissionsAsync();
  if (settings.status !== 'granted') {
    const req = await Notifications.requestPermissionsAsync();
    return req.status === 'granted';
  }
  return true;
}

function timeToHoursMinutes(timeStr) {
  const [h, m] = (timeStr || '09:00').split(':').map(Number);
  return { hour: h, minute: m };
}

export default function RemindersScreen() {
  const GlobalStyles = useThemedStyles();
  const { habits } = useHabits();
  const [isSupported, setIsSupported] = useState(true);

  useEffect(() => {
    if (Platform.OS === 'web') setIsSupported(false);
    (async () => {
      if (Platform.OS === 'android') {
        try {
          await Notifications.setNotificationChannelAsync('default', {
            name: 'General',
            importance: Notifications.AndroidImportance.DEFAULT,
            sound: true,
          });
        } catch {}
      }
    })();
  }, []);

  const scheduleDailyReminder = async (habit) => {
    if (!isSupported) {
      Alert.alert('No disponible', 'Las notificaciones no están disponibles en este entorno');
      return;
    }
    const granted = await ensurePermission();
    if (!granted) {
      Alert.alert('Permiso requerido', 'Activa los permisos de notificaciones');
      return;
    }
    const { hour, minute } = timeToHoursMinutes(habit.reminderTime || habit.time || '09:00');
    const identifier = await Notifications.scheduleNotificationAsync({
      content: {
        title: 'Recordatorio de hábito',
        body: `${habit.title} · ${habit.description || ''}`.trim(),
        sound: true,
      },
      trigger: { hour, minute, repeats: true },
    });
    await updateHabitReminder(habit.id, { reminderEnabled: true, reminderTime: `${String(hour).padStart(2,'0')}:${String(minute).padStart(2,'0')}`, notificationId: identifier });
    Alert.alert('Listo', 'Recordatorio diario programado');
  };

  const cancelReminder = async (habit) => {
    if (habit.notificationId) {
      try { await Notifications.cancelScheduledNotificationAsync(habit.notificationId); } catch {}
    }
    await updateHabitReminder(habit.id, { reminderEnabled: false, notificationId: null });
    Alert.alert('Listo', 'Recordatorio desactivado');
  };

  return (
    <SafeAreaView style={GlobalStyles.safeArea}>
      <View style={[GlobalStyles.container]}>
        <View style={[GlobalStyles.card, { marginBottom: 12 }]}> 
          <Text style={GlobalStyles.title}>Recordatorios</Text>
          <Text style={GlobalStyles.caption}>Programa notificaciones locales diarias para cada hábito.</Text>
        </View>

        {habits.length === 0 ? (
          <View style={[GlobalStyles.card, { alignItems: 'center' }]}>
            <Text style={GlobalStyles.caption}>Crea un hábito primero.</Text>
          </View>
        ) : (
          habits.map(habit => (
            <View key={habit.id} style={[GlobalStyles.card, { marginHorizontal: 12 }]}>
              <View style={GlobalStyles.rowSpaceBetween}>
                <View style={{ flex: 1, marginRight: 12 }}>
                  <Text style={GlobalStyles.heading}>{habit.title}</Text>
                  <Text style={GlobalStyles.smallText}>Hora: {habit.reminderTime || habit.time || '09:00'}</Text>
                </View>
                {habit.reminderEnabled ? (
                  <TouchableOpacity style={GlobalStyles.buttonSecondary} onPress={() => cancelReminder(habit)}>
                    <Text style={GlobalStyles.buttonTextSecondary}>Desactivar</Text>
                  </TouchableOpacity>
                ) : (
                  <TouchableOpacity style={GlobalStyles.buttonPrimary} onPress={() => scheduleDailyReminder(habit)}>
                    <Text style={GlobalStyles.buttonText}>Activar</Text>
                  </TouchableOpacity>
                )}
              </View>
            </View>
          ))
        )}
      </View>
    </SafeAreaView>
  );
}


