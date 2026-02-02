# Script para crear tunnel manual con ngrok
# Esto te permite controlar el tunnel por separado

Write-Host "🔧 Configuración de Tunnel Manual" -ForegroundColor Cyan
Write-Host "════════════════════════════════════════════════" -ForegroundColor Cyan
Write-Host ""

# Paso 1: Verificar si ngrok está instalado
Write-Host "1️⃣  Verificando ngrok..." -ForegroundColor Yellow
try {
    $ngrokVersion = ngrok version 2>&1
    if ($LASTEXITCODE -eq 0) {
        Write-Host "   ✅ ngrok está instalado" -ForegroundColor Green
    } else {
        Write-Host "   ❌ ngrok NO está instalado" -ForegroundColor Red
        Write-Host "   💡 Instala con: npm install -g ngrok" -ForegroundColor Yellow
        exit 1
    }
} catch {
    Write-Host "   ❌ ngrok NO está instalado" -ForegroundColor Red
    Write-Host "   💡 Instala con: npm install -g ngrok" -ForegroundColor Yellow
    exit 1
}

Write-Host ""

# Paso 2: Verificar token
Write-Host "2️⃣  Verificando token de ngrok..." -ForegroundColor Yellow
try {
    $configCheck = ngrok config check 2>&1
    if ($LASTEXITCODE -eq 0) {
        Write-Host "   ✅ Token configurado" -ForegroundColor Green
    } else {
        Write-Host "   ❌ Token NO configurado" -ForegroundColor Red
        Write-Host ""
        Write-Host "   ⚠️  IMPORTANTE: Debes configurar tu token primero:" -ForegroundColor Yellow
        Write-Host "      1. Ve a: https://ngrok.com/ (crea cuenta gratis)" -ForegroundColor White
        Write-Host "      2. Dashboard → Your Authtoken" -ForegroundColor White
        Write-Host "      3. Ejecuta: ngrok authtoken TU_TOKEN" -ForegroundColor White
        Write-Host ""
        $continue = Read-Host "   ¿Quieres continuar de todas formas? (S/N)"
        if ($continue -ne "S" -and $continue -ne "s") {
            exit 1
        }
    }
} catch {
    Write-Host "   ⚠️  No se pudo verificar el token" -ForegroundColor Yellow
}

Write-Host ""
Write-Host "════════════════════════════════════════════════" -ForegroundColor Cyan
Write-Host ""
Write-Host "📋 INSTRUCCIONES:" -ForegroundColor Cyan
Write-Host ""
Write-Host "Este script iniciará Expo en una terminal y ngrok en otra." -ForegroundColor White
Write-Host ""
Write-Host "Paso 1: Inicia Expo en esta terminal (modo LAN):" -ForegroundColor Yellow
Write-Host "   npx expo start --dev-client --lan" -ForegroundColor Gray
Write-Host ""
Write-Host "Paso 2: Espera a que aparezca la URL (ej: exp://192.168.1.100:8081)" -ForegroundColor Yellow
Write-Host ""
Write-Host "Paso 3: En OTRA terminal, ejecuta:" -ForegroundColor Yellow
Write-Host "   ngrok http 8081" -ForegroundColor Gray
Write-Host ""
Write-Host "Paso 4: ngrok te dará una URL como: https://abc123.ngrok.io" -ForegroundColor Yellow
Write-Host ""
Write-Host "Paso 5: En Expo Go, usa 'Enter URL manually' y pon:" -ForegroundColor Yellow
Write-Host "   exp://abc123.ngrok.io:80" -ForegroundColor Gray
Write-Host ""
Write-Host "─────────────────────────────────────────────────" -ForegroundColor Gray
Write-Host ""

$start = Read-Host "¿Quieres iniciar Expo ahora en modo LAN? (S/N)"
if ($start -eq "S" -or $start -eq "s") {
    Write-Host ""
    Write-Host "▶️  Iniciando Expo en modo LAN..." -ForegroundColor Green
    Write-Host "   (Abre otra terminal para ejecutar ngrok después)" -ForegroundColor Yellow
    Write-Host ""
    
    npx expo start --dev-client --lan --clear
}
