# 🔧 Solución para Expo Go con Tunnel

## 🎯 Tu Situación

- ✅ Usas Expo Go
- ❌ LAN no funciona (no se conecta)
- ❌ Modo normal no funciona
- ⚠️ Solo tunnel funciona, pero ngrok falla

## 🔍 Diagnóstico

Primero, diagnostiquemos por qué LAN no funciona:

```powershell
npm run diagnostico:red
```

Esto verificará:
- Tu IP local
- Estado del firewall
- Configuración de red
- Posibles bloqueos

## ✅ SOLUCIÓN: Configurar ngrok correctamente

Como necesitas tunnel, la solución es configurar tu token de ngrok:

### Paso 1: Ejecutar configuración guiada
```powershell
npm run setup:ngrok
```

Este script te guiará paso a paso.

### Paso 2: Obtener tu token manualmente

Si prefieres hacerlo manualmente:

1. **Ve a ngrok.com:**
   - Abre: https://ngrok.com/
   - Clic en "Sign up" (registro gratuito)
   - Puedes usar Google/GitHub para registro rápido

2. **Obtener tu token:**
   - Una vez dentro del dashboard
   - Ve a "Getting Started" o "Your Authtoken"
   - **Copia tu token** (algo como: `2abc123def456ghi789...`)

3. **Configurar el token:**
   ```powershell
   ngrok authtoken TU_TOKEN_AQUI
   ```
   (Reemplaza `TU_TOKEN_AQUI` con el token que copiaste)

4. **Verificar:**
   ```powershell
   ngrok config check
   ```

### Paso 3: Probar tunnel
```powershell
npm run start:tunnel
```

O usa el inicio inteligente:
```powershell
npm start
```

---

## 🔍 Por qué LAN no funciona (posibles causas)

1. **Firewall bloqueando:**
   - Windows Firewall puede estar bloqueando el puerto 8081
   - **Solución:** Agrega excepción para Node.js y puerto 8081

2. **Redes diferentes:**
   - Teléfono y computadora en redes WiFi diferentes
   - **Solución:** Conéctate a la misma red WiFi

3. **VPN activa:**
   - VPN puede interferir con conexiones locales
   - **Solución:** Desactiva VPN temporalmente

4. **Router bloqueando:**
   - Algunos routers bloquean comunicación entre dispositivos
   - **Solución:** Verifica configuración del router (AP isolation)

---

## 🛠️ Soluciones Alternativas

### Opción 1: Arreglar LAN (si es posible)

Si quieres intentar arreglar LAN:

1. **Verificar misma red:**
   - Asegúrate de que teléfono y PC estén en la misma WiFi

2. **Desactivar firewall temporalmente:**
   - Windows Security → Firewall
   - Desactiva temporalmente para probar

3. **Agregar excepción de firewall:**
   ```powershell
   New-NetFirewallRule -DisplayName "Expo Metro" -Direction Inbound -LocalPort 8081 -Protocol TCP -Action Allow
   ```

4. **Probar LAN:**
   ```powershell
   npm run start:lan
   ```

### Opción 2: Usar tunnel (recomendado para tu caso)

Como LAN no funciona, configura ngrok:

```powershell
npm run setup:ngrok
```

Luego usa:
```powershell
npm run start:tunnel
```

---

## ✅ Comandos Rápidos

| Comando | Descripción |
|---------|-------------|
| `npm run setup:ngrok` | Configurar token de ngrok (GUIADO) |
| `npm run diagnostico:red` | Diagnosticar por qué LAN no funciona |
| `npm run start:tunnel` | Iniciar con tunnel |
| `npm start` | Inicio inteligente (elige automáticamente) |

---

## 💡 Recomendación Final

**Para tu caso específico:**

1. **Configura ngrok ahora:**
   ```powershell
   npm run setup:ngrok
   ```

2. **Usa tunnel siempre:**
   ```powershell
   npm run start:tunnel
   ```

3. **O usa inicio inteligente:**
   ```powershell
   npm start
   ```

El token de ngrok es **GRATIS** y solo necesitas:
- Crear cuenta (2 minutos)
- Copiar token (30 segundos)
- Configurarlo (1 comando)

---

## 🆘 Si ngrok sigue fallando después de configurar

1. **Verifica el token:**
   ```powershell
   ngrok config check
   ```

2. **Prueba ngrok directamente:**
   ```powershell
   ngrok http 8081
   ```
   (En otra terminal mientras Expo corre)

3. **Actualiza @expo/ngrok:**
   ```powershell
   npm install @expo/ngrok@latest --save
   ```

4. **Reinicia tu computadora**

---

**¡Configura ngrok ahora y el tunnel funcionará perfectamente!** 🚀
