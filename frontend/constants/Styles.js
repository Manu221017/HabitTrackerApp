// Styles.js - Reusable Styles and Theme Configuration
import { StyleSheet, Dimensions } from 'react-native';
import { LightColors } from './Colors'; // fallback para export por defecto

const { width } = Dimensions.get('window');

export const createGlobalStyles = (colors) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  safeArea: {
    flex: 1,
    backgroundColor: colors.background,
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.background,
    paddingHorizontal: 16,
  },
  // Cards
  card: {
    backgroundColor: colors.cardBackground,
    borderRadius: 12,
    padding: 16,
    marginVertical: 6,
    marginHorizontal: 12,
    shadowColor: colors.cardShadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 2,
    borderWidth: 1,
    borderColor: colors.cardBorder,
  },
  cardSmall: {
    backgroundColor: colors.cardBackground,
    borderRadius: 10,
    padding: 12,
    marginVertical: 4,
    marginHorizontal: 8,
    shadowColor: colors.cardShadow,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 1,
    borderWidth: 1,
    borderColor: colors.cardBorder,
  },
  // Text
  title: { fontSize: 24, fontWeight: 'bold', color: colors.textPrimary, marginBottom: 6 },
  subtitle: { fontSize: 18, fontWeight: '600', color: colors.textPrimary, marginBottom: 4 },
  heading: { fontSize: 16, fontWeight: '600', color: colors.textPrimary, marginBottom: 3 },
  bodyText: { fontSize: 14, color: colors.textPrimary, lineHeight: 20 },
  caption: { fontSize: 13, color: colors.textSecondary, lineHeight: 18 },
  smallText: { fontSize: 11, color: colors.textTertiary },
  // Buttons
  buttonPrimary: {
    backgroundColor: colors.buttonPrimary,
    borderRadius: 10,
    paddingVertical: 14,
    paddingHorizontal: 20,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.15,
    shadowRadius: 6,
    elevation: 3,
  },
  buttonSecondary: {
    backgroundColor: colors.buttonSecondary,
    borderRadius: 10,
    paddingVertical: 14,
    paddingHorizontal: 20,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: colors.cardBorder,
  },
  buttonSmall: {
    backgroundColor: colors.buttonPrimary,
    borderRadius: 8,
    paddingVertical: 10,
    paddingHorizontal: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonText: { color: colors.buttonText, fontSize: 15, fontWeight: '600' },
  buttonTextSecondary: { color: colors.buttonTextSecondary, fontSize: 15, fontWeight: '600' },
  // Inputs
  input: {
    backgroundColor: colors.backgroundSecondary,
    borderRadius: 10,
    paddingVertical: 14,
    paddingHorizontal: 14,
    fontSize: 15,
    color: colors.textPrimary,
    borderWidth: 1,
    borderColor: colors.cardBorder,
    marginVertical: 6,
  },
  inputFocused: { borderColor: colors.primary, backgroundColor: colors.background },
  // Layout helpers
  row: { flexDirection: 'row', alignItems: 'center' },
  rowSpaceBetween: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  column: { flexDirection: 'column' },
  // Habits
  habitCard: {
    backgroundColor: colors.cardBackground,
    borderRadius: 12,
    padding: 16,
    marginVertical: 6,
    marginHorizontal: 12,
    shadowColor: colors.cardShadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 2,
    borderLeftWidth: 3,
  },
  habitCardCompleted: { borderLeftColor: colors.habitCompleted },
  habitCardPending: { borderLeftColor: colors.habitPending },
  habitCardMissed: { borderLeftColor: colors.habitMissed },
  // Progress
  progressContainer: { backgroundColor: colors.backgroundSecondary, borderRadius: 10, height: 6, overflow: 'hidden' },
  progressBar: { height: '100%', borderRadius: 10 },
  // Stats
  statsCard: {
    backgroundColor: colors.cardBackground,
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: colors.cardShadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 2,
    borderWidth: 1,
    borderColor: colors.cardBorder,
  },
  // Header
  headerStyle: {
    backgroundColor: colors.headerBackground,
    elevation: 0,
    shadowOpacity: 0,
    borderBottomWidth: 1,
    borderBottomColor: colors.cardBorder,
  },
  headerTitleStyle: { color: colors.headerText, fontSize: 17, fontWeight: '600' },
  // Modal
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0, 0, 0, 0.5)', justifyContent: 'center', alignItems: 'center' },
  modalContent: {
    backgroundColor: colors.cardBackground,
    borderRadius: 12,
    padding: 20,
    marginHorizontal: 20,
    alignItems: 'center',
    shadowColor: colors.cardShadow,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 5,
  },
  modalButton: {
    backgroundColor: colors.buttonPrimary,
    borderRadius: 8,
    paddingVertical: 12,
    paddingHorizontal: 20,
    marginTop: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalButtonText: { color: colors.buttonText, fontSize: 16, fontWeight: '600' },
});

// Compat: export por defecto con colores claros para no romper imports antiguos
const GlobalStyles = createGlobalStyles(LightColors);
export default GlobalStyles;

export const isSmallDevice = width < 375;
export const isMediumDevice = width >= 375 && width < 414;
export const isLargeDevice = width >= 414;
export const spacing = { xs: 3, sm: 6, md: 12, lg: 18, xl: 24, xxl: 36 };
export const borderRadius = { sm: 4, md: 6, lg: 10, xl: 12, xxl: 18 };