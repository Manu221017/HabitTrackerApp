# Script inteligente que elige el mejor metodo para iniciar Expo
# Uso: .\start-expo.ps1

Write-Host "Iniciando HabitTrackerApp" -ForegroundColor Cyan
Write-Host "================================================" -ForegroundColor Cyan
Write-Host ""

# Verificar si ngrok tiene token configurado
$hasToken = $false
try {
    $configCheck = ngrok config check 2>&1
    if ($LASTEXITCODE -eq 0) {
        $hasToken = $true
    }
} catch {
    $hasToken = $false
}

Write-Host "Detectando mejor metodo de conexion..." -ForegroundColor Yellow
Write-Host ""

if ($hasToken) {
    Write-Host "   OK Token de ngrok detectado" -ForegroundColor Green
    Write-Host "   Usando tunnel (funciona desde cualquier red)" -ForegroundColor Gray
    Write-Host ""
    Write-Host "-----------------------------------------------" -ForegroundColor Gray
    Write-Host ""
    
    # Limpiar cache
    Write-Host "Limpiando cache..." -ForegroundColor Yellow
    npx expo start --clear --non-interactive 2>&1 | Out-Null
    
    Write-Host ""
    Write-Host "Iniciando con tunnel..." -ForegroundColor Green
    Write-Host ""
    
    npx expo start --dev-client --tunnel --clear
} else {
    Write-Host "   Advertencia: Token de ngrok no configurado" -ForegroundColor Yellow
    Write-Host "   Usando modo LAN (mas rapido, requiere misma red WiFi)" -ForegroundColor Gray
    Write-Host ""
    Write-Host "   Para configurar tunnel mas adelante:" -ForegroundColor Cyan
    Write-Host "      npm run setup:ngrok" -ForegroundColor Gray
    Write-Host ""
    Write-Host "-----------------------------------------------" -ForegroundColor Gray
    Write-Host ""
    
    # Limpiar cache
    Write-Host "Limpiando cache..." -ForegroundColor Yellow
    npx expo start --clear --non-interactive 2>&1 | Out-Null
    
    Write-Host ""
    Write-Host "Iniciando en modo LAN..." -ForegroundColor Green
    Write-Host "   (Asegurate de estar en la misma red WiFi)" -ForegroundColor Yellow
    Write-Host ""
    
    npx expo start --dev-client --lan --clear
}
