# Script de PowerShell para verificar la configuración de ngrok
# Uso: .\check-ngrok.ps1

Write-Host "🔍 Verificando configuración de ngrok..." -ForegroundColor Cyan
Write-Host ""

# Verificar si ngrok está instalado globalmente
Write-Host "1. Verificando instalación de ngrok..." -ForegroundColor Yellow
try {
    $ngrokVersion = ngrok version 2>&1
    if ($LASTEXITCODE -eq 0) {
        Write-Host "   ✅ ngrok está instalado: $ngrokVersion" -ForegroundColor Green
    } else {
        Write-Host "   ❌ ngrok no está instalado globalmente" -ForegroundColor Red
        Write-Host "   💡 Instala con: npm install -g ngrok" -ForegroundColor Yellow
    }
} catch {
    Write-Host "   ❌ ngrok no está instalado globalmente" -ForegroundColor Red
    Write-Host "   💡 Instala con: npm install -g ngrok" -ForegroundColor Yellow
}

Write-Host ""

# Verificar token de ngrok
Write-Host "2. Verificando token de autenticación..." -ForegroundColor Yellow
try {
    $ngrokConfig = ngrok config check 2>&1
    if ($LASTEXITCODE -eq 0) {
        Write-Host "   ✅ Token de ngrok configurado correctamente" -ForegroundColor Green
    } else {
        Write-Host "   ❌ Token de ngrok NO está configurado" -ForegroundColor Red
        Write-Host "   💡 Esta es la causa más común del error 'tunnel took too long to connect'" -ForegroundColor Yellow
        Write-Host ""
        Write-Host "   📝 Pasos para configurar:" -ForegroundColor Cyan
        Write-Host "      1. Crea una cuenta gratuita en: https://ngrok.com/" -ForegroundColor White
        Write-Host "      2. Ve a: Your Authtoken (en el dashboard)" -ForegroundColor White
        Write-Host "      3. Copia tu token" -ForegroundColor White
        Write-Host "      4. Ejecuta: ngrok authtoken TU_TOKEN_AQUI" -ForegroundColor White
    }
} catch {
    Write-Host "   ⚠️  No se pudo verificar el token (ngrok puede no estar instalado)" -ForegroundColor Yellow
}

Write-Host ""

# Verificar versión de @expo/ngrok
Write-Host "3. Verificando versión de @expo/ngrok..." -ForegroundColor Yellow
if (Test-Path "package.json") {
    $packageJson = Get-Content "package.json" | ConvertFrom-Json
    $expoNgrokVersion = $packageJson.dependencies.'@expo/ngrok'
    Write-Host "   📦 Versión instalada: $expoNgrokVersion" -ForegroundColor White
    
    Write-Host "   💡 Para actualizar, ejecuta:" -ForegroundColor Yellow
    Write-Host "      npm install @expo/ngrok@latest --save" -ForegroundColor White
} else {
    Write-Host "   ⚠️  No se encontró package.json" -ForegroundColor Yellow
}

Write-Host ""
Write-Host "─────────────────────────────────────────────────" -ForegroundColor Gray
Write-Host ""

# Verificar conexión a internet
Write-Host "4. Verificando conexión a internet..." -ForegroundColor Yellow
try {
    $ping = Test-Connection -ComputerName "8.8.8.8" -Count 2 -Quiet
    if ($ping) {
        Write-Host "   ✅ Conexión a internet funcionando" -ForegroundColor Green
    } else {
        Write-Host "   ❌ Problemas con la conexión a internet" -ForegroundColor Red
        Write-Host "   💡 Verifica tu conexión" -ForegroundColor Yellow
    }
} catch {
    Write-Host "   ⚠️  No se pudo verificar la conexión" -ForegroundColor Yellow
}

Write-Host ""

# Resumen y recomendaciones
Write-Host "📋 Resumen y Recomendaciones:" -ForegroundColor Cyan
Write-Host ""
Write-Host "Si el tunnel no funciona, prueba estos pasos en orden:" -ForegroundColor White
Write-Host ""
Write-Host "1. ⭐ Configura tu token de ngrok (MÁS IMPORTANTE):" -ForegroundColor Yellow
Write-Host "   ngrok authtoken TU_TOKEN" -ForegroundColor White
Write-Host ""
Write-Host "2. Actualiza @expo/ngrok:" -ForegroundColor Yellow
Write-Host "   npm install @expo/ngrok@latest --save" -ForegroundColor White
Write-Host ""
Write-Host "3. Limpia la caché y reinicia:" -ForegroundColor Yellow
Write-Host "   npm run start:tunnel" -ForegroundColor White
Write-Host ""
Write-Host "4. Si usas VPN, desactívala temporalmente" -ForegroundColor Yellow
Write-Host ""
Write-Host "5. Verifica que tu firewall/antivirus no bloquee ngrok" -ForegroundColor Yellow
Write-Host ""
