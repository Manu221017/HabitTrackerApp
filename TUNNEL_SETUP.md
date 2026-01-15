# 🔧 Configuración de Tunnel (ngrok)

Esta guía te ayudará a resolver problemas con el tunnel de ngrok en Expo.

## 🚨 Problema Común

Si ves el error: **"ngrok tunnel took too long to connect"**, sigue estos pasos.

## ✅ Solución Recomendada: Configurar Token de ngrok

La mejor solución es usar tu propio token de ngrok (gratuito y más estable):

### Paso 1: Crear cuenta en ngrok
1. Ve a [ngrok.com](https://ngrok.com/)
2. Crea una cuenta gratuita (es rápido y gratuito)
3. Inicia sesión en tu cuenta

### Paso 2: Obtener tu token de autenticación
1. En el dashboard de ngrok, ve a: **Your Authtoken** o **Getting Started**
2. Copia tu token de autenticación
3. Ejecuta en PowerShell (en cualquier directorio):
   ```powershell
   ngrok authtoken TU_TOKEN_AQUI
   ```
   Ejemplo:
   ```powershell
   ngrok authtoken 2abc123def456ghi789jkl012mno345pqr
   ```

### Paso 3: Verificar instalación
Si ngrok no está instalado globalmente:
```powershell
npm install -g ngrok
```

Luego ejecuta:
```powershell
ngrok version
```

### Paso 4: Usar tunnel en Expo
Ahora puedes usar tunnel normalmente:
```powershell
cd HabitTrackerApp
npm run start:tunnel
```

## 🛠️ Scripts Disponibles

### Opción 1: Script de npm (Recomendado)
```powershell
npm run start:tunnel
```
- Limpia la caché automáticamente
- Usa tunnel con configuración optimizada

### Opción 2: Script de PowerShell
```powershell
.\start-tunnel.ps1
```
- Reintenta automáticamente si falla
- Muestra mensajes de ayuda si hay errores

### Opción 3: Comando manual
```powershell
npx expo start --dev-client --tunnel --clear
```

## 🔍 Solución de Problemas

### Error: "ngrok authtoken: command not found"
**Solución**: Instala ngrok globalmente:
```powershell
npm install -g ngrok
```

### Error: "tunnel took too long to connect"
**Posibles causas y soluciones**:

1. **Conexión a internet lenta/inestable**
   - Verifica tu conexión
   - Intenta con otra red

2. **Firewall/Antivirus bloqueando**
   - Agrega excepciones para ngrok y Node.js
   - Desactiva temporalmente para probar

3. **VPN activa**
   - Desactiva VPN temporalmente
   - O configura VPN para permitir ngrok

4. **Token no configurado**
   - Sigue los pasos arriba para configurar tu token

5. **Caché corrupta**
   - Usa: `npm run start:tunnel` (incluye `--clear`)
   - O manualmente: `npx expo start --clear`

### Error: "ngrok tunnel failed to start"
1. Verifica que tu token esté configurado: `ngrok config check`
2. Actualiza @expo/ngrok:
   ```powershell
   npm install @expo/ngrok@latest --save
   ```
3. Reinstala dependencias:
   ```powershell
   npm install
   ```

## 📝 Notas Importantes

- **Cuenta gratuita de ngrok**: Incluye límites pero son suficientes para desarrollo
- **Token es único**: No compartas tu token públicamente
- **Persistencia**: Una vez configurado, el token se guarda y no necesitas configurarlo de nuevo

## 🆘 Si Nada Funciona

1. Verifica el estado de los servicios:
   - [Estado de Expo](https://status.expo.dev/)
   - [Estado de ngrok](https://status.ngrok.com/)

2. Actualiza todas las dependencias:
   ```powershell
   npm update
   npm install @expo/ngrok@latest --save
   ```

3. Prueba alternativas:
   - Usa modo LAN si estás en la misma red: `npx expo start --lan`
   - Usa localhost para emuladores: `npx expo start --localhost`

## 📚 Recursos Adicionales

- [Documentación de Expo sobre tunnel](https://docs.expo.dev/more/expo-cli/#tunnel)
- [Documentación de ngrok](https://ngrok.com/docs)
- [Foros de Expo](https://forums.expo.dev/)

