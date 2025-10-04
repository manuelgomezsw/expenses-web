#!/bin/bash

# 🔥 Script para matar todas las instancias de Angular y procesos relacionados

echo "🔍 Buscando procesos de Angular en ejecución..."

# Función para matar procesos de forma segura
kill_processes() {
    local pattern=$1
    local description=$2
    
    pids=$(pgrep -f "$pattern" 2>/dev/null)
    if [ ! -z "$pids" ]; then
        echo "🎯 Encontrados procesos $description: $pids"
        echo "$pids" | xargs kill -TERM 2>/dev/null
        sleep 2
        # Si aún existen, forzar terminación
        remaining_pids=$(pgrep -f "$pattern" 2>/dev/null)
        if [ ! -z "$remaining_pids" ]; then
            echo "💀 Forzando terminación de procesos $description: $remaining_pids"
            echo "$remaining_pids" | xargs kill -KILL 2>/dev/null
        fi
        echo "✅ Procesos $description terminados"
    else
        echo "ℹ️  No se encontraron procesos $description"
    fi
}

# Matar diferentes tipos de procesos Angular
kill_processes "ng serve" "ng serve"
kill_processes "angular" "Angular CLI"
kill_processes "webpack-dev-server" "Webpack Dev Server"
kill_processes "node.*ng" "Node.js ejecutando Angular"
kill_processes "@angular/cli" "Angular CLI"
kill_processes "4200" "procesos en puerto 4200"
kill_processes "4201" "procesos en puerto 4201"

# Matar procesos específicos por puerto
echo "🔍 Verificando puertos ocupados..."

for port in 4200 4201 9222 9223 9224 9225 9226; do
    pid=$(lsof -ti:$port 2>/dev/null)
    if [ ! -z "$pid" ]; then
        echo "🎯 Puerto $port ocupado por PID: $pid"
        kill -TERM $pid 2>/dev/null
        sleep 1
        # Verificar si aún existe
        if kill -0 $pid 2>/dev/null; then
            echo "💀 Forzando terminación del proceso en puerto $port"
            kill -KILL $pid 2>/dev/null
        fi
        echo "✅ Puerto $port liberado"
    fi
done

# Limpiar directorios temporales de Chrome debug
echo "🧹 Limpiando directorios temporales de debug..."
rm -rf .vscode/chrome-debug-* 2>/dev/null
rm -rf /tmp/chrome-debug* 2>/dev/null

# Limpiar caché de Angular si existe
if command -v ng &> /dev/null; then
    echo "🧹 Limpiando caché de Angular..."
    ng cache clean 2>/dev/null || true
fi

echo ""
echo "🎉 ¡Limpieza completada!"
echo "✅ Todas las instancias de Angular han sido terminadas"
echo "✅ Puertos liberados: 4200, 4201, 9222-9226"
echo "✅ Directorios temporales limpiados"
echo ""
echo "🚀 Ahora puedes ejecutar Angular sin conflictos"

