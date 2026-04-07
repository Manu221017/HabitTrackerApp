import React from 'react';
import { Alert, Animated } from 'react-native';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import HomeScreen from '../frontend/screens/habits/HomeScreen';
import Toast from 'react-native-toast-message';
import { updateHabitStatus } from '../backend/config/firebase';
import { useAuth } from '../frontend/contexts/AuthContext';
import { useHabits } from '../frontend/contexts/HabitsContext';
import { useTheme, useThemedStyles } from '../frontend/contexts/ThemeContext';

jest.mock('../backend/config/firebase', () => ({
  logOut: jest.fn(),
  updateHabitStatus: jest.fn(),
}));

jest.mock('../frontend/contexts/AuthContext', () => ({
  useAuth: jest.fn(),
}));

jest.mock('../frontend/contexts/HabitsContext', () => ({
  useHabits: jest.fn(),
}));

jest.mock('../frontend/contexts/ThemeContext', () => ({
  useTheme: jest.fn(),
  useThemedStyles: jest.fn(),
}));

jest.mock('react-native-toast-message', () => {
  const ToastMock = () => null;
  ToastMock.show = jest.fn();
  return ToastMock;
});

jest.mock('react-native-confetti-cannon', () => 'ConfettiCannon');
jest.mock('react-native-safe-area-context', () => ({
  SafeAreaView: ({ children }) => children,
}));
jest.mock('../frontend/components/GamificationCard', () => () => null);
jest.mock('../frontend/components/QuickStatsCard', () => () => null);

const mockCompleteHabit = jest.fn();

const mockStyles = {
  safeArea: {},
  container: {},
  card: {},
  title: {},
  subtitle: {},
  caption: {},
  heading: {},
  smallText: {},
  row: { flexDirection: 'row' },
  rowSpaceBetween: { flexDirection: 'row', justifyContent: 'space-between' },
  progressContainer: {},
  progressBar: {},
  buttonText: {},
  buttonPrimary: {},
  buttonSmall: {},
  statsCard: {},
  habitCard: {},
  habitCardCompleted: {},
  habitCardPending: {},
  habitCardMissed: {},
};

beforeAll(() => {
  jest.spyOn(Animated, 'timing').mockImplementation(() => ({
    start: (cb) => cb && cb(),
  }));
  jest.spyOn(Animated, 'spring').mockImplementation(() => ({
    start: (cb) => cb && cb(),
  }));
  jest.spyOn(Animated, 'parallel').mockImplementation(() => ({
    start: (cb) => cb && cb(),
  }));
  jest.spyOn(Animated, 'sequence').mockImplementation(() => ({
    start: (cb) => cb && cb(),
  }));
});

afterAll(() => {
  jest.restoreAllMocks();
});

beforeEach(() => {
  jest.clearAllMocks();
  useAuth.mockReturnValue({
    user: { uid: 'user-1', displayName: 'Karen', email: 'karen@test.com' },
  });
  useTheme.mockReturnValue({
    colors: {
      primary: '#111',
      textPrimary: '#111',
      textSecondary: '#666',
      textInverse: '#fff',
      backgroundSecondary: '#eee',
      habitCompleted: '#0a0',
      habitPending: '#fa0',
      habitMissed: '#f00',
      cardBorder: '#ddd',
      cardBackground: '#fff',
      success: '#0a0',
    },
    isDarkMode: false,
    toggleTheme: jest.fn(),
  });
  useThemedStyles.mockReturnValue(mockStyles);
  useHabits.mockReturnValue({
    habits: [
      {
        id: 'habit-1',
        title: 'Leer',
        description: '10 min',
        category: 'Salud',
        time: '08:00',
        status: 'pending',
        streak: 2,
        reminderEnabled: true,
      },
    ],
    todaysHabits: [
      {
        id: 'habit-1',
        title: 'Leer',
        description: '10 min',
        category: 'Salud',
        time: '08:00',
        status: 'pending',
        streak: 2,
      },
    ],
    loading: false,
    error: null,
    setError: jest.fn(),
    getProgressPercentage: () => 0,
    getTotalStreak: () => 2,
    getBestStreak: () => 2,
    completeHabit: mockCompleteHabit,
  });
});

describe('HomeScreen critical completion flow', () => {
  it('al marcar hábito pendiente como completado llama update, gamificación y toast', async () => {
    updateHabitStatus.mockResolvedValue({ success: true });
    mockCompleteHabit.mockResolvedValue({ success: true, points: 10 });
    const navigation = { navigate: jest.fn() };

    const { getByLabelText } = render(<HomeScreen navigation={navigation} />);

    fireEvent.press(getByLabelText('Marcar como completado: Leer'));

    await waitFor(() => {
      expect(updateHabitStatus).toHaveBeenCalledWith('habit-1', 'completed');
    });
    expect(mockCompleteHabit).toHaveBeenCalledWith('habit-1');
    expect(Toast.show).toHaveBeenCalledWith(
      expect.objectContaining({
        type: 'success',
        text1: '¡Hábito completado!',
      })
    );
  });

  it('si updateHabitStatus falla muestra alert y no ejecuta gamificación', async () => {
    updateHabitStatus.mockResolvedValue({ success: false, error: 'fallo db' });
    const alertSpy = jest.spyOn(Alert, 'alert').mockImplementation(() => {});
    const navigation = { navigate: jest.fn() };

    const { getByLabelText } = render(<HomeScreen navigation={navigation} />);
    fireEvent.press(getByLabelText('Marcar como completado: Leer'));

    await waitFor(() => {
      expect(alertSpy).toHaveBeenCalledWith('Error', 'fallo db');
    });
    expect(mockCompleteHabit).not.toHaveBeenCalled();
    expect(Toast.show).not.toHaveBeenCalled();
  });

  it('el botón "Hecho" de recordatorios completa hábito y gamificación', async () => {
    updateHabitStatus.mockResolvedValue({ success: true });
    mockCompleteHabit.mockResolvedValue({ success: true });
    const navigation = { navigate: jest.fn() };

    const { getByText } = render(<HomeScreen navigation={navigation} />);
    fireEvent.press(getByText('Hecho'));

    await waitFor(() => {
      expect(updateHabitStatus).toHaveBeenCalledWith('habit-1', 'completed');
    });
    expect(mockCompleteHabit).toHaveBeenCalledWith('habit-1');
    expect(Toast.show).toHaveBeenCalled();
  });
});
