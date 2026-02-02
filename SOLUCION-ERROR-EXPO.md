# 🔧 Solución: Error de Expo CLI y Dependencias

## 🚨 Problema Detectado

Estás usando el `expo-cli` global que está **deprecado** y tiene problemas con Node.js 17+.

**Errores:**
- `The global expo-cli package has been deprecated`
- `ExpoMetroConfig.loadAsync is not a function`
- Dependencias incompatibles

## ✅ SOLUCIÓN PASO A PASO

### Paso 1: Arreglar Dependencias

Ejecuta este comando para arreglar las dependencias incompatibles:

```powershell
npm run fix:deps
```

O manualmente:
```powershell
npx expo doctor --fix-dependencies
```

### Paso 2: Desinstalar Expo CLI Global (Opcional pero Recomendado)

Si tienes `expo-cli` instalado globalmente, desinstálalo:

```powershell
npm uninstall -g expo-cli
```

Esto evitará conflictos con el CLI local.

### Paso 3: Usar el CLI Local

Todos los scripts ahora usan `npx expo` (CLI local) en lugar de `expo` global.

**Comandos actualizados:**
- ✅ `npm start` - Usa CLI local
- ✅ `npm run start:tunnel` - Usa CLI local
- ✅ `npm run start:lan` - Usa CLI local

### Paso 4: Probar de Nuevo

Después de arreglar las dependencias:

```powershell
npm start
```

O si necesitas tunnel:

```powershell
npm run start:tunnel
```

---

## 📋 Comandos Útiles

| Comando | Descripción |
|---------|-------------|
| `npm run fix:deps` | Arreglar dependencias incompatibles |
| `npm start` | Iniciar app (elige método automáticamente) |
| `npm run start:tunnel` | Iniciar con tunnel |
| `npm run start:lan` | Iniciar en modo LAN |
| `npx expo doctor` | Verificar estado de dependencias |

---

## 🔍 Verificar que Funciona

Después de ejecutar `npm run fix:deps`, deberías ver:

```
✅ All dependencies are compatible
```

Si hay problemas, ejecuta:

```powershell
npx expo install --fix
```

---

## 💡 Nota Importante

**NUNCA uses `expo` directamente.** Siempre usa:
- ✅ `npx expo` (recomendado)
- ✅ `npm start` (usa scripts del package.json)

**NO uses:**
- ❌ `expo start` (CLI global deprecado)
- ❌ `expo-cli` (deprecado)

---

## 🆘 Si Sigue Sin Funcionar

1. **Limpiar todo:**
   ```powershell
   npm cache clean --force
   rm -rf node_modules
   npm install
   npm run fix:deps
   ```

2. **Verificar versión de Node:**
   ```powershell
   node --version
   ```
   Debe ser Node.js 18 o superior.

3. **Reinstalar Expo:**
   ```powershell
   npm install expo@latest
   npm run fix:deps
   ```

---

**¡Ejecuta `npm run fix:deps` primero y luego `npm start`!** 🚀
