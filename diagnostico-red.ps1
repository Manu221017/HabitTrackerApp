# Script para diagnosticar por qué LAN no funciona
# Uso: .\diagnostico-red.ps1

Write-Host "🔍 Diagnóstico de Red para Expo Go" -ForegroundColor Cyan
Write-Host "════════════════════════════════════════════════" -ForegroundColor Cyan
Write-Host ""

# 1. Obtener IP local
Write-Host "1️⃣  Obteniendo dirección IP local..." -ForegroundColor Yellow
try {
    $ipAddresses = Get-NetIPAddress -AddressFamily IPv4 | Where-Object {
        $_.IPAddress -notlike "127.*" -and 
        $_.IPAddress -notlike "169.254.*" -and
        $_.PrefixOrigin -eq "Dhcp"
    }
    
    if ($ipAddresses) {
        Write-Host "   ✅ Direcciones IP encontradas:" -ForegroundColor Green
        foreach ($ip in $ipAddresses) {
            Write-Host "      - $($ip.IPAddress) (Interfaz: $($ip.InterfaceAlias))" -ForegroundColor White
        }
        $mainIP = $ipAddresses[0].IPAddress
    } else {
        Write-Host "   ⚠️  No se encontró IP local válida" -ForegroundColor Yellow
        $mainIP = "No encontrada"
    }
} catch {
    Write-Host "   ❌ Error al obtener IP: $_" -ForegroundColor Red
    $mainIP = "Error"
}

Write-Host ""

# 2. Verificar firewall
Write-Host "2️⃣  Verificando firewall de Windows..." -ForegroundColor Yellow
try {
    $firewallStatus = Get-NetFirewallProfile | Select-Object Name, Enabled
    foreach ($profile in $firewallStatus) {
        $status = if ($profile.Enabled) { "✅ Activado" } else { "❌ Desactivado" }
        Write-Host "   $($profile.Name): $status" -ForegroundColor $(if ($profile.Enabled) { "Yellow" } else { "Green" })
    }
    
    Write-Host ""
    Write-Host "   💡 Si el firewall está activado, puede estar bloqueando Expo" -ForegroundColor Yellow
    Write-Host "   💡 Intenta agregar excepción para Node.js y puerto 8081" -ForegroundColor Gray
} catch {
    Write-Host "   ⚠️  No se pudo verificar firewall" -ForegroundColor Yellow
}

Write-Host ""

# 3. Verificar puerto 8081
Write-Host "3️⃣  Verificando puerto 8081..." -ForegroundColor Yellow
try {
    $port8081 = Get-NetTCPConnection -LocalPort 8081 -ErrorAction SilentlyContinue
    if ($port8081) {
        Write-Host "   ✅ Puerto 8081 está en uso" -ForegroundColor Green
        Write-Host "      Estado: $($port8081.State)" -ForegroundColor Gray
    } else {
        Write-Host "   ⚠️  Puerto 8081 no está en uso (Expo no está corriendo)" -ForegroundColor Yellow
    }
} catch {
    Write-Host "   ℹ️  Puerto 8081 disponible" -ForegroundColor Gray
}

Write-Host ""

# 4. Verificar conexión de red
Write-Host "4️⃣  Verificando conexión de red..." -ForegroundColor Yellow
try {
    $networkAdapters = Get-NetAdapter | Where-Object { $_.Status -eq "Up" -and $_.InterfaceDescription -notlike "*Loopback*" }
    if ($networkAdapters) {
        Write-Host "   ✅ Adaptadores de red activos:" -ForegroundColor Green
        foreach ($adapter in $networkAdapters) {
            Write-Host "      - $($adapter.Name) ($($adapter.InterfaceDescription))" -ForegroundColor White
        }
    } else {
        Write-Host "   ❌ No hay adaptadores de red activos" -ForegroundColor Red
    }
} catch {
    Write-Host "   ⚠️  No se pudo verificar adaptadores" -ForegroundColor Yellow
}

Write-Host ""
Write-Host "════════════════════════════════════════════════" -ForegroundColor Cyan
Write-Host ""
Write-Host "📋 DIAGNÓSTICO Y SOLUCIONES:" -ForegroundColor Cyan
Write-Host ""

if ($mainIP -ne "No encontrada" -and $mainIP -ne "Error") {
    Write-Host "✅ Tu IP local es: $mainIP" -ForegroundColor Green
    Write-Host ""
    Write-Host "💡 Para que LAN funcione:" -ForegroundColor Yellow
    Write-Host "   1. Asegúrate de que tu teléfono esté en la misma red WiFi" -ForegroundColor White
    Write-Host "   2. Cuando Expo inicie, debería mostrar: exp://$mainIP:8081" -ForegroundColor White
    Write-Host "   3. Si el QR no funciona, usa 'Enter URL manually' con esa URL" -ForegroundColor White
    Write-Host ""
    Write-Host "🔧 Si LAN sigue sin funcionar:" -ForegroundColor Yellow
    Write-Host "   - Verifica que ambos dispositivos estén en la misma red" -ForegroundColor White
    Write-Host "   - Desactiva VPN temporalmente" -ForegroundColor White
    Write-Host "   - Agrega excepción en firewall para puerto 8081" -ForegroundColor White
    Write-Host "   - Reinicia el router WiFi" -ForegroundColor White
} else {
    Write-Host "⚠️  No se pudo detectar tu IP local" -ForegroundColor Yellow
    Write-Host "   Esto puede indicar problemas de red" -ForegroundColor White
}

Write-Host ""
Write-Host "🔗 SOLUCIÓN ALTERNATIVA (Tunnel):" -ForegroundColor Cyan
Write-Host "   Como necesitas tunnel, configura ngrok:" -ForegroundColor White
Write-Host "   npm run setup:ngrok" -ForegroundColor Gray
Write-Host ""
