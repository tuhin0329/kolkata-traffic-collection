@echo off
title Kolkata Traffic Study - Daily Data and Screenshot Verifier
echo ======================================================================
echo    KOLKATA TRAFFIC STUDY - DAILY VERIFICATION AUDIT
echo ======================================================================
echo.
cd /d "%~dp0"
node daily_end_of_day_verifier.js %*
echo.
pause
