# Script para diagnosticar y arreglar problemas de ngrok
# Uso: .\fix-ngrok.ps1

Write-Host "🔧 Diagnóstico y Solución de Problemas de ngrok" -ForegroundColor Cyan
Write-Host "════════════════════════════════════════════════" -ForegroundColor Cyan
Write-Host ""

$problems = @()
$solutions = @()

# 1. Verificar si ngrok está instalado
Write-Host "1️⃣  Verificando instalación de ngrok..." -ForegroundColor Yellow
try {
    $ngrokVersion = ngrok version 2>&1
    if ($LASTEXITCODE -eq 0) {
        Write-Host "   ✅ ngrok está instalado: $ngrokVersion" -ForegroundColor Green
    } else {
        Write-Host "   ❌ ngrok NO está instalado globalmente" -ForegroundColor Red
        $problems += "ngrok no instalado"
        $solutions += "Ejecuta: npm install -g ngrok"
    }
} catch {
    Write-Host "   ❌ ngrok NO está instalado globalmente" -ForegroundColor Red
    $problems += "ngrok no instalado"
    $solutions += "Ejecuta: npm install -g ngrok"
}

Write-Host ""

# 2. Verificar token de ngrok
Write-Host "2️⃣  Verificando token de autenticación..." -ForegroundColor Yellow
try {
    $configCheck = ngrok config check 2>&1
    if ($LASTEXITCODE -eq 0) {
        Write-Host "   ✅ Token de ngrok configurado correctamente" -ForegroundColor Green
    } else {
        Write-Host "   ❌ Token de ngrok NO configurado" -ForegroundColor Red
        $problems += "token no configurado"
        Write-Host ""
        Write-Host "   📝 Esto es probablemente la causa del error 'tunnel took too long to connect'" -ForegroundColor Yellow
        Write-Host ""
        Write-Host "   ⚡ SOLUCIÓN RÁPIDA:" -ForegroundColor Cyan
        Write-Host "      1. Ve a: https://ngrok.com/ (crea cuenta gratis)" -ForegroundColor White
        Write-Host "      2. Dashboard → Your Authtoken" -ForegroundColor White
        Write-Host "      3. Copia tu token" -ForegroundColor White
        Write-Host "      4. Ejecuta: ngrok authtoken TU_TOKEN" -ForegroundColor White
        $solutions += "Configura tu token: ngrok authtoken TU_TOKEN"
    }
} catch {
    Write-Host "   ⚠️  No se pudo verificar (ngrok puede no estar instalado)" -ForegroundColor Yellow
}

Write-Host ""

# 3. Verificar procesos de ngrok corriendo
Write-Host "3️⃣  Verificando procesos de ngrok activos..." -ForegroundColor Yellow
$ngrokProcesses = Get-Process | Where-Object {$_.ProcessName -like "*ngrok*"}
if ($ngrokProcesses) {
    Write-Host "   ⚠️  Se encontraron procesos de ngrok corriendo:" -ForegroundColor Yellow
    $ngrokProcesses | ForEach-Object {
        Write-Host "      - PID $($_.Id): $($_.ProcessName)" -ForegroundColor Gray
    }
    Write-Host ""
    $close = Read-Host "   ¿Deseas cerrar estos procesos? (S/N)"
    if ($close -eq "S" -or $close -eq "s") {
        $ngrokProcesses | Stop-Process -Force
        Write-Host "   ✅ Procesos cerrados" -ForegroundColor Green
        Start-Sleep -Seconds 2
    } else {
        $problems += "procesos ngrok activos"
        $solutions += "Cierra los procesos de ngrok: Get-Process | Where-Object ProcessName -like '*ngrok*' | Stop-Process -Force"
    }
} else {
    Write-Host "   ✅ No hay procesos de ngrok corriendo" -ForegroundColor Green
}

Write-Host ""

# 4. Verificar conexión a internet
Write-Host "4️⃣  Verificando conexión a internet..." -ForegroundColor Yellow
try {
    $ping = Test-Connection -ComputerName "8.8.8.8" -Count 2 -Quiet -ErrorAction SilentlyContinue
    if ($ping) {
        Write-Host "   ✅ Conexión a internet funcionando" -ForegroundColor Green
    } else {
        Write-Host "   ❌ Problemas con la conexión a internet" -ForegroundColor Red
        $problems += "problemas de conexión"
        $solutions += "Verifica tu conexión a internet"
    }
} catch {
    Write-Host "   ⚠️  No se pudo verificar la conexión" -ForegroundColor Yellow
}

Write-Host ""

# 5. Verificar versión de @expo/ngrok
Write-Host "5️⃣  Verificando versión de @expo/ngrok..." -ForegroundColor Yellow
if (Test-Path "package.json") {
    $packageJson = Get-Content "package.json" | ConvertFrom-Json
    $expoNgrokVersion = $packageJson.dependencies.'@expo/ngrok'
    Write-Host "   📦 Versión instalada: $expoNgrokVersion" -ForegroundColor White
    
    Write-Host ""
    Write-Host "   💡 Para actualizar:" -ForegroundColor Yellow
    Write-Host "      npm install @expo/ngrok@latest --save" -ForegroundColor White
} else {
    Write-Host "   ⚠️  No se encontró package.json" -ForegroundColor Yellow
}

Write-Host ""
Write-Host "════════════════════════════════════════════════" -ForegroundColor Cyan
Write-Host ""

# Resumen
if ($problems.Count -eq 0) {
    Write-Host "✅ ¡Todo parece estar bien configurado!" -ForegroundColor Green
    Write-Host ""
    Write-Host "Si aún tienes problemas, prueba:" -ForegroundColor Yellow
    Write-Host "1. Reiniciar tu computadora" -ForegroundColor White
    Write-Host "2. Desactivar VPN temporalmente" -ForegroundColor White
    Write-Host "3. Verificar que tu firewall no bloquee ngrok" -ForegroundColor White
    Write-Host "4. Intentar con: npm run start:tunnel" -ForegroundColor White
} else {
    Write-Host "❌ Se encontraron $($problems.Count) problema(s):" -ForegroundColor Red
    Write-Host ""
    for ($i = 0; $i -lt $problems.Count; $i++) {
        Write-Host "   $($i+1). $($problems[$i])" -ForegroundColor Yellow
        Write-Host "      💡 $($solutions[$i])" -ForegroundColor Cyan
        Write-Host ""
    }
    Write-Host ""
    Write-Host "⚠️  SOLUCIÓN MÁS IMPORTANTE:" -ForegroundColor Red
    Write-Host "   Configura tu token de ngrok (paso 2 arriba)" -ForegroundColor Yellow
    Write-Host ""
}

Write-Host ""
Write-Host "📋 Próximos pasos:" -ForegroundColor Cyan
Write-Host ""
Write-Host "1. Si no tienes token, configúralo ahora:" -ForegroundColor White
Write-Host "   - Ve a: https://ngrok.com/ (crea cuenta gratis)" -ForegroundColor Gray
Write-Host "   - Dashboard → Your Authtoken" -ForegroundColor Gray
Write-Host "   - Ejecuta: ngrok authtoken TU_TOKEN" -ForegroundColor Gray
Write-Host ""
Write-Host "2. Verifica la configuración:" -ForegroundColor White
Write-Host "   ngrok config check" -ForegroundColor Gray
Write-Host ""
Write-Host "3. Intenta iniciar de nuevo:" -ForegroundColor White
Write-Host "   npm run start:tunnel" -ForegroundColor Gray
Write-Host ""
