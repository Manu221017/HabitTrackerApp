// Styles.js - Reusable Styles and Theme Configuration
import { StyleSheet, Dimensions } from 'react-native';
import Colors from './Colors';

const { width, height } = Dimensions.get('window');

export const GlobalStyles = StyleSheet.create({
  // Container Styles
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  
  safeArea: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: Colors.background,
  },
  
  // Card Styles
  card: {
    backgroundColor: Colors.cardBackground,
    borderRadius: 16,
    padding: 20,
    marginVertical: 8,
    marginHorizontal: 16,
    shadowColor: Colors.cardShadow,
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
    borderWidth: 1,
    borderColor: Colors.cardBorder,
  },
  
  cardSmall: {
    backgroundColor: Colors.cardBackground,
    borderRadius: 12,
    padding: 16,
    marginVertical: 6,
    marginHorizontal: 12,
    shadowColor: Colors.cardShadow,
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
    borderWidth: 1,
    borderColor: Colors.cardBorder,
  },
  
  // Text Styles
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: Colors.textPrimary,
    marginBottom: 8,
  },
  
  subtitle: {
    fontSize: 20,
    fontWeight: '600',
    color: Colors.textPrimary,
    marginBottom: 6,
  },
  
  heading: {
    fontSize: 18,
    fontWeight: '600',
    color: Colors.textPrimary,
    marginBottom: 4,
  },
  
  bodyText: {
    fontSize: 16,
    color: Colors.textPrimary,
    lineHeight: 24,
  },
  
  caption: {
    fontSize: 14,
    color: Colors.textSecondary,
    lineHeight: 20,
  },
  
  smallText: {
    fontSize: 12,
    color: Colors.textTertiary,
  },
  
  // Button Styles
  buttonPrimary: {
    backgroundColor: Colors.buttonPrimary,
    borderRadius: 12,
    paddingVertical: 16,
    paddingHorizontal: 24,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: Colors.primary,
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
  
  buttonSecondary: {
    backgroundColor: Colors.buttonSecondary,
    borderRadius: 12,
    paddingVertical: 16,
    paddingHorizontal: 24,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: Colors.cardBorder,
  },
  
  buttonSmall: {
    backgroundColor: Colors.buttonPrimary,
    borderRadius: 8,
    paddingVertical: 12,
    paddingHorizontal: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  
  buttonText: {
    color: Colors.buttonText,
    fontSize: 16,
    fontWeight: '600',
  },
  
  buttonTextSecondary: {
    color: Colors.buttonTextSecondary,
    fontSize: 16,
    fontWeight: '600',
  },
  
  // Input Styles
  input: {
    backgroundColor: Colors.backgroundSecondary,
    borderRadius: 12,
    paddingVertical: 16,
    paddingHorizontal: 16,
    fontSize: 16,
    color: Colors.textPrimary,
    borderWidth: 1,
    borderColor: Colors.cardBorder,
    marginVertical: 8,
  },
  
  inputFocused: {
    borderColor: Colors.primary,
    backgroundColor: Colors.background,
  },
  
  // Row and Column Layouts
  row: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  
  rowSpaceBetween: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  
  column: {
    flexDirection: 'column',
  },
  
  // Spacing
  marginVertical: {
    marginVertical: 16,
  },
  
  marginHorizontal: {
    marginHorizontal: 16,
  },
  
  padding: {
    padding: 16,
  },
  
  paddingVertical: {
    paddingVertical: 16,
  },
  
  paddingHorizontal: {
    paddingHorizontal: 16,
  },
  
  // Habit-specific styles
  habitCard: {
    backgroundColor: Colors.cardBackground,
    borderRadius: 16,
    padding: 20,
    marginVertical: 8,
    marginHorizontal: 16,
    shadowColor: Colors.cardShadow,
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
    borderLeftWidth: 4,
  },
  
  habitCardCompleted: {
    borderLeftColor: Colors.habitCompleted,
  },
  
  habitCardPending: {
    borderLeftColor: Colors.habitPending,
  },
  
  habitCardMissed: {
    borderLeftColor: Colors.habitMissed,
  },
  
  // Progress and Stats
  progressContainer: {
    backgroundColor: Colors.backgroundSecondary,
    borderRadius: 12,
    height: 8,
    overflow: 'hidden',
  },
  
  progressBar: {
    height: '100%',
    borderRadius: 12,
  },
  
  statsCard: {
    backgroundColor: Colors.cardBackground,
    borderRadius: 16,
    padding: 20,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: Colors.cardShadow,
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
    borderWidth: 1,
    borderColor: Colors.cardBorder,
  },
  
  // Navigation styles
  headerStyle: {
    backgroundColor: Colors.headerBackground,
    elevation: 0,
    shadowOpacity: 0,
    borderBottomWidth: 1,
    borderBottomColor: Colors.cardBorder,
  },
  
  headerTitleStyle: {
    color: Colors.headerText,
    fontSize: 18,
    fontWeight: '600',
  },
});

// Responsive design helpers
export const isSmallDevice = width < 375;
export const isMediumDevice = width >= 375 && width < 414;
export const isLargeDevice = width >= 414;

// Spacing scale
export const spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
};

// Border radius scale
export const borderRadius = {
  sm: 4,
  md: 8,
  lg: 12,
  xl: 16,
  xxl: 24,
};

export default GlobalStyles; 