// Colors.js - Beautiful Color Palette for Habit Tracker App

export const Colors = {
  // Primary Colors - Motivational & Energetic
  primary: '#6366F1',        // Indigo - Main brand color
  primaryLight: '#818CF8',   // Lighter indigo
  primaryDark: '#4F46E5',    // Darker indigo
  
  // Secondary Colors - Success & Growth
  secondary: '#10B981',      // Emerald green - Success color
  secondaryLight: '#34D399', // Light emerald
  secondaryDark: '#059669',  // Dark emerald
  
  // Accent Colors - Warm & Inviting
  accent: '#F59E0B',         // Amber - Warning/attention
  accentLight: '#FBBF24',    // Light amber
  accentDark: '#D97706',     // Dark amber
  
  // Background Colors - Clean & Modern
  background: '#FFFFFF',     // Pure white
  backgroundSecondary: '#F8FAFC', // Light gray background
  backgroundTertiary: '#F1F5F9',  // Slightly darker gray
  
  // Text Colors - Readable & Professional
  textPrimary: '#1E293B',    // Dark slate - Main text
  textSecondary: '#64748B',  // Medium slate - Secondary text
  textTertiary: '#94A3B8',   // Light slate - Placeholder text
  textInverse: '#FFFFFF',    // White text on dark backgrounds
  
  // Status Colors - Clear Communication
  success: '#10B981',        // Green - Completed habits
  warning: '#F59E0B',        // Amber - Streak warnings
  error: '#EF4444',          // Red - Errors/missed habits
  info: '#3B82F6',           // Blue - Information
  
  // Gradient Colors - Beautiful Combinations
  gradientPrimary: ['#6366F1', '#8B5CF6'],     // Indigo to Purple
  gradientSuccess: ['#10B981', '#34D399'],     // Green gradient
  gradientMotivation: ['#F59E0B', '#F97316'],  // Orange gradient
  
  // Card & Component Colors
  cardBackground: '#FFFFFF',
  cardBorder: '#E2E8F0',
  cardShadow: '#00000010',
  
  // Interactive Colors
  buttonPrimary: '#6366F1',
  buttonSecondary: '#F1F5F9',
  buttonText: '#FFFFFF',
  buttonTextSecondary: '#1E293B',
  
  // Habit Status Colors
  habitCompleted: '#10B981',
  habitPending: '#F59E0B',
  habitMissed: '#EF4444',
  habitStreak: '#8B5CF6',
  
  // Calendar & Progress Colors
  calendarToday: '#6366F1',
  calendarSelected: '#818CF8',
  calendarCompleted: '#10B981',
  calendarMissed: '#EF4444',
  
  // Navigation Colors
  tabActive: '#6366F1',
  tabInactive: '#94A3B8',
  headerBackground: '#FFFFFF',
  headerText: '#1E293B',
};

// Color utility functions
export const getHabitStatusColor = (status) => {
  switch (status) {
    case 'completed':
      return Colors.habitCompleted;
    case 'pending':
      return Colors.habitPending;
    case 'missed':
      return Colors.habitMissed;
    case 'streak':
      return Colors.habitStreak;
    default:
      return Colors.textSecondary;
  }
};

export const getStreakColor = (streak) => {
  if (streak >= 7) return Colors.habitStreak;
  if (streak >= 3) return Colors.habitCompleted;
  return Colors.habitPending;
};

export default Colors; 