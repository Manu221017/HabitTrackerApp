const mockAuth = { currentUser: null };

const mockInitializeApp = jest.fn(() => ({ app: 'mock-app' }));
const mockInitializeAuth = jest.fn(() => mockAuth);
const mockGetReactNativePersistence = jest.fn(() => ({}));
const mockServerTimestamp = jest.fn(() => 'mock-server-timestamp');
const mockDoc = jest.fn((...args) => ({ __ref: args }));
const mockGetDoc = jest.fn();
const mockUpdateDoc = jest.fn();
const mockSetDoc = jest.fn();

jest.mock('expo-constants', () => ({
  expoConfig: {
    extra: {
      firebase: {
        apiKey: 'x',
        authDomain: 'x',
        projectId: 'x',
        storageBucket: 'x',
        messagingSenderId: 'x',
        appId: 'x',
      },
    },
  },
}));

jest.mock('firebase/app', () => ({
  initializeApp: (...args) => mockInitializeApp(...args),
}));

jest.mock('firebase/auth', () => ({
  initializeAuth: (...args) => mockInitializeAuth(...args),
  getReactNativePersistence: (...args) => mockGetReactNativePersistence(...args),
  createUserWithEmailAndPassword: jest.fn(),
  signInWithEmailAndPassword: jest.fn(),
  signOut: jest.fn(),
  onAuthStateChanged: jest.fn(),
  updateProfile: jest.fn(),
}));

jest.mock('firebase/firestore', () => ({
  getFirestore: jest.fn(() => ({ db: 'mock-db' })),
  collection: jest.fn(),
  addDoc: jest.fn(),
  updateDoc: (...args) => mockUpdateDoc(...args),
  doc: (...args) => mockDoc(...args),
  query: jest.fn(),
  where: jest.fn(),
  getDocs: jest.fn(),
  getDoc: (...args) => mockGetDoc(...args),
  orderBy: jest.fn(),
  serverTimestamp: (...args) => mockServerTimestamp(...args),
  setDoc: (...args) => mockSetDoc(...args),
}));

jest.mock('@react-native-async-storage/async-storage', () =>
  require('@react-native-async-storage/async-storage/jest/async-storage-mock')
);

const { updateHabitStatus } = require('../backend/config/firebase');

describe('firebase flow: updateHabitStatus', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockAuth.currentUser = null;
    mockSetDoc.mockResolvedValue(undefined);
    mockUpdateDoc.mockResolvedValue(undefined);
  });

  it('devuelve error si no hay usuario autenticado', async () => {
    const result = await updateHabitStatus('habit-1', 'completed');

    expect(result).toEqual({ success: false, error: 'Usuario no autenticado' });
    expect(mockGetDoc).not.toHaveBeenCalled();
    expect(mockUpdateDoc).not.toHaveBeenCalled();
  });

  it('devuelve error si el hábito no existe', async () => {
    mockAuth.currentUser = { uid: 'user-1' };
    mockGetDoc.mockResolvedValue({
      exists: () => false,
      data: () => ({}),
    });

    const result = await updateHabitStatus('habit-1', 'completed');

    expect(result).toEqual({ success: false, error: 'Hábito no encontrado' });
    expect(mockUpdateDoc).not.toHaveBeenCalled();
  });

  it('devuelve error si el hábito pertenece a otro usuario', async () => {
    mockAuth.currentUser = { uid: 'user-1' };
    mockGetDoc.mockResolvedValue({
      exists: () => true,
      data: () => ({ userId: 'other-user', streak: 2, totalCompletions: 5 }),
    });

    const result = await updateHabitStatus('habit-1', 'completed');

    expect(result).toEqual({
      success: false,
      error: 'No tienes permiso para modificar este hábito',
    });
    expect(mockUpdateDoc).not.toHaveBeenCalled();
  });

  it('completa hábito, incrementa racha y crea log diario', async () => {
    mockAuth.currentUser = { uid: 'user-1' };
    mockGetDoc.mockResolvedValue({
      exists: () => true,
      data: () => ({
        userId: 'user-1',
        streak: 2,
        totalCompletions: 5,
        status: 'pending',
      }),
    });
    const fixedDate = new Date('2026-03-25T09:30:00.000Z');

    const result = await updateHabitStatus('habit-1', 'completed', fixedDate);

    expect(result.success).toBe(true);
    expect(result.habit.streak).toBe(3);
    expect(result.habit.totalCompletions).toBe(6);
    expect(result.habit.lastCompleted).toEqual(fixedDate);

    expect(mockUpdateDoc).toHaveBeenCalledWith(
      expect.any(Object),
      expect.objectContaining({
        status: 'completed',
        streak: 3,
        totalCompletions: 6,
        lastCompleted: fixedDate,
        updatedAt: 'mock-server-timestamp',
      })
    );

    expect(mockSetDoc).toHaveBeenCalledWith(
      expect.any(Object),
      expect.objectContaining({
        userId: 'user-1',
        habitId: 'habit-1',
        status: 'completed',
        dateKey: '2026-03-25',
        monthKey: '2026-03',
      }),
      { merge: true }
    );
  });

  it('cuando status es missed reinicia racha sin incrementar completados', async () => {
    mockAuth.currentUser = { uid: 'user-1' };
    mockGetDoc.mockResolvedValue({
      exists: () => true,
      data: () => ({
        userId: 'user-1',
        streak: 7,
        totalCompletions: 12,
      }),
    });

    const result = await updateHabitStatus('habit-1', 'missed');

    expect(result.success).toBe(true);
    expect(result.habit.streak).toBe(0);
    expect(result.habit.totalCompletions).toBe(12);
    expect(result.habit.lastCompleted).toBeNull();
  });

  it('si falla el guardado del log diario, mantiene éxito de actualización', async () => {
    mockAuth.currentUser = { uid: 'user-1' };
    mockGetDoc.mockResolvedValue({
      exists: () => true,
      data: () => ({
        userId: 'user-1',
        streak: 1,
        totalCompletions: 1,
      }),
    });
    mockSetDoc.mockRejectedValueOnce(new Error('log write failed'));

    const result = await updateHabitStatus('habit-1', 'completed');

    expect(result.success).toBe(true);
    expect(mockUpdateDoc).toHaveBeenCalledTimes(1);
    expect(mockSetDoc).toHaveBeenCalledTimes(1);
  });
});
