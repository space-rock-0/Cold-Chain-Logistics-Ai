Run PowerShell from this directory:

```powershell
C:\Users\Varma\.local\bin\python3.12.exe -m venv .venv
.venv\Scripts\python.exe -m pip install -r requirements-local.txt
npm.cmd ci --prefix frontend
powershell -ExecutionPolicy Bypass -File start-local.ps1
```

Open http://localhost:3000/login. Local users: admin@coldchain.com / admin123 and viewer@coldchain.com / viewer123.
Local mode uses SQLite and an in-process channel layer. Keep one Django process. These accounts are for development.
The startup command preserves existing shipment data. On an empty database, load samples once with:

```powershell
$env:LOCAL_MODE='true'
.venv\Scripts\python.exe backend\manage.py seed_shipments
```

The seed command deletes existing shipments. Do not run it on data you need.
Keys are loaded from the root .env and must never be committed.
Verify with `node scripts/smoke-local.mjs`.
The Flask routes currently use demonstration formulas; trained model integration and production hardening remain separate work.
