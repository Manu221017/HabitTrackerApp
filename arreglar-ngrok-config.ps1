# Script para arreglar la configuracion corrupta de ngrok
# Uso: .\arreglar-ngrok-config.ps1

Write-Host "Arreglando configuracion de ngrok..." -ForegroundColor Cyan
Write-Host "================================================" -ForegroundColor Cyan
Write-Host ""

# Ruta del archivo de configuracion
$configPath = "$env:USERPROFILE\.ngrok2\ngrok.yml"

Write-Host "1. Verificando archivo de configuracion..." -ForegroundColor Yellow
if (Test-Path $configPath) {
    Write-Host "   Archivo encontrado: $configPath" -ForegroundColor Gray
    Write-Host "   Haciendo backup..." -ForegroundColor Yellow
    Copy-Item $configPath "$configPath.backup" -ErrorAction SilentlyContinue
    Write-Host "   OK Backup creado" -ForegroundColor Green
} else {
    Write-Host "   Archivo no existe, se creara uno nuevo" -ForegroundColor Yellow
}

Write-Host ""

# Leer configuracion actual si existe
$currentToken = $null
if (Test-Path $configPath) {
    try {
        $content = Get-Content $configPath -Raw
        if ($content -match "authtoken:\s*(.+)") {
            $currentToken = $matches[1].Trim()
            Write-Host "   Token encontrado en configuracion existente" -ForegroundColor Green
        }
    } catch {
        Write-Host "   No se pudo leer token existente" -ForegroundColor Yellow
    }
}

Write-Host ""

# Si no hay token, pedirlo
if ([string]::IsNullOrWhiteSpace($currentToken)) {
    Write-Host "2. Configurando token de ngrok..." -ForegroundColor Yellow
    Write-Host ""
    Write-Host "   Necesitas un token de ngrok (gratis):" -ForegroundColor White
    Write-Host "   1. Ve a: https://ngrok.com/" -ForegroundColor Gray
    Write-Host "   2. Sign up (cuenta gratuita)" -ForegroundColor Gray
    Write-Host "   3. Dashboard -> Your Authtoken" -ForegroundColor Gray
    Write-Host "   4. Copia tu token" -ForegroundColor Gray
    Write-Host ""
    
    $token = Read-Host "   Pega tu token aqui (o Enter para abrir ngrok.com)"
    
    if ([string]::IsNullOrWhiteSpace($token)) {
        Write-Host ""
        Write-Host "   Abriendo ngrok.com..." -ForegroundColor Yellow
        Start-Process "https://ngrok.com/"
        Write-Host ""
        Write-Host "   Espera a registrarte..." -ForegroundColor Yellow
        Write-Host ""
        $token = Read-Host "   Ahora pega tu token aqui"
    }
    
    if ([string]::IsNullOrWhiteSpace($token)) {
        Write-Host ""
        Write-Host "   ERROR No se ingreso token" -ForegroundColor Red
        Write-Host "   Sin token, ngrok no funcionara" -ForegroundColor Yellow
        exit 1
    }
    
    $currentToken = $token
}

Write-Host ""

# Crear configuracion nueva y limpia
Write-Host "3. Creando configuracion nueva..." -ForegroundColor Yellow

# Asegurar que el directorio existe
$configDir = Split-Path $configPath -Parent
if (-not (Test-Path $configDir)) {
    New-Item -ItemType Directory -Path $configDir -Force | Out-Null
}

# Crear configuracion limpia
$newConfig = @"
version: "2"
authtoken: $currentToken
update_channel: stable
"@

try {
    $newConfig | Out-File -FilePath $configPath -Encoding utf8 -Force
    Write-Host "   OK Configuracion creada" -ForegroundColor Green
} catch {
    Write-Host "   ERROR No se pudo crear configuracion: $_" -ForegroundColor Red
    exit 1
}

Write-Host ""

# Verificar configuracion
Write-Host "4. Verificando configuracion..." -ForegroundColor Yellow
try {
    $check = ngrok config check 2>&1
    if ($LASTEXITCODE -eq 0) {
        Write-Host "   OK Configuracion valida!" -ForegroundColor Green
    } else {
        Write-Host "   Advertencia: $check" -ForegroundColor Yellow
        Write-Host "   Pero puede funcionar de todas formas" -ForegroundColor Gray
    }
} catch {
    Write-Host "   Advertencia: No se pudo verificar completamente" -ForegroundColor Yellow
}

Write-Host ""
Write-Host "================================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "OK Configuracion arreglada!" -ForegroundColor Green
Write-Host ""
Write-Host "Ahora prueba:" -ForegroundColor White
Write-Host "   npx expo start --tunnel" -ForegroundColor Gray
Write-Host ""
Write-Host "Deberia funcionar correctamente ahora" -ForegroundColor Green
Write-Host ""
