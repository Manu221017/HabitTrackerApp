# 🎯 HabitTracker - App de Seguimiento de Hábitos

Una aplicación móvil moderna y completa para crear, gestionar y hacer seguimiento de hábitos personales, construida con React Native, Expo y Firebase.

## ✨ Características Principales

### 🔐 **Autenticación Completa**
- ✅ Registro de usuarios con email y contraseña
- ✅ Inicio de sesión seguro
- ✅ Persistencia de sesión con AsyncStorage
- ✅ Cerrar sesión con confirmación
- ✅ Validación de formularios en tiempo real

### 📱 **Gestión de Hábitos**
- ✅ Crear hábitos con título, descripción, categoría y hora
- ✅ Marcar/desmarcar hábitos como completados
- ✅ Seguimiento de rachas (streaks) automático
- ✅ Estadísticas en tiempo real
- ✅ Categorización de hábitos
- ✅ Soft delete (no se eliminan permanentemente)

### 🎨 **Diseño Moderno**
- ✅ Paleta de colores atractiva y profesional
- ✅ Interfaz intuitiva y fácil de usar
- ✅ Diseño responsive para diferentes tamaños de pantalla
- ✅ Estados de carga y error bien definidos
- ✅ Animaciones y transiciones suaves

### 🔄 **Sincronización en Tiempo Real**
- ✅ Datos sincronizados con Firebase Firestore
- ✅ Actualizaciones automáticas sin recargar
- ✅ Funciona offline con sincronización automática
- ✅ Context API para gestión de estado global

## 🛠️ Tecnologías Utilizadas

- **Frontend**: React Native + Expo
- **Backend**: Firebase (Authentication + Firestore)
- **Navegación**: React Navigation v7
- **Estado**: React Context API
- **Almacenamiento**: AsyncStorage
- **Estilos**: StyleSheet nativo con sistema de diseño

## 📋 Estructura del Proyecto

```
HabitTrackerApp/
├── App.js                   # Reexporta la app desde frontend/
├── app.json                 # Config estática de Expo
├── app.config.js            # Config Expo + extra (Firebase desde .env)
├── .env.example             # Plantilla de variables EXPO_PUBLIC_FIREBASE_*
├── frontend/
│   ├── App.js               # Navegación y providers
│   ├── components/
│   ├── constants/
│   ├── contexts/            # Auth, hábitos, tema
│   └── screens/             # auth, hábitos, stats, etc.
├── backend/
│   ├── config/
│   │   └── firebase.js      # Firebase Auth + Firestore (lee .env / app.config extra)
│   └── services/            # Notificaciones, gamificación, etc.
├── __tests__/               # Pruebas Jest
└── README.md
```

## 🚀 Instalación y Configuración

### 1. Prerrequisitos
- Node.js (v16 o superior)
- npm o yarn
- Expo CLI
- Cuenta de Firebase

### 2. Clonar e Instalar
```bash
git clone <repository-url>
cd HabitTrackerApp
npm install
```

### 3. Configurar Firebase
1. Crea un proyecto en [Firebase Console](https://console.firebase.google.com/)
2. Habilita Authentication (Email/Password)
3. Crea una base de datos Firestore
4. Copia las credenciales a `config/firebase.js`

### 4. Configurar Firestore
Sigue las instrucciones en `FIRESTORE_SETUP.md` para:
- Habilitar Firestore Database
- Configurar reglas de seguridad
- Crear índices optimizados

### 5. Calidad de código (opcional)
```bash
npm run lint    # ESLint (config Expo)
npm test        # Jest
```

### 6. Ejecutar la App
```bash
npx expo start --tunnel
```

## 🔧 Configuración de Firebase

### Authentication
- Método: Email/Password
- Persistencia: AsyncStorage
- Validación: Cliente y servidor

### Firestore
- Colección: `habits`
- Reglas de seguridad implementadas
- Índices optimizados para consultas

### Estructura de Datos
```javascript
habits: {
  title: string,
  description: string,
  category: string,
  time: string,
  status: 'pending' | 'completed' | 'missed',
  streak: number,
  totalCompletions: number,
  lastCompleted: timestamp,
  userId: string,
  isActive: boolean,
  createdAt: timestamp,
  updatedAt: timestamp
}
```

## 🎨 Sistema de Diseño

### Paleta de Colores
- **Primary**: #6366F1 (Indigo)
- **Secondary**: #8B5CF6 (Purple)
- **Success**: #10B981 (Emerald)
- **Warning**: #F59E0B (Amber)
- **Error**: #EF4444 (Red)
- **Background**: #F8FAFC (Slate 50)
- **Text**: #1E293B (Slate 800)

### Tipografía
- **Títulos**: 24px, Bold
- **Subtítulos**: 18px, Semibold
- **Cuerpo**: 16px, Regular
- **Caption**: 14px, Regular
- **Small**: 12px, Regular

## 🔒 Seguridad

### Reglas de Firestore
```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /habits/{habitId} {
      allow read, write: if request.auth != null && request.auth.uid == resource.data.userId;
      allow create: if request.auth != null && request.auth.uid == request.resource.data.userId;
    }
  }
}
```

### Protecciones Implementadas
- ✅ Autenticación requerida para todas las operaciones
- ✅ Aislamiento de datos por usuario
- ✅ Validación de datos en cliente y servidor
- ✅ Sanitización de inputs
- ✅ Manejo seguro de errores

## 📊 Funcionalidades

### Gestión de Hábitos
- **Crear**: Formulario completo con validación
- **Leer**: Lista en tiempo real con sincronización
- **Actualizar**: Toggle de estado con persistencia
- **Eliminar**: Soft delete (marca como inactivo)

### Estadísticas
- Progreso diario en porcentaje
- Total de rachas acumuladas
- Mejor racha personal
- Contador de hábitos completados

### UX/UI
- Estados de carga con spinners
- Mensajes de error descriptivos
- Confirmaciones para acciones importantes
- Pull-to-refresh para actualizar datos
- Navegación intuitiva

## 🚀 Mejoras Implementadas

### ✅ **Completadas**
1. **Integración completa con Firebase**
   - Authentication con persistencia
   - Firestore para almacenamiento
   - Reglas de seguridad

2. **Funcionalidad de hábitos real**
   - CRUD completo
   - Sincronización en tiempo real
   - Gestión de rachas

3. **Mejoras de UX**
   - Estados de carga
   - Manejo de errores
   - Validaciones robustas
   - Navegación fluida

4. **Optimizaciones**
   - Context API para estado global
   - Sincronización automática
   - Código modular y reutilizable

### 🔄 **En Desarrollo**
- Notificaciones push
- Estadísticas avanzadas
- Temas personalizables
- Exportación de datos

### 📋 **Futuras Mejoras**
- Recordatorios programados
- Metas y objetivos
- Social features
- Gamificación avanzada

## 🐛 Solución de Problemas

### Error de Navegación
Si ves el error "NAVIGATE not handled":
- Verifica que las pantallas estén registradas en App.js
- Asegúrate de que el usuario esté autenticado correctamente

### Problemas de Firebase
- Verifica las credenciales en `config/firebase.js`
- Asegúrate de que Firestore esté habilitado
- Revisa las reglas de seguridad

### Problemas de Red / Tunnel

Si tienes problemas con el tunnel de ngrok ("ngrok tunnel took too long to connect"):

#### Soluciones Rápidas:
1. **Usar script con reintentos**:
   ```powershell
   npm run start:tunnel
   ```
   O usar el script de PowerShell:
   ```powershell
   .\start-tunnel.ps1
   ```

2. **Limpiar caché antes de iniciar**:
   ```powershell
   npm run start:tunnel
   ```
   (Este comando incluye `--clear` automáticamente)

3. **Configurar token de ngrok** (Recomendado):
   - Crea una cuenta gratuita en [ngrok.com](https://ngrok.com/)
   - Obtén tu token de autenticación
   - Ejecuta: `ngrok authtoken TU_TOKEN`
   - Luego usa: `npm run start:tunnel`

4. **Verificar red y firewall**:
   - Asegúrate de tener conexión estable a internet
   - Verifica que tu firewall/antivirus no bloquee ngrok
   - Si usas VPN, prueba desactivarla temporalmente

5. **Actualizar dependencias**:
   ```powershell
   npm install @expo/ngrok@latest --save
   ```

#### Comandos Disponibles:
- `npm run start:tunnel` - Inicia con tunnel y limpia caché
- `npm run start:tunnel:retry` - Inicia con tunnel sin limpiar caché
- `.\start-tunnel.ps1` - Script de PowerShell con reintentos automáticos

## 📱 Compatibilidad

- **iOS**: 12.0+
- **Android**: 8.0+
- **Expo SDK**: ~54
- **React Native**: 0.81.x

## 🤝 Contribución

1. Fork el proyecto
2. Crea una rama para tu feature
3. Commit tus cambios
4. Push a la rama
5. Abre un Pull Request

## 📄 Licencia

Este proyecto está bajo la Licencia MIT. Ver `LICENSE` para más detalles.

## 📞 Soporte

Si tienes problemas o preguntas:
1. Revisa la documentación
2. Busca en los issues existentes
3. Crea un nuevo issue con detalles

---

**¡Gracias por usar HabitTracker! 🎯✨**

*Construido con ❤️ usando React Native y Firebase* 