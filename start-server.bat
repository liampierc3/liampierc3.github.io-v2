@echo off
echo Starting local web server for 3D experience testing...

REM Check if Python is available
where python >nul 2>nul
if %ERRORLEVEL% EQU 0 (
    echo Using Python to start server
    start "" http://localhost:8000/first-person-experience.html
    python -m http.server 8000
    goto :end
)

REM Check if Python command is py instead
where py >nul 2>nul  
if %ERRORLEVEL% EQU 0 (
    echo Using Python (py) to start server
    start "" http://localhost:8000/first-person-experience.html
    py -m http.server 8000
    goto :end
)

REM Check if Node.js is available
where npx >nul 2>nul
if %ERRORLEVEL% EQU 0 (
    echo Using Node.js to start server
    start "" http://localhost:8000/first-person-experience.html
    npx http-server -p 8000
    goto :end
)

echo Error: Couldn't find Python or Node.js to start a server.
echo Please install Python 3 or Node.js and try again.
exit /b 1

:end
echo Server stopped. 