# 🚨 SOLUCIÓN RÁPIDA: Tunnel no funciona

## ⚡ OPCIÓN 1: Usar modo LAN (MÁS FÁCIL)

Si tu teléfono y computadora están en la misma red WiFi:

```powershell
npm run start:lan
```

**Ventajas:**
- ✅ No necesita configuración
- ✅ Más rápido que tunnel
- ✅ Más estable

**Requisitos:**
- Teléfono y computadora en la misma red WiFi

---

## 🔧 OPCIÓN 2: Configurar ngrok correctamente

El problema es que **NO tienes configurado el token de ngrok**.

### Paso a Paso (5 minutos):

1. **Ir a ngrok.com:**
   - Abre: https://ngrok.com/
   - Clic en "Sign up" (registro gratuito)
   - Completa el registro (puedes usar Google/GitHub)

2. **Obtener tu token:**
   - Una vez dentro del dashboard
   - Ve a "Getting Started" o "Your Authtoken"
   - **Copia tu token** (algo como: `2abc123def456...`)

3. **Configurar el token:**
   ```powershell
   ngrok authtoken TU_TOKEN_AQUI
   ```
   (Reemplaza `TU_TOKEN_AQUI` con el token que copiaste)

4. **Verificar:**
   ```powershell
   ngrok config check
   ```
   Deberías ver: `Valid authtoken saved to configuration file`

5. **Probar:**
   ```powershell
   npm run start:tunnel
   ```

---

## 🔄 OPCIÓN 3: Tunnel Manual (si nada funciona)

Si el tunnel automático no funciona, usa tunnel manual:

### Terminal 1 - Iniciar Expo:
```powershell
npx expo start --dev-client --lan
```

Espera a ver algo como: `Metro waiting on exp://192.168.1.100:8081`

### Terminal 2 - Crear tunnel con ngrok:
```powershell
ngrok http 8081
```

Esto te dará una URL como: `https://abc123.ngrok.io`

### En tu teléfono (Expo Go):
1. Abre Expo Go
2. Usa "Enter URL manually"
3. Ingresa: `exp://abc123.ngrok.io:80`
   (Reemplaza con tu URL de ngrok)

---

## 🔍 OPCIÓN 4: Verificar qué está mal

Ejecuta el diagnóstico:
```powershell
npm run fix:ngrok
```

Este script verificará:
- ✅ Si ngrok está instalado
- ✅ Si el token está configurado
- ✅ Si hay procesos bloqueando
- ✅ La conexión a internet

---

## ✅ RECOMENDACIÓN FINAL

**Para desarrollo diario:** Usa **OPCIÓN 1 (LAN)** si estás en la misma red WiFi.

**Para compartir con otros/redes diferentes:** Configura el token de ngrok (**OPCIÓN 2**).

---

## ❓ ¿Por qué el tunnel es tan lento?

Sin token de ngrok configurado, usas el servicio "gratuito compartido" que:
- ⚠️ Tiene límites de conexiones
- ⚠️ Puede ser muy lento
- ⚠️ Falla frecuentemente

Con tu propio token (gratis):
- ✅ Conexiones más rápidas
- ✅ Más estable
- ✅ Sin límites estrictos
- ✅ Funciona mejor

**El token es GRATIS, solo necesitas crear una cuenta.**

---

## 🆘 Si NADA funciona

1. **Verifica tu conexión a internet**
2. **Desactiva VPN temporalmente**
3. **Verifica que el firewall no bloquee**
4. **Prueba con datos móviles como hotspot**
5. **Reinicia tu computadora**
