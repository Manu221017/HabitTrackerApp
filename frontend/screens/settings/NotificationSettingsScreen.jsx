import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Switch,
  ScrollView,
  Alert,
  StyleSheet,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Colors from '../../constants/Colors';
import { useThemedStyles, useTheme } from '../../contexts/ThemeContext';
import NotificationService from '../../../backend/services/NotificationService';

const styles = StyleSheet.create({
  headerTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: Colors.textPrimary,
    marginBottom: 8,
    textAlign: 'center',
  },
  headerDescription: {
    fontSize: 16,
    color: Colors.textSecondary,
    textAlign: 'center',
    lineHeight: 22,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: Colors.textPrimary,
    marginBottom: 16,
  },
  settingItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: Colors.cardBorder,
  },
  settingInfo: {
    flex: 1,
    marginRight: 16,
  },
  settingTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.textPrimary,
    marginBottom: 4,
  },
  settingDescription: {
    fontSize: 14,
    color: Colors.textSecondary,
    lineHeight: 20,
  },
  actionButton: {
    paddingVertical: 16,
    paddingHorizontal: 20,
    borderRadius: 12,
    alignItems: 'center',
  },
  actionButtonText: {
    color: Colors.textInverse,
    fontSize: 16,
    fontWeight: '600',
  },
  infoTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: Colors.textPrimary,
    marginBottom: 12,
  },
  infoText: {
    fontSize: 14,
    color: Colors.textSecondary,
    lineHeight: 20,
  },
});

export default function NotificationSettingsScreen({ navigation }) {
  const GlobalStyles = useThemedStyles();
  const { colors } = useTheme();
  const [notificationsEnabled, setNotificationsEnabled] = useState(false);
  const [habitReminders, setHabitReminders] = useState(true);
  const [streakReminders, setStreakReminders] = useState(true);
  const [pendingReminders, setPendingReminders] = useState(true);
  const [dailyDigest, setDailyDigest] = useState(false);
  const [weeklyReport, setWeeklyReport] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadNotificationSettings();
  }, []);

  const loadNotificationSettings = async () => {
    try {
      const hasPermission = await NotificationService.requestPermissions();
      setNotificationsEnabled(hasPermission);
      
      // Cargar configuraciones guardadas
      const settings = await NotificationService.getStoredNotifications();
      // Aquí podrías cargar configuraciones específicas del usuario
    } catch (error) {
      console.error('Error al cargar configuraciones:', error);
    }
  };

  const handlePermissionToggle = async () => {
    if (notificationsEnabled) {
      // Deshabilitar notificaciones
      Alert.alert(
        'Deshabilitar Notificaciones',
        '¿Estás seguro de que quieres deshabilitar todas las notificaciones?',
        [
          { text: 'Cancelar', style: 'cancel' },
          {
            text: 'Deshabilitar',
            style: 'destructive',
            onPress: async () => {
              await NotificationService.cancelAllNotifications();
              setNotificationsEnabled(false);
              setHabitReminders(false);
              setStreakReminders(false);
              setPendingReminders(false);
              setDailyDigest(false);
              setWeeklyReport(false);
            },
          },
        ]
      );
    } else {
      // Solicitar permisos
      const hasPermission = await NotificationService.requestPermissions();
      if (hasPermission) {
        setNotificationsEnabled(true);
        // Configurar notificaciones por defecto
        await setupDefaultNotifications();
      } else {
        Alert.alert(
          'Permisos Requeridos',
          'Para recibir notificaciones, necesitas habilitar los permisos en la configuración de tu dispositivo.',
          [
            { text: 'Cancelar', style: 'cancel' },
            { text: 'Configuración', onPress: () => NotificationService.requestPermissions() },
          ]
        );
      }
    }
  };

  const setupDefaultNotifications = async () => {
    try {
      setLoading(true);
      
      // Configurar recordatorio de hábitos pendientes
      if (pendingReminders) {
        await NotificationService.schedulePendingHabitsReminder();
      }
      
      setLoading(false);
    } catch (error) {
      console.error('Error al configurar notificaciones por defecto:', error);
      setLoading(false);
    }
  };

  const handleHabitRemindersToggle = async (value) => {
    setHabitReminders(value);
    if (value) {
      // Habilitar recordatorios de hábitos
      Alert.alert(
        'Recordatorios de Hábitos',
        'Los recordatorios se programarán automáticamente para cada hábito que tenga una hora configurada.',
        [{ text: 'Entendido' }]
      );
    } else {
      // Deshabilitar recordatorios de hábitos
      Alert.alert(
        'Deshabilitar Recordatorios',
        '¿Quieres cancelar todos los recordatorios de hábitos existentes?',
        [
          { text: 'Cancelar', style: 'cancel' },
          {
            text: 'Cancelar Todos',
            onPress: async () => {
              // Aquí cancelarías todos los recordatorios de hábitos
              console.log('Recordatorios de hábitos cancelados');
            },
          },
        ]
      );
    }
  };

  const handleStreakRemindersToggle = async (value) => {
    setStreakReminders(value);
    if (value) {
      Alert.alert(
        'Recordatorios de Racha',
        'Recibirás notificaciones para mantener tus rachas activas.',
        [{ text: 'Entendido' }]
      );
    }
  };

  const handlePendingRemindersToggle = async (value) => {
    setPendingReminders(value);
    if (value) {
      await NotificationService.schedulePendingHabitsReminder();
    } else {
      await NotificationService.cancelPendingHabitsReminders();
    }
  };

  const handleDailyDigestToggle = (value) => {
    setDailyDigest(value);
    // Implementar lógica para digest diario
  };

  const handleWeeklyReportToggle = (value) => {
    setWeeklyReport(value);
    // Implementar lógica para reporte semanal
  };

  const testNotification = async () => {
    try {
      await NotificationService.scheduleHabitReminder({
        id: 'test',
        title: 'Hábito de Prueba',
        time: '12:00',
      });
      Alert.alert('Éxito', 'Notificación de prueba programada para las 12:00');
    } catch (error) {
      Alert.alert('Error', 'No se pudo programar la notificación de prueba');
    }
  };

  const renderSettingItem = (title, description, value, onToggle, disabled = false) => (
    <View style={[styles.settingItem, { borderBottomColor: colors.cardBorder }]}>
      <View style={styles.settingInfo}>
        <Text style={[styles.settingTitle, { color: colors.textPrimary }]}>{title}</Text>
        <Text style={[styles.settingDescription, { color: colors.textSecondary }]}>{description}</Text>
      </View>
      <Switch
        value={value}
        onValueChange={onToggle}
        disabled={disabled || !notificationsEnabled}
        trackColor={{ false: colors.backgroundTertiary, true: colors.primary }}
        thumbColor={value ? colors.textInverse : colors.textSecondary}
      />
    </View>
  );

  return (
    <SafeAreaView style={GlobalStyles.safeArea}>
      <ScrollView style={GlobalStyles.container} showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={[GlobalStyles.card, { marginBottom: 16 }]}>
          <Text style={[styles.headerTitle, { color: colors.textPrimary }]}>Configuración de Notificaciones</Text>
          <Text style={[styles.headerDescription, { color: colors.textSecondary }]}>
            Personaliza cómo y cuándo recibir notificaciones para mantener tus hábitos activos
          </Text>
        </View>

        {/* Permisos principales */}
        <View style={[GlobalStyles.card, { marginBottom: 16 }]}>
          <View style={[styles.settingItem, { borderBottomColor: colors.cardBorder }]}>
            <View style={styles.settingInfo}>
              <Text style={[styles.settingTitle, { color: colors.textPrimary }]}>Notificaciones</Text>
              <Text style={[styles.settingDescription, { color: colors.textSecondary }]}>
                Habilitar todas las notificaciones de la aplicación
              </Text>
            </View>
            <Switch
              value={notificationsEnabled}
              onValueChange={handlePermissionToggle}
              trackColor={{ false: colors.backgroundTertiary, true: colors.primary }}
              thumbColor={notificationsEnabled ? colors.textInverse : colors.textSecondary}
            />
          </View>
        </View>

        {/* Configuraciones específicas */}
        <View style={[GlobalStyles.card, { marginBottom: 16 }]}>
          <Text style={[styles.sectionTitle, { color: colors.textPrimary }]}>Recordatorios de Hábitos</Text>
          
          {renderSettingItem(
            'Recordatorios Diarios',
            'Recibe notificaciones cuando sea hora de tus hábitos',
            habitReminders,
            handleHabitRemindersToggle
          )}
          
          {renderSettingItem(
            'Recordatorios de Racha',
            'Mantén tus rachas activas con recordatorios motivacionales',
            streakReminders,
            handleStreakRemindersToggle
          )}
          
          {renderSettingItem(
            'Hábitos Pendientes',
            'Recordatorio diario a las 8 PM para revisar hábitos pendientes',
            pendingReminders,
            handlePendingRemindersToggle
          )}
        </View>

        {/* Reportes y resúmenes */}
        <View style={[GlobalStyles.card, { marginBottom: 16 }]}>
          <Text style={[styles.sectionTitle, { color: colors.textPrimary }]}>Reportes y Resúmenes</Text>
          
          {renderSettingItem(
            'Resumen Diario',
            'Recibe un resumen de tus hábitos completados cada día',
            dailyDigest,
            handleDailyDigestToggle
          )}
          
          {renderSettingItem(
            'Reporte Semanal',
            'Análisis semanal de tu progreso y estadísticas',
            weeklyReport,
            handleWeeklyReportToggle
          )}
        </View>

        {/* Botones de acción */}
        <View style={[GlobalStyles.card, { marginBottom: 16 }]}>
          <TouchableOpacity
            style={[
              styles.actionButton,
              { backgroundColor: colors.primary, opacity: notificationsEnabled ? 1 : 0.5 }
            ]}
            onPress={testNotification}
            disabled={!notificationsEnabled}
          >
            <Text style={[styles.actionButtonText, { color: colors.textInverse }]}>🔔 Probar Notificación</Text>
          </TouchableOpacity>
          
          <TouchableOpacity
            style={[
              styles.actionButton,
              { backgroundColor: colors.secondary, marginTop: 12 }
            ]}
            onPress={() => {
              Alert.alert(
                'Información',
                'Las notificaciones se programan automáticamente cuando:\n\n• Creas un hábito con hora específica\n• Completas o pierdes un hábito\n• Cambias la configuración de notificaciones\n\nLas notificaciones se repiten diariamente según tu configuración.'
              );
            }}
          >
            <Text style={[styles.actionButtonText, { color: colors.textInverse }]}>ℹ️ Cómo Funcionan</Text>
          </TouchableOpacity>
        </View>

        {/* Información adicional */}
        <View style={[GlobalStyles.card, { marginBottom: 20 }]}>
          <Text style={[styles.infoTitle, { color: colors.textPrimary }]}>💡 Consejos</Text>
          <Text style={[styles.infoText, { color: colors.textSecondary }]}>
            • Las notificaciones funcionan mejor cuando la app está cerrada{'\n'}
            • Asegúrate de que tu dispositivo no esté en modo "No molestar"{'\n'}
            • Las notificaciones se adaptan a tu zona horaria{'\n'}
            • Puedes cambiar la hora de los recordatorios editando cada hábito
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
