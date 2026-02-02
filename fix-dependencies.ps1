# Script para arreglar dependencias incompatibles
# Uso: .\fix-dependencies.ps1

Write-Host "Arreglando dependencias de Expo..." -ForegroundColor Cyan
Write-Host "================================================" -ForegroundColor Cyan
Write-Host ""

Write-Host "Este proceso puede tardar unos minutos..." -ForegroundColor Yellow
Write-Host ""

# Ejecutar expo doctor para arreglar dependencias
Write-Host "Ejecutando expo doctor --fix-dependencies..." -ForegroundColor Yellow
npx expo doctor --fix-dependencies

if ($LASTEXITCODE -eq 0) {
    Write-Host ""
    Write-Host "OK Dependencias arregladas!" -ForegroundColor Green
    Write-Host ""
    Write-Host "Ahora puedes ejecutar:" -ForegroundColor White
    Write-Host "   npm start" -ForegroundColor Gray
    Write-Host ""
} else {
    Write-Host ""
    Write-Host "ERROR Hubo un problema al arreglar las dependencias" -ForegroundColor Red
    Write-Host ""
    Write-Host "Intenta manualmente:" -ForegroundColor Yellow
    Write-Host "   npx expo install --fix" -ForegroundColor Gray
    Write-Host ""
}
