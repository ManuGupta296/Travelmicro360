@echo off
echo Starting Travel360 Microservices...
echo.
REM --- Load secrets (DB_PASSWORD, JWT_SECRET, DB_USERNAME, DB_HOST, DB_PORT) from an untracked .env ---
REM Copy .env.example to .env and fill in real values. .env is gitignored (never committed).
if exist "%~dp0.env" (
  for /f "usebackq eol=# tokens=1,* delims==" %%a in ("%~dp0.env") do set "%%a=%%b"
) else (
  echo WARNING: backend\.env not found. Copy .env.example to .env and set DB_PASSWORD ^(services will use config defaults otherwise^).
)

echo [1/10] Starting Config Server on port 8888...
start "Config" cmd /k "cd config-server && mvn spring-boot:run"
timeout /t 35 /nobreak >nul

echo [2/10] Starting Eureka Server on port 8761...
start "Eureka" cmd /k "cd eureka-server && mvn spring-boot:run"
timeout /t 25 /nobreak >nul

echo [3/10] Starting Auth Service on port 8071...
start "Auth" cmd /k "cd auth-service && mvn spring-boot:run"
timeout /t 15 /nobreak >nul

echo [4/10] Starting Inventory Service on port 8093...
start "Inventory" cmd /k "cd inventory-service && mvn spring-boot:run"
timeout /t 12 /nobreak >nul

echo [5/10] Starting Customer Service on port 8097...
start "Customer" cmd /k "cd customer-service && mvn spring-boot:run"
timeout /t 12 /nobreak >nul

echo [6/10] Starting Notification Service on port 8096...
start "Notification" cmd /k "cd notification-service && mvn spring-boot:run"
timeout /t 12 /nobreak >nul

echo [7/10] Starting Compliance Service on port 8090...
start "Compliance" cmd /k "cd compliance-service && mvn spring-boot:run"
timeout /t 12 /nobreak >nul

echo [8/10] Starting Payment Service on port 8094...
start "Payment" cmd /k "cd payment-service && mvn spring-boot:run"
timeout /t 12 /nobreak >nul

echo [9/10] Starting Booking Service on port 8060...
start "Booking" cmd /k "cd booking-service && mvn spring-boot:run"
timeout /t 15 /nobreak >nul

echo [10/10] Starting API Gateway on port 9090...
start "Gateway" cmd /k "cd api-gateway && mvn spring-boot:run"
timeout /t 15 /nobreak >nul

echo.
echo ========================================================
echo  All services started. Verify endpoints:
echo    Config Server: http://localhost:8888/auth-service/default
echo    Eureka Dashboard: http://localhost:8761
echo    API Gateway: http://localhost:9090
echo  Start frontend separately:
echo    cd frontend ^&^& npm install ^&^& npm start
echo ========================================================
pause
