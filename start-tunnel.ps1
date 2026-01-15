# Script de PowerShell para iniciar Expo con tunnel y manejo de errores
# Uso: .\start-tunnel.ps1

Write-Host "🚀 Iniciando Expo con tunnel..." -ForegroundColor Cyan
Write-Host ""

# Limpiar caché de Metro
Write-Host "🧹 Limpiando caché de Metro..." -ForegroundColor Yellow
npx expo start --clear --non-interactive 2>&1 | Out-Null

# Intentar iniciar con tunnel
Write-Host "🔗 Conectando tunnel (esto puede tardar unos segundos)..." -ForegroundColor Yellow
Write-Host ""

$maxRetries = 3
$retryCount = 0

while ($retryCount -lt $maxRetries) {
    try {
        Write-Host "Intento $($retryCount + 1) de $maxRetries..." -ForegroundColor Gray
        
        # Iniciar Expo con tunnel
        npx expo start --dev-client --tunnel
        
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
            Write-Host "💡 Sugerencias:" -ForegroundColor Yellow
            Write-Host "   1. Verifica tu conexión a internet" -ForegroundColor White
            Write-Host "   2. Desactiva temporalmente VPN o firewall" -ForegroundColor White
            Write-Host "   3. Prueba con: npm run start:tunnel" -ForegroundColor White
            Write-Host "   4. Si tienes cuenta de ngrok, configura tu token: ngrok authtoken TU_TOKEN" -ForegroundColor White
            exit 1
        }
    }
}

