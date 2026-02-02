# Script simplificado para configurar ngrok paso a paso
# Uso: .\configurar-ngrok-simple.ps1

Write-Host "Configuracion de ngrok para Expo Go" -ForegroundColor Cyan
Write-Host "================================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "Como necesitas tunnel para Expo Go, vamos a configurarlo correctamente." -ForegroundColor White
Write-Host ""

# Verificar instalacion
Write-Host "1. Verificando ngrok..." -ForegroundColor Yellow
try {
    $version = ngrok version 2>&1
    if ($LASTEXITCODE -eq 0) {
        Write-Host "   OK ngrok instalado: $version" -ForegroundColor Green
    } else {
        Write-Host "   ERROR ngrok no esta instalado" -ForegroundColor Red
        Write-Host "   Instalando ngrok..." -ForegroundColor Yellow
        npm install -g ngrok
        if ($LASTEXITCODE -ne 0) {
            Write-Host "   ERROR al instalar ngrok" -ForegroundColor Red
            exit 1
        }
    }
} catch {
    Write-Host "   ERROR ngrok no esta instalado" -ForegroundColor Red
    Write-Host "   Instalando ngrok..." -ForegroundColor Yellow
    npm install -g ngrok
}

Write-Host ""

# Verificar si ya tiene token
Write-Host "2. Verificando token existente..." -ForegroundColor Yellow
$hasToken = $false
try {
    $configCheck = ngrok config check 2>&1
    if ($LASTEXITCODE -eq 0) {
        Write-Host "   OK Ya tienes un token configurado" -ForegroundColor Green
        $hasToken = $true
    } else {
        Write-Host "   ERROR No hay token configurado" -ForegroundColor Red
    }
} catch {
    Write-Host "   ERROR No hay token configurado" -ForegroundColor Red
}

Write-Host ""

if (-not $hasToken) {
    Write-Host "3. Configuracion del token" -ForegroundColor Yellow
    Write-Host ""
    Write-Host "   Pasos para obtener tu token:" -ForegroundColor Cyan
    Write-Host ""
    Write-Host "   Paso 1: Abre tu navegador y ve a:" -ForegroundColor White
    Write-Host "          https://ngrok.com/" -ForegroundColor Gray
    Write-Host ""
    Write-Host "   Paso 2: Clic en Sign up (registro gratuito)" -ForegroundColor White
    Write-Host "          Puedes usar Google/GitHub para registro rapido" -ForegroundColor Gray
    Write-Host ""
    Write-Host "   Paso 3: Una vez dentro del dashboard:" -ForegroundColor White
    Write-Host "          Ve a Getting Started o Your Authtoken" -ForegroundColor Gray
    Write-Host ""
    Write-Host "   Paso 4: Copia tu token (algo como: 2abc123def456...)" -ForegroundColor White
    Write-Host ""
    Write-Host "   ------------------------------------------------" -ForegroundColor Gray
    Write-Host ""
    
    $token = Read-Host "   Pega tu token aqui (o presiona Enter para abrir ngrok.com)"
    
    if ([string]::IsNullOrWhiteSpace($token)) {
        Write-Host ""
        Write-Host "   Abriendo ngrok.com en tu navegador..." -ForegroundColor Yellow
        Start-Process "https://ngrok.com/"
        Write-Host ""
        Write-Host "   Espera a que te registres y obtengas tu token..." -ForegroundColor Yellow
        Write-Host ""
        $token = Read-Host "   Ahora pega tu token aqui"
    }
    
    if ([string]::IsNullOrWhiteSpace($token)) {
        Write-Host ""
        Write-Host "   ERROR No se ingreso token. Configuracion cancelada." -ForegroundColor Red
        Write-Host "   Puedes configurarlo mas tarde con: ngrok authtoken TU_TOKEN" -ForegroundColor Yellow
        exit 0
    }
    
    Write-Host ""
    Write-Host "   Configurando token..." -ForegroundColor Yellow
    
    try {
        $result = ngrok authtoken $token 2>&1
        if ($LASTEXITCODE -eq 0) {
            Write-Host "   OK Token configurado correctamente!" -ForegroundColor Green
        } else {
            Write-Host "   ERROR: $result" -ForegroundColor Red
            Write-Host "   Verifica que el token sea correcto" -ForegroundColor Yellow
            exit 1
        }
    } catch {
        Write-Host "   ERROR al configurar: $_" -ForegroundColor Red
        exit 1
    }
} else {
    Write-Host "3. Token ya configurado, saltando..." -ForegroundColor Green
}

Write-Host ""
Write-Host "================================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "OK Configuracion completada!" -ForegroundColor Green
Write-Host ""
Write-Host "Ahora puedes usar tunnel:" -ForegroundColor Cyan
Write-Host "   npm run start:tunnel" -ForegroundColor Gray
Write-Host ""
Write-Host "O usa el inicio inteligente:" -ForegroundColor Cyan
Write-Host "   npm start" -ForegroundColor Gray
Write-Host ""
Write-Host "El tunnel ahora deberia funcionar correctamente" -ForegroundColor Yellow
Write-Host ""
