#!/bin/bash

# Script para matar todas las instancias del proyecto expenses-web
echo "🔍 Buscando procesos del proyecto expenses-web..."

# Buscar y matar procesos de Angular CLI (ng serve)
echo "Matando procesos de Angular CLI..."
pkill -f "ng serve" 2>/dev/null
pkill -f "angular" 2>/dev/null

# Buscar y matar procesos de Node.js relacionados con el proyecto
echo "Matando procesos de Node.js del proyecto..."
pkill -f "expenses-web" 2>/dev/null

# Buscar y matar procesos en puertos comunes de Angular (4200, 4201, etc.)
echo "Liberando puertos de desarrollo..."
lsof -ti:4200 | xargs kill -9 2>/dev/null
lsof -ti:4201 | xargs kill -9 2>/dev/null
lsof -ti:4202 | xargs kill -9 2>/dev/null

# Buscar procesos de webpack-dev-server
echo "Matando procesos de webpack-dev-server..."
pkill -f "webpack-dev-server" 2>/dev/null

# Buscar procesos de npm/yarn que puedan estar ejecutando el proyecto
echo "Matando procesos de npm relacionados..."
ps aux | grep -i "npm.*serve\|npm.*start\|npm.*dev" | grep -v grep | awk '{print $2}' | xargs kill -9 2>/dev/null

echo "✅ Procesos terminados. El proyecto expenses-web ha sido detenido."
echo "💡 Puedes verificar que no hay procesos ejecutándose con: lsof -i:4200"
