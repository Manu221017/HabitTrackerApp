# 🚨 Solución Paso a Paso: Error "ngrok tunnel took too long to connect"

## ⚡ SOLUCIÓN RÁPIDA (5 minutos)

### Paso 1: Instalar ngrok globalmente
```powershell
npm install -g ngrok
```

### Paso 2: Crear cuenta y obtener token
1. Ve a: **https://ngrok.com/**
2. Clic en **"Sign up"** (registro gratuito)
3. Completa el registro (puedes usar GitHub o Google)
4. Una vez dentro, ve a **"Getting Started"** o **"Your Authtoken"**
5. **Copia tu token** (algo como: `2abc123def456ghi789jkl012mno345pqr`)

### Paso 3: Configurar el token
```powershell
ngrok authtoken TU_TOKEN_AQUI
```

### Paso 4: Verificar que funcionó
```powershell
ngrok config check
```

Deberías ver: `Valid authtoken saved to configuration file`

### Paso 5: Probar tunnel directamente
```powershell
cd c:\Users\karen\MVP\HabitTrackerApp
npm run start:tunnel
```

---

## 🔧 SOLUCIÓN ALTERNATIVA: Usar ngrok manualmente

Si Expo sigue fallando, puedes usar ngrok manualmente:

### Paso 1: Iniciar Expo en una terminal (SIN tunnel)
```powershell
cd c:\Users\karen\MVP\HabitTrackerApp
npx expo start --dev-client --lan
```

Esto mostrará algo como:
```
Metro waiting on exp://192.168.1.100:8081
```

### Paso 2: En otra terminal, crear tunnel con ngrok
```powershell
ngrok http 8081
```

Esto creará un URL público como: `https://abc123.ngrok.io`

### Paso 3: Usar el URL de ngrok en tu teléfono
1. Abre Expo Go en tu teléfono
2. En lugar de escanear el QR, usa **"Enter URL manually"**
3. Ingresa: `exp://abc123.ngrok.io:80` (reemplaza con tu URL de ngrok)

---

## 🌐 SOLUCIÓN ALTERNATIVA 2: Cloudflare Tunnel (gratis, más rápido)

Si ngrok no funciona, prueba Cloudflare Tunnel:

### Paso 1: Instalar cloudflared
```powershell
# Descargar de: https://developers.cloudflare.com/cloudflare-one/connections/connect-apps/install-and-setup/installation/
# O usar scoop:
scoop install cloudflared
```

### Paso 2: Usar tunnel de Expo directamente
```powershell
cd c:\Users\karen\MVP\HabitTrackerApp
npx expo start --dev-client --tunnel
```

Si tienes cloudflared instalado, Expo puede usarlo automáticamente.

---

## 🔍 DIAGNÓSTICO: Verificar qué está mal

### Verificar si ngrok está instalado:
```powershell
ngrok version
```

### Verificar si el token está configurado:
```powershell
ngrok config check
```

### Verificar tu conexión:
```powershell
Test-Connection -ComputerName "8.8.8.8" -Count 2
```

### Verificar si hay procesos de ngrok corriendo:
```powershell
Get-Process | Where-Object {$_.ProcessName -like "*ngrok*"}
```

Si hay procesos, ciérralos:
```powershell
Stop-Process -Name "ngrok" -Force
```

---

## 🛡️ SOLUCIONES PARA PROBLEMAS COMUNES

### Problema: "ngrok: command not found"
**Solución:**
```powershell
npm install -g ngrok
```

### Problema: "Invalid authtoken"
**Solución:**
1. Verifica que copiaste el token completo
2. Obtén un nuevo token del dashboard de ngrok
3. Ejecuta: `ngrok authtoken TU_NUEVO_TOKEN`

### Problema: Firewall bloqueando
**Solución:**
1. Abre Windows Defender Firewall
2. Permite ngrok y Node.js a través del firewall
3. O desactiva temporalmente el firewall para probar

### Problema: VPN activa
**Solución:**
1. Desactiva tu VPN temporalmente
2. O configura tu VPN para permitir ngrok

### Problema: Múltiples instancias de ngrok
**Solución:**
```powershell
# Cerrar todos los procesos de ngrok
Get-Process | Where-Object {$_.ProcessName -like "*ngrok*"} | Stop-Process -Force

# Esperar 5 segundos
Start-Sleep -Seconds 5

# Intentar de nuevo
npm run start:tunnel
```

---

## ⚙️ CONFIGURACIÓN AVANZADA

### Aumentar timeout de ngrok
Crea o edita: `%USERPROFILE%\.ngrok2\ngrok.yml`

```yaml
version: "2"
authtoken: TU_TOKEN_AQUI
tunnels:
  default:
    proto: http
    addr: 8081
    inspect: true
```

Luego usa:
```powershell
npx expo start --dev-client --tunnel
```

---

## 📱 SOLUCIÓN FINAL: Usar Expo Development Build

Si nada funciona, considera crear un Development Build:

1. **Instalar EAS CLI:**
```powershell
npm install -g eas-cli
```

2. **Crear build de desarrollo:**
```powershell
eas build --profile development --platform android
```

3. **Instalar el APK en tu teléfono**
4. **Conectar directamente sin tunnel:**
```powershell
npx expo start --dev-client --lan
```

---

## 🆘 Si NADA funciona

1. **Verifica el estado de ngrok:**
   - https://status.ngrok.com/

2. **Prueba con otra red:**
   - Usa datos móviles en tu computadora
   - O usa hotspot de tu teléfono

3. **Contacta soporte de ngrok:**
   - https://ngrok.com/support

---

## ✅ Checklist Final

Antes de intentar de nuevo, verifica:

- [ ] ngrok está instalado globalmente (`ngrok version`)
- [ ] Tienes una cuenta en ngrok.com
- [ ] Has configurado tu token (`ngrok authtoken TU_TOKEN`)
- [ ] El token es válido (`ngrok config check`)
- [ ] No hay VPN activa
- [ ] El firewall permite ngrok
- [ ] Tu conexión a internet está estable
- [ ] No hay procesos de ngrok corriendo

---

**¿Necesitas más ayuda?** Revisa los logs de error completos y compártelos.
