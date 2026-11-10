$ErrorActionPreference = 'Stop'
Set-Location $PSScriptRoot
$env:LOCAL_MODE = 'true'
if (!(Test-Path '.venv\Scripts\python.exe')) { throw 'Create .venv and install requirements-local.txt first.' }
& .venv\Scripts\python.exe backend\manage.py migrate
& .venv\Scripts\python.exe backend\manage.py setup_local
Start-Process -WindowStyle Hidden -FilePath "$PSScriptRoot\.venv\Scripts\python.exe" -ArgumentList 'backend/manage.py runserver 127.0.0.1:8000 --noreload' -WorkingDirectory $PSScriptRoot
Start-Process -WindowStyle Hidden -FilePath "$PSScriptRoot\.venv\Scripts\python.exe" -ArgumentList '-m flask --app ml_service.app run --host 127.0.0.1 --port 5000' -WorkingDirectory $PSScriptRoot
Start-Process -WindowStyle Hidden -FilePath 'node' -ArgumentList 'scripts/dev-frontend.mjs' -WorkingDirectory $PSScriptRoot
Write-Host 'Dashboard: http://localhost:3000/login'
