# 🔥 Configuración de Firebase para HabitTracker

## 📋 Pasos para Configurar Firebase

### 1. Crear Proyecto en Firebase Console

1. Ve a [Firebase Console](https://console.firebase.google.com/)
2. Haz clic en "Crear un proyecto"
3. Ingresa el nombre del proyecto: `HabitTracker`
4. Habilita Google Analytics (opcional)
5. Haz clic en "Crear proyecto"

### 2. Habilitar Authentication

1. En el panel de Firebase, ve a "Authentication"
2. Haz clic en "Comenzar"
3. En la pestaña "Sign-in method", habilita "Email/Password"
4. Haz clic en "Guardar"

### 3. Obtener Configuración del Proyecto

1. En el panel de Firebase, haz clic en el ícono de configuración (⚙️)
2. Selecciona "Configuración del proyecto"
3. En la sección "Tus apps", haz clic en el ícono de web (</>)
4. Registra la app con el nombre "HabitTracker Web"
5. Copia la configuración que aparece

### 4. Actualizar Configuración en el Código

1. Abre el archivo `config/firebase.js`
2. Reemplaza la configuración con tus valores reales:

```javascript
const firebaseConfig = {
  apiKey: "tu-api-key-real",
  authDomain: "tu-project-id.firebaseapp.com",
  projectId: "tu-project-id",
  storageBucket: "tu-project-id.appspot.com",
  messagingSenderId: "tu-messaging-sender-id",
  appId: "tu-app-id"
};
```

### 5. Configurar Reglas de Firestore (Opcional)

Si planeas usar Firestore para almacenar hábitos:

1. Ve a "Firestore Database" en Firebase Console
2. Haz clic en "Crear base de datos"
3. Selecciona "Comenzar en modo de prueba"
4. Elige una ubicación cercana
5. Las reglas básicas serán suficientes para desarrollo

## 🚀 Funcionalidades Implementadas

### ✅ Autenticación
- Registro de usuarios con email y contraseña
- Inicio de sesión
- Cierre de sesión
- Validación de formularios
- Manejo de errores en español

### ✅ Navegación Protegida
- Rutas protegidas basadas en autenticación
- Redirección automática después del login/logout
- Estado de carga durante la autenticación

### ✅ Contexto de Autenticación
- Estado global del usuario
- Listener de cambios de autenticación
- Acceso al usuario actual en toda la app

## 🔧 Estructura de Archivos

```
HabitTrackerApp/
├── config/
│   └── firebase.js          # Configuración de Firebase
├── contexts/
│   └── AuthContext.js       # Contexto de autenticación
├── screens/
│   ├── LoginScreen.jsx      # Pantalla de login
│   ├── RegisterScreen.jsx   # Pantalla de registro
│   └── HomeScreen.jsx       # Pantalla principal (con logout)
└── App.js                   # App principal con AuthProvider
```

## 🧪 Probar la Autenticación

1. Ejecuta la app: `npx expo start --tunnel`
2. Escanea el código QR
3. Prueba crear una cuenta nueva
4. Prueba iniciar sesión
5. Prueba cerrar sesión
6. Verifica que la navegación funcione correctamente

## 🔒 Seguridad

- Las contraseñas se validan en el cliente (mínimo 6 caracteres)
- Los emails se validan con formato básico
- Los errores de Firebase se traducen al español
- El estado de autenticación se mantiene entre sesiones

## 📱 Próximos Pasos

- [ ] Almacenar hábitos en Firestore
- [ ] Sincronización en tiempo real
- [ ] Notificaciones push
- [ ] Backup y restauración de datos
- [ ] Autenticación con Google/Facebook

## 🆘 Solución de Problemas

### Error: "Firebase App named '[DEFAULT]' already exists"
- Asegúrate de que solo hay una inicialización de Firebase en tu app

### Error: "auth/network-request-failed"
- Verifica tu conexión a internet
- Asegúrate de que Firebase esté configurado correctamente

### Error: "auth/invalid-api-key"
- Verifica que la API key en `firebase.js` sea correcta
- Asegúrate de que el proyecto esté activo en Firebase Console

## 📞 Soporte

Si tienes problemas con la configuración:
1. Verifica que todos los valores de configuración sean correctos
2. Asegúrate de que Authentication esté habilitado
3. Revisa la consola de Firebase para errores
4. Verifica que el proyecto esté en la región correcta 