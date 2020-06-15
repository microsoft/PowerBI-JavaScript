setlocal enabledelayedexpansion
pushd "%~dp0\.."
powershell.exe -ExecutionPolicy Unrestricted -NoProfile -WindowStyle Hidden -NonInteractive -File "%~dp0%~1"
endlocal
popd
exit /B %ERRORLEVEL%
