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

const categories = [
  'Salud',
  'Desarrollo Personal',
  'Bienestar',
  'Productividad',
  'Aprendizaje',
  'Social',
  'Finanzas',
  'Otros'
];

const dayLabels = ['D', 'L', 'M', 'X', 'J', 'V', 'S'];

export default function CreateHabitScreen({ navigation }) {
  const GlobalStyles = useThemedStyles();
  const { colors } = useTheme();
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('');
  const [time, setTime] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showTimePicker, setShowTimePicker] = useState(false);
  const [selectedTime, setSelectedTime] = useState(new Date());
  const [debugInfo, setDebugInfo] = useState('');
  const [daysOfWeek, setDaysOfWeek] = useState([]); // 0..6 Domingo..Sábado

  // Debug function to log state changes
  const logState = (action, data) => {
    const info = `${action}: ${JSON.stringify(data)}`;
    console.log(info);
    setDebugInfo(prev => prev + '\n' + info);
  };

  // Clear debug info when component mounts
  React.useEffect(() => {
    logState('Component mounted', { title, description, category, time });
  }, []);

  const handleCreateHabit = async () => {
    logState('Creating habit started', { title, description, category, time });
    
    // Validation
    if (!title.trim()) {
      logState('Validation failed', 'Title is empty');
      Alert.alert('Error', 'Por favor ingresa un título para el hábito');
      return;
    }

    if (!description.trim()) {
      logState('Validation failed', 'Description is empty');
      Alert.alert('Error', 'Por favor ingresa una descripción');
      return;
    }

    if (!category) {
      logState('Validation failed', 'Category not selected');
      Alert.alert('Error', 'Por favor selecciona una categoría');
      return;
    }

    if (!time) {
      logState('Validation failed', 'Time not selected');
      Alert.alert('Error', 'Por favor selecciona una hora');
      return;
    }

    logState('Validation passed', 'All fields are valid');
    setIsLoading(true);

    try {
      const habitData = {
        title: title.trim(),
        description: description.trim(),
        category,
        time,
        status: 'pending',
        daysOfWeek, // nuevo campo
      };

      logState('Sending habit data', habitData);
      const result = await createHabit(habitData);

      if (result.success) {
        logState('Habit created successfully', result);
        Toast.show({
          type: 'success',
          text1: '¡Hábito creado!',
          position: 'bottom',
          visibilityTime: 1500,
        });
        // Clear form and navigate back
        setTitle('');
        setDescription('');
        setCategory('');
        setTime('');
        setDaysOfWeek([]);
        navigation.goBack();
      } else {
        logState('Habit creation failed', result.error);
        Alert.alert('Error', result.error || 'Error al crear el hábito');
      }
    } catch (error) {
      logState('Unexpected error', error.message);
      console.error('Error creating habit:', error);
      Alert.alert('Error', 'Ocurrió un error inesperado. Intenta de nuevo.');
    } finally {
      logState('Loading state ended', '');
      setIsLoading(false);
    }
  };

  const handleTimeSelection = () => {
    if (Platform.OS === 'android') {
      // For Android, use the native time picker
      try {
        DateTimePickerAndroid.open({
          value: selectedTime,
          onChange: (event, date) => {
            console.log('Time picker event:', event, 'date:', date);
            
            // Handle the event properly
            if (event.type === 'set' && date) {
              setSelectedTime(date);
              const hours = date.getHours().toString().padStart(2, '0');
              const minutes = date.getMinutes().toString().padStart(2, '0');
              const timeString = `${hours}:${minutes}`;
              console.log('Setting time to:', timeString);
              setTime(timeString);
            } else if (event.type === 'dismissed') {
              console.log('Time picker dismissed');
              // Don't change anything if dismissed
            }
          },
          onError: (error) => {
            console.error('Time picker error:', error);
            // Fallback to simple time selection
            showTimeSelectionFallback();
          },
          mode: 'time',
          is24Hour: true,
        });
      } catch (error) {
        console.error('Error opening time picker:', error);
        // Fallback to simple time selection
        showTimeSelectionFallback();
      }
    } else {
      // For iOS, show modal with time picker
      setShowTimePicker(true);
    }
  };

  const showTimeSelectionFallback = () => {
    const times = ['06:00', '07:00', '08:00', '09:00', '12:00', '15:00', '18:00', '20:00', '21:00'];
    Alert.alert(
      'Seleccionar Hora',
      'Elige una hora para tu hábito',
      [
        ...times.map(timeOption => ({
          text: timeOption,
          onPress: () => {
            console.log('Fallback time selected:', timeOption);
            setTime(timeOption);
          }
        })),
        {
          text: 'Cancelar',
          style: 'cancel',
          onPress: () => console.log('Time selection cancelled')
        }
      ],
      { cancelable: true }
    );
  };

  const handleTimeConfirm = (event, date) => {
    console.log('iOS time picker confirm:', event, 'date:', date);
    setShowTimePicker(false);
    if (date) {
      setSelectedTime(date);
      const hours = date.getHours().toString().padStart(2, '0');
      const minutes = date.getMinutes().toString().padStart(2, '0');
      const timeString = `${hours}:${minutes}`;
      console.log('Setting time to:', timeString);
      setTime(timeString);
    }
  };

  const handleTimeCancel = () => {
    console.log('Time picker cancelled');
    setShowTimePicker(false);
  };

  return (
    <SafeAreaView style={GlobalStyles.safeArea}>
      <KeyboardAvoidingView 
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <ScrollView 
          style={{ flex: 1 }}
          contentContainerStyle={{ 
            paddingHorizontal: 16,
            paddingVertical: 20,
            paddingBottom: 40
          }}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          {/* Header */}
          <View style={[GlobalStyles.card, { marginBottom: 20, alignItems: 'center' }]}>
            <Text style={[GlobalStyles.title, { color: colors.primary, textAlign: 'center' }]}>
              Crear Nuevo Hábito
            </Text>
            <Text style={[GlobalStyles.caption, { textAlign: 'center', marginTop: 6 }]}>
              Define tu nuevo hábito y comienza tu viaje
            </Text>
          </View>

          {/* Form */}
          <View style={[GlobalStyles.card, { marginBottom: 20 }]}>
            {/* Title Input */}
            <View style={{ marginBottom: 16 }}>
              <Text style={[GlobalStyles.caption, { marginBottom: 6, color: colors.textPrimary }]}>
                Título del Hábito *
              </Text>
              <TextInput
                style={GlobalStyles.input}
                placeholder="Ej: Ejercicio matutino"
                placeholderTextColor={colors.textTertiary}
                value={title}
                onChangeText={setTitle}
                maxLength={50}
                editable={!isLoading}
              />
            </View>

            {/* Description Input */}
            <View style={{ marginBottom: 16 }}>
              <Text style={[GlobalStyles.caption, { marginBottom: 6, color: colors.textPrimary }]}>
                Descripción *
              </Text>
              <TextInput
                style={[GlobalStyles.input, { height: 80, textAlignVertical: 'top' }]}
                placeholder="Describe tu hábito en detalle..."
                placeholderTextColor={colors.textTertiary}
                value={description}
                onChangeText={setDescription}
                multiline
                numberOfLines={3}
                maxLength={200}
                editable={!isLoading}
              />
            </View>

            {/* Category Selection */}
            <View style={{ marginBottom: 16 }}>
              <Text style={[GlobalStyles.caption, { marginBottom: 6, color: colors.textPrimary }]}>
                Categoría *
              </Text>
              <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
                {categories.map((cat) => (
                  <TouchableOpacity
                    key={cat}
                    style={[
                      {
                        paddingHorizontal: 12,
                        paddingVertical: 8,
                        borderRadius: 20,
                        borderWidth: 2,
                        borderColor: category === cat ? colors.primary : colors.cardBorder,
                        backgroundColor: category === cat ? colors.primary : colors.backgroundSecondary,
                        marginBottom: 8,
                      },
                      !isLoading && { opacity: 0.8 }
                    ]}
                    onPress={() => setCategory(cat)}
                    disabled={isLoading}
                  >
                    <Text style={[
                      GlobalStyles.smallText,
                      { 
                        color: category === cat ? colors.textInverse : colors.textSecondary,
                        fontWeight: category === cat ? '600' : '400'
                      }
                    ]}>
                      {cat}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            {/* Time Selection */}
            <View style={{ marginBottom: 16 }}>
              <Text style={[GlobalStyles.caption, { marginBottom: 6, color: colors.textPrimary }]}>
                Días de la semana (si no eliges, será diario)
              </Text>
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 }}>
                {dayLabels.map((label, idx) => (
                  <TouchableOpacity
                    key={label}
                    style={{
                      width: 36,
                      height: 36,
                      borderRadius: 18,
                      alignItems: 'center',
                      justifyContent: 'center',
                      backgroundColor: daysOfWeek.includes(idx) ? colors.primary : colors.backgroundSecondary,
                      borderWidth: 1,
                      borderColor: daysOfWeek.includes(idx) ? colors.primary : colors.cardBorder,
                    }}
                    onPress={() => {
                      setDaysOfWeek(prev => prev.includes(idx) ? prev.filter(d => d !== idx) : [...prev, idx]);
                    }}
                    disabled={isLoading}
                  >
                    <Text style={{ color: daysOfWeek.includes(idx) ? colors.textInverse : colors.textSecondary, fontWeight: '600' }}>
                      {label}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            {/* Time Selection */}
            <View style={{ marginBottom: 24 }}>
              <Text style={[GlobalStyles.caption, { marginBottom: 6, color: colors.textPrimary }]}>
                Hora del Día *
              </Text>
              <TouchableOpacity
                style={[
                  GlobalStyles.input,
                  { 
                    justifyContent: 'center',
                    backgroundColor: time ? colors.backgroundSecondary : Colors.inputBackground
                  }
                ]}
                onPress={handleTimeSelection}
                disabled={isLoading}
              >
                <Text style={[
                  GlobalStyles.caption,
                  { 
                    color: time ? colors.textPrimary : colors.textTertiary,
                    textAlign: 'center'
                  }
                ]}>
                  {time || 'Seleccionar hora'}
                </Text>
              </TouchableOpacity>
            </View>

            {/* Create Button */}
            <TouchableOpacity
              style={[
                GlobalStyles.buttonPrimary,
                { marginBottom: 12 },
                isLoading && { opacity: 0.7 }
              ]}
              onPress={handleCreateHabit}
              disabled={isLoading}
            >
              <Text style={GlobalStyles.buttonText}>
                {isLoading ? 'Creando...' : 'Crear Hábito'}
              </Text>
            </TouchableOpacity>

            {/* Cancel Button */}
            <TouchableOpacity
              style={[
                GlobalStyles.buttonSecondary,
                { marginBottom: 12 }
              ]}
              onPress={() => navigation.goBack()}
              disabled={isLoading}
            >
              <Text style={GlobalStyles.buttonTextSecondary}>
                Cancelar
              </Text>
            </TouchableOpacity>

            {/* Reset Button - Only in development */}
            {__DEV__ && (
              <TouchableOpacity
                style={[
                  GlobalStyles.buttonSecondary,
                  { 
                    marginBottom: 12,
                  backgroundColor: colors.accent + '20',
                  borderColor: colors.accent
                  }
                ]}
                onPress={() => {
                  logState('Reset button pressed', '');
                  setTitle('');
                  setDescription('');
                  setCategory('');
                  setTime('');
                  setSelectedTime(new Date());
                  setShowTimePicker(false);
                  setDaysOfWeek([]);
                  setDebugInfo('');
                }}
                disabled={isLoading}
              >
              <Text style={[GlobalStyles.buttonTextSecondary, { color: colors.accent }]}>
                  🔄 Reset (Debug)
                </Text>
              </TouchableOpacity>
            )}
          </View>

          {/* Tips */}
          <View style={[GlobalStyles.card, { marginBottom: 20 }]}>
            <Text style={[GlobalStyles.subtitle, { textAlign: 'center', marginBottom: 12 }]}>
              💡 Consejos para crear hábitos exitosos
            </Text>
            <View style={{ gap: 8 }}>
              <View style={GlobalStyles.row}>
                <Text style={[GlobalStyles.caption, { color: Colors.textSecondary }]}>
                  • Comienza con hábitos pequeños y específicos
                </Text>
              </View>
              <View style={GlobalStyles.row}>
                <Text style={[GlobalStyles.caption, { color: Colors.textSecondary }]}>
                  • Elige una hora consistente cada día
                </Text>
              </View>
              <View style={GlobalStyles.row}>
                <Text style={[GlobalStyles.caption, { color: Colors.textSecondary }]}>
                  • Conecta el hábito con una actividad existente
                </Text>
              </View>
              <View style={GlobalStyles.row}>
                <Text style={[GlobalStyles.caption, { color: Colors.textSecondary }]}>
                  • Celebra cada pequeño progreso
                </Text>
              </View>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>

      {/* Debug Info - Only show in development */}
      {__DEV__ && debugInfo && (
        <View style={{
          position: 'absolute',
          bottom: 0,
          left: 0,
          right: 0,
          backgroundColor: 'rgba(0,0,0,0.8)',
          padding: 10,
          maxHeight: 100,
        }}>
          <Text style={{ color: 'white', fontSize: 10 }}>
            Debug: {debugInfo.split('\n').slice(-3).join('\n')}
          </Text>
        </View>
      )}

      {/* Time Picker Modal for iOS */}
      <Modal
        visible={showTimePicker}
        animationType="slide"
        transparent={true}
        onRequestClose={handleTimeCancel}
        presentationStyle="pageSheet"
      >
        <View style={GlobalStyles.modalOverlay}>
          <View style={[GlobalStyles.modalContent, { padding: 20 }]}>
            <View style={{ 
              flexDirection: 'row', 
              justifyContent: 'space-between', 
              alignItems: 'center',
              marginBottom: 20,
              borderBottomWidth: 1,
              borderBottomColor: colors.cardBorder,
              paddingBottom: 15
            }}>
              <Text style={[GlobalStyles.subtitle, { color: colors.textPrimary }]}>
                Seleccionar Hora
              </Text>
              <TouchableOpacity onPress={handleTimeCancel}>
                <Text style={{ color: colors.primary, fontSize: 16, fontWeight: '600' }}>
                  Cancelar
                </Text>
              </TouchableOpacity>
            </View>
            
            <DateTimePicker
              value={selectedTime}
              mode="time"
              is24Hour={true}
              display="spinner"
              onChange={handleTimeConfirm}
              style={{ marginBottom: 20 }}
            />
            
            <TouchableOpacity
              style={[GlobalStyles.buttonPrimary, { marginTop: 10 }]}
              onPress={() => {
                const hours = selectedTime.getHours().toString().padStart(2, '0');
                const minutes = selectedTime.getMinutes().toString().padStart(2, '0');
                const timeString = `${hours}:${minutes}`;
                setTime(timeString);
                setShowTimePicker(false);
              }}
            >
              <Text style={GlobalStyles.buttonText}>Confirmar Hora</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}
