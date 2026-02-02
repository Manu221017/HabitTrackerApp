# Script de PowerShell para iniciar Expo con tunnel y manejo de errores
# Uso: .\start-tunnel.ps1

Write-Host "🚀 Iniciando Expo con tunnel..." -ForegroundColor Cyan
Write-Host ""

# Verificar si ngrok tiene token configurado
Write-Host "🔍 Verificando configuración de ngrok..." -ForegroundColor Yellow
try {
    $configCheck = ngrok config check 2>&1
    if ($LASTEXITCODE -ne 0) {
        Write-Host ""
        Write-Host "⚠️  ADVERTENCIA: Token de ngrok no configurado" -ForegroundColor Red
        Write-Host "   Esto puede causar el error 'tunnel took too long to connect'" -ForegroundColor Yellow
        Write-Host ""
        Write-Host "   💡 Para solucionarlo:" -ForegroundColor Cyan
        Write-Host "      1. Crea cuenta en: https://ngrok.com/ (gratis)" -ForegroundColor White
        Write-Host "      2. Copia tu token del dashboard" -ForegroundColor White
        Write-Host "      3. Ejecuta: ngrok authtoken TU_TOKEN" -ForegroundColor White
        Write-Host ""
        Write-Host "   Continuando de todas formas..." -ForegroundColor Yellow
        Write-Host ""
        Start-Sleep -Seconds 2
    } else {
        Write-Host "   ✅ Token de ngrok configurado" -ForegroundColor Green
        Write-Host ""
    }
} catch {
    Write-Host "   ⚠️  No se pudo verificar el token de ngrok" -ForegroundColor Yellow
    Write-Host ""
}

# Limpiar caché de Metro
Write-Host "🧹 Limpiando caché de Metro..." -ForegroundColor Yellow
npx expo start --clear --non-interactive 2>&1 | Out-Null

# Intentar iniciar con tunnel
Write-Host "🔗 Conectando tunnel (esto puede tardar 10-30 segundos)..." -ForegroundColor Yellow
Write-Host "   Si tarda más de 60 segundos, cancela con Ctrl+C y verifica tu token de ngrok" -ForegroundColor Gray
Write-Host ""

$maxRetries = 2
$retryCount = 0

while ($retryCount -lt $maxRetries) {
    try {
        Write-Host "Intento $($retryCount + 1) de $maxRetries..." -ForegroundColor Gray
        
        # Iniciar Expo con tunnel y timeout más largo
        $env:EXPO_NO_DOTENV = "1"
        npx expo start --dev-client --tunnel --clear
        
        # Si llegamos aquí, el comando terminó sin error
        break
    }
    catch {
        $retryCount++
        if ($retryCount -lt $maxRetries) {
            Write-Host ""
            Write-Host "❌ Error en el tunnel. Reintentando en 5 segundos..." -ForegroundColor Red
            Start-Sleep -Seconds 5
        }
        else {
            Write-Host ""
            Write-Host "❌ No se pudo establecer el tunnel después de $maxRetries intentos." -ForegroundColor Red
            Write-Host ""
            Write-Host "─────────────────────────────────────────────────" -ForegroundColor Gray
            Write-Host "💡 SOLUCIONES RECOMENDADAS (en orden de prioridad):" -ForegroundColor Yellow
            Write-Host ""
            Write-Host "1. ⭐ CONFIGURA TU TOKEN DE NGROK (Más importante):" -ForegroundColor Cyan
            Write-Host "   - Crea cuenta gratis en: https://ngrok.com/" -ForegroundColor White
            Write-Host "   - Copia tu token del dashboard" -ForegroundColor White
            Write-Host "   - Ejecuta: ngrok authtoken TU_TOKEN" -ForegroundColor White
            Write-Host ""
            Write-Host "2. Verifica tu configuración:" -ForegroundColor Cyan
            Write-Host "   .\check-ngrok.ps1" -ForegroundColor White
            Write-Host ""
            Write-Host "3. Actualiza @expo/ngrok:" -ForegroundColor Cyan
            Write-Host "   npm install @expo/ngrok@latest --save" -ForegroundColor White
            Write-Host ""
            Write-Host "4. Verifica tu conexión a internet" -ForegroundColor Cyan
            Write-Host ""
            Write-Host "5. Si usas VPN, desactívala temporalmente" -ForegroundColor Cyan
            Write-Host ""
            Write-Host "6. Verifica que tu firewall no bloquee ngrok" -ForegroundColor Cyan
            Write-Host ""
            exit 1
        }
    }
}

