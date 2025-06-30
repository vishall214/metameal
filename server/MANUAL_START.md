# Manual Startup Instructions

If the automated scripts don't work, follow these steps to start all services manually:

## Method 1: Three Separate Terminals

### Terminal 1 - Python ML Service
```bash
cd C:\Users\visha\OneDrive\Desktop\metameal\server
python ml_service.py
```
Wait for: "✅ Model loaded successfully" and "Running on http://127.0.0.1:5001"

### Terminal 2 - Node.js Backend
```bash
cd C:\Users\visha\OneDrive\Desktop\metameal\server
npm run dev
```
Wait for: "🚀 Server running on port 5002"

### Terminal 3 - React Frontend
```bash
cd C:\Users\visha\OneDrive\Desktop\metameal\client
npm start
```
Wait for: Browser opens with "http://localhost:3000"

## Method 2: PowerShell (If batch file fails)

Open PowerShell as Administrator and run:
```powershell
cd C:\Users\visha\OneDrive\Desktop\metameal\server
Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser
.\start-all.ps1
```

## Method 3: One-by-One Commands

Copy and paste these commands one by one:

```bash
# Start ML Service
start cmd /k "cd /d C:\Users\visha\OneDrive\Desktop\metameal\server && python ml_service.py"

# Wait 5 seconds, then start Backend
start cmd /k "cd /d C:\Users\visha\OneDrive\Desktop\metameal\server && npm run dev"

# Wait 3 seconds, then start Frontend
start cmd /k "cd /d C:\Users\visha\OneDrive\Desktop\metameal\client && npm start"
```

## Verification

Check that all services are running:
- ML Service: http://localhost:5001/health
- Backend: http://localhost:5002/health
- Frontend: http://localhost:3000

## Success Indicators

- **ML Service**: Shows "✅ Model loaded successfully"
- **Backend**: Shows "🚀 Server running on port 5002"
- **Frontend**: Browser opens automatically to localhost:3000
