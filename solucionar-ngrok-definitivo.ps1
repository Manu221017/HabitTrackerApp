# Script definitivo para solucionar problemas de ngrok
# Uso: .\solucionar-ngrok-definitivo.ps1

Write-Host "================================================" -ForegroundColor Cyan
Write-Host "Solucionador Definitivo de ngrok" -ForegroundColor Cyan
Write-Host "================================================" -ForegroundColor Cyan
Write-Host ""

# Paso 1: Cerrar procesos de ngrok
Write-Host "1. Cerrando procesos de ngrok existentes..." -ForegroundColor Yellow
$ngrokProcesses = Get-Process | Where-Object {$_.ProcessName -like "*ngrok*"}
if ($ngrokProcesses) {
    Write-Host "   Encontrados procesos de ngrok, cerrandolos..." -ForegroundColor Yellow
    $ngrokProcesses | Stop-Process -Force -ErrorAction SilentlyContinue
    Start-Sleep -Seconds 2
    Write-Host "   OK Procesos cerrados" -ForegroundColor Green
} else {
    Write-Host "   OK No hay procesos de ngrok corriendo" -ForegroundColor Green
}

Write-Host ""

# Paso 2: Verificar instalacion de ngrok
Write-Host "2. Verificando instalacion de ngrok..." -ForegroundColor Yellow
try {
    $version = ngrok version 2>&1
    if ($LASTEXITCODE -eq 0) {
        Write-Host "   OK ngrok instalado: $version" -ForegroundColor Green
    } else {
        Write-Host "   ERROR ngrok no esta instalado" -ForegroundColor Red
        Write-Host "   Instalando ngrok..." -ForegroundColor Yellow
        npm install -g ngrok
        if ($LASTEXITCODE -ne 0) {
            Write-Host "   ERROR No se pudo instalar ngrok" -ForegroundColor Red
            exit 1
        }
    }
} catch {
    Write-Host "   ERROR ngrok no esta instalado" -ForegroundColor Red
    Write-Host "   Instalando ngrok..." -ForegroundColor Yellow
    npm install -g ngrok
}

Write-Host ""

# Paso 3: Verificar token
Write-Host "3. Verificando token de ngrok..." -ForegroundColor Yellow
$hasToken = $false
try {
    $configCheck = ngrok config check 2>&1
    if ($LASTEXITCODE -eq 0) {
        Write-Host "   OK Token configurado correctamente" -ForegroundColor Green
        $hasToken = $true
    } else {
        Write-Host "   ERROR Token NO configurado" -ForegroundColor Red
        Write-Host "   Este es el problema principal!" -ForegroundColor Yellow
    }
} catch {
    Write-Host "   ERROR Token NO configurado" -ForegroundColor Red
}

Write-Host ""

# Paso 4: Configurar token si no existe
if (-not $hasToken) {
    Write-Host "4. Configurando token de ngrok..." -ForegroundColor Yellow
    Write-Host ""
    Write-Host "   IMPORTANTE: Necesitas un token de ngrok para que funcione" -ForegroundColor Red
    Write-Host ""
    Write-Host "   Pasos:" -ForegroundColor Cyan
    Write-Host "   1. Ve a: https://ngrok.com/" -ForegroundColor White
    Write-Host "   2. Clic en 'Sign up' (cuenta gratuita)" -ForegroundColor White
    Write-Host "   3. Una vez dentro, ve a 'Your Authtoken'" -ForegroundColor White
    Write-Host "   4. Copia tu token" -ForegroundColor White
    Write-Host ""
    
    $token = Read-Host "   Pega tu token aqui (o Enter para abrir ngrok.com)"
    
    if ([string]::IsNullOrWhiteSpace($token)) {
        Write-Host ""
        Write-Host "   Abriendo ngrok.com..." -ForegroundColor Yellow
        Start-Process "https://ngrok.com/"
        Write-Host ""
        Write-Host "   Espera a registrarte y obtener tu token..." -ForegroundColor Yellow
        Write-Host ""
        $token = Read-Host "   Ahora pega tu token aqui"
    }
    
    if (-not [string]::IsNullOrWhiteSpace($token)) {
        Write-Host ""
        Write-Host "   Configurando token..." -ForegroundColor Yellow
        $result = ngrok authtoken $token 2>&1
        if ($LASTEXITCODE -eq 0) {
            Write-Host "   OK Token configurado correctamente!" -ForegroundColor Green
            $hasToken = $true
        } else {
            Write-Host "   ERROR: $result" -ForegroundColor Red
            Write-Host "   Verifica que el token sea correcto" -ForegroundColor Yellow
            exit 1
        }
    } else {
        Write-Host ""
        Write-Host "   ERROR No se configuro token" -ForegroundColor Red
        Write-Host "   Sin token, ngrok no funcionara correctamente" -ForegroundColor Yellow
        exit 1
    }
} else {
    Write-Host "4. Token ya configurado, saltando..." -ForegroundColor Green
}

Write-Host ""

# Paso 5: Verificar configuracion final
Write-Host "5. Verificando configuracion final..." -ForegroundColor Yellow
try {
    $finalCheck = ngrok config check 2>&1
    if ($LASTEXITCODE -eq 0) {
        Write-Host "   OK Configuracion valida" -ForegroundColor Green
    } else {
        Write-Host "   Advertencia: $finalCheck" -ForegroundColor Yellow
        Write-Host "   Pero puede funcionar de todas formas" -ForegroundColor Gray
    }
} catch {
    Write-Host "   Advertencia: No se pudo verificar completamente" -ForegroundColor Yellow
}

Write-Host ""
Write-Host "================================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "OK Configuracion completada!" -ForegroundColor Green
Write-Host ""
Write-Host "Ahora prueba:" -ForegroundColor White
Write-Host "   npx expo start --tunnel" -ForegroundColor Gray
Write-Host ""
Write-Host "O usa:" -ForegroundColor White
Write-Host "   npm run start:tunnel" -ForegroundColor Gray
Write-Host ""
