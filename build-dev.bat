@echo off
REM Build script for Alkitab Desktop - sets up MSVC environment
call "C:\Program Files (x86)\Microsoft Visual Studio\2022\BuildTools\VC\Auxiliary\Build\vcvarsall.bat" x64
cd /d D:\laragon\www\alkitab
npm run tauri dev
