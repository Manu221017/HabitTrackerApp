# Script para configurar ngrok correctamente
# Uso: .\setup-ngrok.ps1

Write-Host "Configuracion de ngrok" -ForegroundColor Cyan
Write-Host "================================================" -ForegroundColor Cyan
Write-Host ""

# Verificar si ngrok esta instalado
Write-Host "1. Verificando instalacion..." -ForegroundColor Yellow
try {
    $version = ngrok version 2>&1
    if ($LASTEXITCODE -eq 0) {
        Write-Host "   OK ngrok esta instalado: $version" -ForegroundColor Green
    } else {
        Write-Host "   ERROR ngrok no esta instalado" -ForegroundColor Red
        Write-Host "   Instala con: npm install -g ngrok" -ForegroundColor Yellow
        exit 1
    }
} catch {
    Write-Host "   ERROR ngrok no esta instalado" -ForegroundColor Red
    Write-Host "   Instala con: npm install -g ngrok" -ForegroundColor Yellow
    exit 1
}

Write-Host ""

# Verificar configuracion actual
Write-Host "2. Verificando configuracion actual..." -ForegroundColor Yellow
$configPath = "$env:USERPROFILE\.ngrok2\ngrok.yml"
$hasConfig = Test-Path $configPath

if ($hasConfig) {
    Write-Host "   Advertencia: Archivo de configuracion encontrado pero con errores" -ForegroundColor Yellow
    Write-Host "   Se creara una nueva configuracion" -ForegroundColor Gray
}

Write-Host ""

# Solicitar token
Write-Host "3. Configuracion del token" -ForegroundColor Yellow
Write-Host ""
Write-Host "   Para obtener tu token:" -ForegroundColor White
Write-Host "   1. Ve a: https://ngrok.com/" -ForegroundColor Gray
Write-Host "   2. Crea una cuenta gratuita (Sign up)" -ForegroundColor Gray
Write-Host "   3. Dashboard -> Your Authtoken" -ForegroundColor Gray
Write-Host "   4. Copia tu token" -ForegroundColor Gray
Write-Host ""

$token = Read-Host "   Ingresa tu token de ngrok (o presiona Enter para usar modo LAN)"

if ([string]::IsNullOrWhiteSpace($token)) {
    Write-Host ""
    Write-Host "   Advertencia: No se configuro token. Usaras modo LAN en su lugar." -ForegroundColor Yellow
    Write-Host ""
    Write-Host "   Para usar tunnel mas adelante, ejecuta:" -ForegroundColor Cyan
    Write-Host "      ngrok authtoken TU_TOKEN" -ForegroundColor Gray
    Write-Host ""
    Write-Host "   Por ahora, usa: npm run start:lan" -ForegroundColor Green
    exit 0
}

# Configurar el token
Write-Host ""
Write-Host "   Configurando token..." -ForegroundColor Yellow
try {
    $result = ngrok authtoken $token 2>&1
    if ($LASTEXITCODE -eq 0) {
        Write-Host "   OK Token configurado correctamente" -ForegroundColor Green
    } else {
        Write-Host "   ERROR al configurar token: $result" -ForegroundColor Red
        exit 1
    }
} catch {
    Write-Host "   ERROR al configurar token: $_" -ForegroundColor Red
    exit 1
}

Write-Host ""

# Verificar configuracion
Write-Host "4. Verificando configuracion..." -ForegroundColor Yellow
try {
    $check = ngrok config check 2>&1
    if ($LASTEXITCODE -eq 0) {
        Write-Host "   OK Configuracion valida" -ForegroundColor Green
    } else {
        Write-Host "   Advertencia: $check" -ForegroundColor Yellow
        Write-Host "   Esto puede funcionar de todas formas" -ForegroundColor Gray
    }
} catch {
    Write-Host "   No se pudo verificar, pero el token esta configurado" -ForegroundColor Yellow
}

Write-Host ""
Write-Host "================================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "OK Configuracion completada!" -ForegroundColor Green
Write-Host ""
Write-Host "Ahora puedes usar:" -ForegroundColor White
Write-Host "   npm run start:tunnel" -ForegroundColor Gray
Write-Host ""
Write-Host "O si prefieres modo LAN (mas rapido):" -ForegroundColor White
Write-Host "   npm run start:lan" -ForegroundColor Gray
Write-Host ""
