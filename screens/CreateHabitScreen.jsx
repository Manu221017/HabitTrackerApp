import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  Alert,
  Modal,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import DateTimePicker, { DateTimePickerAndroid } from '@react-native-community/datetimepicker';
import Colors from '../constants/Colors';
import { useThemedStyles, useTheme } from '../contexts/ThemeContext';
import { createHabit } from '../config/firebase';
import Toast from 'react-native-toast-message';

const CATEGORIES = [
  'Salud',
  'Desarrollo Personal',
  'Bienestar',
  'Productividad',
  'Aprendizaje',
  'Social',
  'Finanzas',
  'Otros',
];

const DAY_LABELS = ['D', 'L', 'M', 'X', 'J', 'V', 'S'];

export default function CreateHabitScreen({ navigation }) {
  const GlobalStyles = useThemedStyles();
  const { colors } = useTheme();

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('');
  const [time, setTime] = useState('');
  const [daysOfWeek, setDaysOfWeek] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  const [showTimePicker, setShowTimePicker] = useState(false);
  const [selectedTime, setSelectedTime] = useState(new Date());

  /* =========================
     Helpers
  ========================== */

  const validateForm = () => {
    if (!title.trim()) return 'Por favor ingresa un título para el hábito';
    if (!description.trim()) return 'Por favor ingresa una descripción';
    if (!category) return 'Por favor selecciona una categoría';
    if (!time) return 'Por favor selecciona una hora';
    return null;
  };

  const formatTime = (date) => {
    const hours = date.getHours().toString().padStart(2, '0');
    const minutes = date.getMinutes().toString().padStart(2, '0');
    return `${hours}:${minutes}`;
  };

  /* =========================
     Actions
  ========================== */

  const handleCreateHabit = async () => {
    const errorMessage = validateForm();
    if (errorMessage) {
      Alert.alert('Error', errorMessage);
      return;
    }

    setIsLoading(true);

    try {
      const habitData = {
        title: title.trim(),
        description: description.trim(),
        category,
        time,
        status: 'pending',
        daysOfWeek, // [] = diario
      };

      const result = await createHabit(habitData);

      if (result.success) {
        Toast.show({
          type: 'success',
          text1: '¡Hábito creado!',
          position: 'bottom',
          visibilityTime: 1500,
        });

        setTitle('');
        setDescription('');
        setCategory('');
        setTime('');
        setDaysOfWeek([]);
        navigation.goBack();
      } else {
        Alert.alert('Error', result.error || 'Error al crear el hábito');
      }
    } catch (error) {
      console.error('Error creating habit:', error);
      Alert.alert('Error', 'Ocurrió un error inesperado. Intenta de nuevo.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleTimeSelection = () => {
    if (Platform.OS === 'android') {
      try {
        DateTimePickerAndroid.open({
          value: selectedTime,
          mode: 'time',
          is24Hour: true,
          onChange: (event, date) => {
            if (event.type === 'set' && date) {
              setSelectedTime(date);
              setTime(formatTime(date));
            }
          },
        });
      } catch {
        Alert.alert('Error', 'No se pudo abrir el selector de hora');
      }
    } else {
      setShowTimePicker(true);
    }
  };

  /* =========================
     UI
  ========================== */

  return (
    <SafeAreaView style={GlobalStyles.safeArea}>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <ScrollView
          contentContainerStyle={{ padding: 16, paddingBottom: 40 }}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          {/* Header */}
          <View style={[GlobalStyles.card, { marginBottom: 20, alignItems: 'center' }]}>
            <Text style={[GlobalStyles.title, { color: colors.primary }]}>
              Crear Nuevo Hábito
            </Text>
            <Text style={[GlobalStyles.caption, { marginTop: 6, textAlign: 'center' }]}>
              Define tu nuevo hábito y comienza tu viaje
            </Text>
          </View>

          {/* Form */}
          <View style={GlobalStyles.card}>
            {/* Title */}
            <View style={{ marginBottom: 16 }}>
              <Text style={GlobalStyles.caption}>Título del Hábito *</Text>
              <TextInput
                style={GlobalStyles.input}
                placeholder="Ej: Ejercicio matutino"
                value={title}
                onChangeText={setTitle}
                editable={!isLoading}
                maxLength={50}
              />
            </View>

            {/* Description */}
            <View style={{ marginBottom: 16 }}>
              <Text style={GlobalStyles.caption}>Descripción *</Text>
              <TextInput
                style={[GlobalStyles.input, { height: 80, textAlignVertical: 'top' }]}
                placeholder="Describe tu hábito..."
                value={description}
                onChangeText={setDescription}
                multiline
                editable={!isLoading}
                maxLength={200}
              />
            </View>

            {/* Category */}
            <View style={{ marginBottom: 16 }}>
              <Text style={GlobalStyles.caption}>Categoría *</Text>
              <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
                {CATEGORIES.map(cat => (
                  <TouchableOpacity
                    key={cat}
                    disabled={isLoading}
                    onPress={() => setCategory(cat)}
                    style={{
                      paddingHorizontal: 12,
                      paddingVertical: 8,
                      borderRadius: 20,
                      borderWidth: 2,
                      borderColor: category === cat ? colors.primary : colors.cardBorder,
                      backgroundColor: category === cat ? colors.primary : colors.backgroundSecondary,
                    }}
                  >
                    <Text style={{
                      color: category === cat ? colors.textInverse : colors.textSecondary,
                      fontWeight: '600',
                    }}>
                      {cat}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            {/* Days */}
            <View style={{ marginBottom: 16 }}>
              <Text style={GlobalStyles.caption}>
                Días de la semana (si no eliges, será diario)
              </Text>
              <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                {DAY_LABELS.map((label, idx) => (
                  <TouchableOpacity
                    key={label}
                    disabled={isLoading}
                    onPress={() =>
                      setDaysOfWeek(prev =>
                        prev.includes(idx)
                          ? prev.filter(d => d !== idx)
                          : [...prev, idx]
                      )
                    }
                    style={{
                      width: 36,
                      height: 36,
                      borderRadius: 18,
                      alignItems: 'center',
                      justifyContent: 'center',
                      backgroundColor: daysOfWeek.includes(idx)
                        ? colors.primary
                        : colors.backgroundSecondary,
                      borderWidth: 1,
                      borderColor: colors.cardBorder,
                    }}
                  >
                    <Text style={{
                      color: daysOfWeek.includes(idx)
                        ? colors.textInverse
                        : colors.textSecondary,
                      fontWeight: '600',
                    }}>
                      {label}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            {/* Time */}
            <View style={{ marginBottom: 24 }}>
              <Text style={GlobalStyles.caption}>Hora del Día *</Text>
              <TouchableOpacity
                disabled={isLoading}
                onPress={handleTimeSelection}
                style={[GlobalStyles.input, { justifyContent: 'center' }]}
              >
                <Text style={{ textAlign: 'center' }}>
                  {time || 'Seleccionar hora'}
                </Text>
              </TouchableOpacity>
            </View>

            {/* Buttons */}
            <TouchableOpacity
              style={GlobalStyles.buttonPrimary}
              disabled={isLoading}
              onPress={handleCreateHabit}
            >
              <Text style={GlobalStyles.buttonText}>
                {isLoading ? 'Creando...' : 'Crear Hábito'}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[GlobalStyles.buttonSecondary, { marginTop: 12 }]}
              disabled={isLoading}
              onPress={() => navigation.goBack()}
            >
              <Text style={GlobalStyles.buttonTextSecondary}>Cancelar</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>

      {/* iOS Time Picker */}
      <Modal visible={showTimePicker} transparent animationType="slide">
        <View style={GlobalStyles.modalOverlay}>
          <View style={[GlobalStyles.modalContent, { padding: 20 }]}>
            <DateTimePicker
              value={selectedTime}
              mode="time"
              is24Hour
              display="spinner"
              onChange={(e, date) => {
                if (date) {
                  setSelectedTime(date);
                  setTime(formatTime(date));
                }
              }}
            />
            <TouchableOpacity
              style={[GlobalStyles.buttonPrimary, { marginTop: 16 }]}
              onPress={() => setShowTimePicker(false)}
            >
              <Text style={GlobalStyles.buttonText}>Confirmar</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}
