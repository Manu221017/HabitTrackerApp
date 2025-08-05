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
    paddingHorizontal: 16,
  },
  
  // Card Styles
  card: {
    backgroundColor: Colors.cardBackground,
    borderRadius: 12,
    padding: 16,
    marginVertical: 6,
    marginHorizontal: 12,
    shadowColor: Colors.cardShadow,
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 2,
    borderWidth: 1,
    borderColor: Colors.cardBorder,
  },
  
  cardSmall: {
    backgroundColor: Colors.cardBackground,
    borderRadius: 10,
    padding: 12,
    marginVertical: 4,
    marginHorizontal: 8,
    shadowColor: Colors.cardShadow,
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 1,
    borderWidth: 1,
    borderColor: Colors.cardBorder,
  },
  
  // Text Styles - Adjusted for better fit
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: Colors.textPrimary,
    marginBottom: 6,
  },
  
  subtitle: {
    fontSize: 18,
    fontWeight: '600',
    color: Colors.textPrimary,
    marginBottom: 4,
  },
  
  heading: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.textPrimary,
    marginBottom: 3,
  },
  
  bodyText: {
    fontSize: 14,
    color: Colors.textPrimary,
    lineHeight: 20,
  },
  
  caption: {
    fontSize: 13,
    color: Colors.textSecondary,
    lineHeight: 18,
  },
  
  smallText: {
    fontSize: 11,
    color: Colors.textTertiary,
  },
  
  // Button Styles
  buttonPrimary: {
    backgroundColor: Colors.buttonPrimary,
    borderRadius: 10,
    paddingVertical: 14,
    paddingHorizontal: 20,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: Colors.primary,
    shadowOffset: {
      width: 0,
      height: 3,
    },
    shadowOpacity: 0.15,
    shadowRadius: 6,
    elevation: 3,
  },
  
  buttonSecondary: {
    backgroundColor: Colors.buttonSecondary,
    borderRadius: 10,
    paddingVertical: 14,
    paddingHorizontal: 20,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: Colors.cardBorder,
  },
  
  buttonSmall: {
    backgroundColor: Colors.buttonPrimary,
    borderRadius: 8,
    paddingVertical: 10,
    paddingHorizontal: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  
  buttonText: {
    color: Colors.buttonText,
    fontSize: 15,
    fontWeight: '600',
  },
  
  buttonTextSecondary: {
    color: Colors.buttonTextSecondary,
    fontSize: 15,
    fontWeight: '600',
  },
  
  // Input Styles
  input: {
    backgroundColor: Colors.backgroundSecondary,
    borderRadius: 10,
    paddingVertical: 14,
    paddingHorizontal: 14,
    fontSize: 15,
    color: Colors.textPrimary,
    borderWidth: 1,
    borderColor: Colors.cardBorder,
    marginVertical: 6,
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
  
  // Spacing - Reduced for better fit
  marginVertical: {
    marginVertical: 12,
  },
  
  marginHorizontal: {
    marginHorizontal: 12,
  },
  
  padding: {
    padding: 12,
  },
  
  paddingVertical: {
    paddingVertical: 12,
  },
  
  paddingHorizontal: {
    paddingHorizontal: 12,
  },
  
  // Habit-specific styles - Adjusted for better fit
  habitCard: {
    backgroundColor: Colors.cardBackground,
    borderRadius: 12,
    padding: 16,
    marginVertical: 6,
    marginHorizontal: 12,
    shadowColor: Colors.cardShadow,
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 2,
    borderLeftWidth: 3,
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
  
  // Progress and Stats - Adjusted sizes
  progressContainer: {
    backgroundColor: Colors.backgroundSecondary,
    borderRadius: 10,
    height: 6,
    overflow: 'hidden',
  },
  
  progressBar: {
    height: '100%',
    borderRadius: 10,
  },
  
  statsCard: {
    backgroundColor: Colors.cardBackground,
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: Colors.cardShadow,
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 2,
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
    fontSize: 17,
    fontWeight: '600',
  },
});

// Responsive design helpers
export const isSmallDevice = width < 375;
export const isMediumDevice = width >= 375 && width < 414;
export const isLargeDevice = width >= 414;

// Spacing scale - Adjusted for better fit
export const spacing = {
  xs: 3,
  sm: 6,
  md: 12,
  lg: 18,
  xl: 24,
  xxl: 36,
};

// Border radius scale
export const borderRadius = {
  sm: 4,
  md: 6,
  lg: 10,
  xl: 12,
  xxl: 18,
};

export default GlobalStyles; 