# 🚀 Inicio Rápido - HabitTrackerApp

## ✅ SOLUCIÓN FUNCIONAL INMEDIATA

### Opción 1: Inicio Inteligente (RECOMENDADO)
```powershell
npm start
```

Este comando:
- ✅ Detecta automáticamente si tienes token de ngrok
- ✅ Usa tunnel si está configurado
- ✅ Usa LAN si no hay token (más rápido)
- ✅ Funciona siempre

---

### Opción 2: Modo LAN (Más Rápido)
```powershell
npm run start:lan
```

**Requisito:** Teléfono y computadora en la misma red WiFi

---

### Opción 3: Configurar Tunnel (Para redes diferentes)
```powershell
npm run setup:ngrok
```

Sigue las instrucciones para:
1. Crear cuenta en ngrok.com (gratis)
2. Obtener tu token
3. Configurarlo

Después usa: `npm start` o `npm run start:tunnel`

---

## 📋 Comandos Disponibles

| Comando | Descripción |
|---------|-------------|
| `npm start` | Inicio inteligente (recomendado) |
| `npm run start:lan` | Modo LAN (mismo WiFi) |
| `npm run start:tunnel` | Modo tunnel (cualquier red) |
| `npm run setup:ngrok` | Configurar token de ngrok |
| `npm run fix:ngrok` | Diagnosticar problemas |

---

## 🔧 Solución de Problemas

### Error: "ngrok tunnel took too long to connect"
**Solución:** Configura tu token de ngrok:
```powershell
npm run setup:ngrok
```

### Error: "No se puede conectar en modo LAN"
**Solución:** 
- Verifica que teléfono y computadora estén en la misma red WiFi
- Desactiva VPN temporalmente
- Verifica que el firewall no bloquee

### Error: "ngrok: command not found"
**Solución:**
```powershell
npm install -g ngrok
```

---

## 💡 Recomendación

**Para desarrollo diario:**
- Usa `npm start` (elige automáticamente el mejor método)
- O `npm run start:lan` si estás en la misma red WiFi

**Para compartir o redes diferentes:**
- Configura ngrok: `npm run setup:ngrok`
- Luego usa: `npm start` o `npm run start:tunnel`

---

## ✅ ¡Listo para usar!

Ejecuta:
```powershell
npm start
```

Y escanea el QR con Expo Go en tu teléfono.
