@echo off
SET "NODE_DIR=C:\Users\glauc\OneDrive - VConsulTI\Documentos\Ferramentas e Dev\eclipse\.node\node-v22.13.1-win-x64"
SET PATH=%NODE_DIR%;%PATH%
cd /d "C:\Users\glauc\OneDrive - VConsulTI\Área de Trabalho\ProjetoBelahub\backend"
"%NODE_DIR%\node.exe" "%NODE_DIR%\node_modules\npm\bin\npm-cli.js" run dev
