# 🔥 Configuración de Firestore para HabitTracker

## 📋 Pasos para Configurar Firestore

### 1. Habilitar Firestore Database

1. Ve a [Firebase Console](https://console.firebase.google.com/)
2. Selecciona tu proyecto `habittrackerapp-5a791`
3. En el menú lateral, ve a "Firestore Database"
4. Haz clic en "Crear base de datos"
5. Selecciona "Comenzar en modo de prueba"
6. Elige una ubicación cercana (recomendado: `us-central1` o `europe-west1`)
7. Haz clic en "Siguiente" y luego "Habilitar"

### 2. Configurar Reglas de Seguridad

Una vez creada la base de datos, ve a la pestaña "Reglas" y reemplaza las reglas existentes con:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Reglas para la colección de hábitos
    match /habits/{habitId} {
      allow read, write: if request.auth != null && request.auth.uid == resource.data.userId;
      allow create: if request.auth != null && request.auth.uid == request.resource.data.userId;
    }
    
    // Reglas para usuarios (si decides almacenar perfiles)
    match /users/{userId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
  }
}
```

### 3. Estructura de Datos

La base de datos tendrá la siguiente estructura:

```
habits/
├── {habitId}/
│   ├── title: string
│   ├── description: string
│   ├── category: string
│   ├── time: string
│   ├── status: string (pending/completed/missed)
│   ├── streak: number
│   ├── totalCompletions: number
│   ├── lastCompleted: timestamp
│   ├── userId: string
│   ├── isActive: boolean
│   ├── createdAt: timestamp
│   └── updatedAt: timestamp
```

### 4. Índices Recomendados

Firestore creará automáticamente los índices necesarios, pero puedes optimizar el rendimiento creando estos índices compuestos:

1. Ve a la pestaña "Índices"
2. Crea un índice compuesto:
   - **Colección**: `habits`
   - **Campos**: 
     - `userId` (Ascending)
     - `isActive` (Ascending)
     - `createdAt` (Descending)

### 5. Verificar Configuración

Para verificar que todo funciona:

1. Ejecuta la app: `npx expo start --tunnel`
2. Crea una cuenta o inicia sesión
3. Intenta crear un hábito
4. Verifica que aparece en la pantalla principal
5. Prueba marcar/desmarcar hábitos

## 🔒 Seguridad

### Reglas de Seguridad Explicadas:

- **`request.auth != null`**: Solo usuarios autenticados pueden acceder
- **`request.auth.uid == resource.data.userId`**: Los usuarios solo pueden acceder a sus propios hábitos
- **`request.auth.uid == request.resource.data.userId`**: Al crear hábitos, el userId debe coincidir con el usuario autenticado

### Protecciones Implementadas:

- ✅ **Autenticación requerida** para todas las operaciones
- ✅ **Aislamiento de datos** por usuario
- ✅ **Validación de datos** en el cliente y servidor
- ✅ **Soft delete** para hábitos (no se eliminan permanentemente)

## 📊 Monitoreo

### Métricas a Revisar:

1. **Uso de Firestore**: Ve a "Uso" en la consola
2. **Reglas de seguridad**: Revisa los logs de acceso denegado
3. **Rendimiento**: Monitorea los tiempos de respuesta

### Alertas Recomendadas:

- Configura alertas para uso excesivo de lecturas/escrituras
- Monitorea errores de reglas de seguridad
- Revisa el uso de almacenamiento

## 🚀 Optimizaciones Futuras

### Índices Adicionales:

```javascript
// Para consultas por fecha
habits: userId (Asc) + createdAt (Desc)

// Para consultas por categoría
habits: userId (Asc) + category (Asc) + createdAt (Desc)

// Para consultas por estado
habits: userId (Asc) + status (Asc) + createdAt (Desc)
```

### Funciones de Cloud Functions (Opcional):

```javascript
// Función para resetear hábitos diariamente
exports.resetDailyHabits = functions.pubsub.schedule('0 0 * * *').onRun(async (context) => {
  // Lógica para resetear hábitos pendientes
});

// Función para calcular estadísticas
exports.calculateStats = functions.firestore.document('habits/{habitId}').onWrite(async (change, context) => {
  // Lógica para actualizar estadísticas del usuario
});
```

## 🆘 Solución de Problemas

### Error: "Missing or insufficient permissions"
- Verifica que las reglas de seguridad estén configuradas correctamente
- Asegúrate de que el usuario esté autenticado
- Revisa que el userId coincida con el usuario autenticado

### Error: "The query requires an index"
- Ve a la pestaña "Índices" en Firestore
- Crea el índice compuesto requerido
- Espera a que se complete la indexación

### Error: "Quota exceeded"
- Revisa el uso en la consola de Firebase
- Considera optimizar las consultas
- Actualiza el plan si es necesario

## 📞 Soporte

Si tienes problemas con Firestore:

1. Revisa los logs en la consola de Firebase
2. Verifica que las reglas de seguridad sean correctas
3. Asegúrate de que los índices estén creados
4. Consulta la [documentación oficial de Firestore](https://firebase.google.com/docs/firestore)

¡Con esta configuración, tu app tendrá una base de datos robusta y segura! 🔥✨ 