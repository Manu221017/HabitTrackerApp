# Script para iniciar Expo sin tunnel (modo LAN)
# Útil cuando el tunnel no funciona

Write-Host "🚀 Iniciando Expo en modo LAN..." -ForegroundColor Cyan
Write-Host ""
Write-Host "ℹ️  NOTA: Tu teléfono y computadora deben estar en la misma red WiFi" -ForegroundColor Yellow
Write-Host ""
Write-Host "Pasos:" -ForegroundColor White
Write-Host "1. Asegúrate de que tu teléfono esté en la misma red WiFi que tu computadora" -ForegroundColor Gray
Write-Host "2. Cuando aparezca el QR, escanéalo con Expo Go" -ForegroundColor Gray
Write-Host "3. Si el QR no funciona, usa 'Enter URL manually' con la URL que aparece" -ForegroundColor Gray
Write-Host ""
Write-Host "─────────────────────────────────────────────────" -ForegroundColor Gray
Write-Host ""

# Limpiar caché
Write-Host "Limpiando cache..." -ForegroundColor Yellow
npx expo start --clear --non-interactive 2>&1 | Out-Null

Write-Host ""
Write-Host "Iniciando Expo en modo LAN..." -ForegroundColor Green
Write-Host ""

# Iniciar en modo LAN
npx expo start --dev-client --lan --clear
