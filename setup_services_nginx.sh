#!/bin/bash

# Obtém o diretório atual como raiz do projeto
PROJECT_ROOT=$(pwd)
CURRENT_USER=$(whoami)
FRONTEND_DEPLOY_PATH="/var/www/healthcheck-frontend"

# --- DETECÇÃO DE EXECUTÁVEIS ---
# Detecta o caminho do Node.js
NODE_PATH=$(which node)
if [ -z "$NODE_PATH" ]; then
    # Fallbacks comuns
    if [ -f "/usr/local/bin/node" ]; then NODE_PATH="/usr/local/bin/node";
    elif [ -f "/usr/bin/node" ]; then NODE_PATH="/usr/bin/node";
    else echo "ERRO: 'node' não encontrado."; exit 1; fi
fi

# Detecta o caminho do NPM
NPM_PATH=$(which npm)
if [ -z "$NPM_PATH" ]; then
    if [ -f "/usr/local/bin/npm" ]; then NPM_PATH="/usr/local/bin/npm";
    elif [ -f "/usr/bin/npm" ]; then NPM_PATH="/usr/bin/npm";
    else echo "ERRO: 'npm' não encontrado."; exit 1; fi
fi

echo "=== Configurando HealthCheck (Produção/TypeScript) ==="
echo "Raiz: $PROJECT_ROOT"
echo "Node: $NODE_PATH"
echo "NPM:  $NPM_PATH"

# --- 0. Limpeza ---
echo "--- 0. Limpando serviços antigos ---"
SERVICES=("healthcheck-backend" "healthcheck-frontend" "healthcheck-ia-heart" "healthcheck-ia-sleep" "cardiocheck-backend" "cardiocheck-frontend" "cardiocheck-ia-heart" "cardiocheck-ia-sleep")

for SERVICE in "${SERVICES[@]}"; do
    if systemctl list-units --full -all | grep -q "$SERVICE.service"; then
        sudo systemctl stop $SERVICE
        sudo systemctl disable $SERVICE
        if [ -f "/etc/systemd/system/$SERVICE.service" ]; then
            sudo rm "/etc/systemd/system/$SERVICE.service"
        fi
    fi
done
sudo systemctl daemon-reload

# --- 1. Dependências do Sistema ---
echo "--- 1. Instalando dependências do SO ---"
sudo apt-get update
sudo apt-get install -y nginx python3-venv

# --- 2. Configuração IA (Python Venv) ---
echo "--- 2. Configurando IA (Venv) ---"
cd "$PROJECT_ROOT/ia" || exit
if [ ! -d "venv" ]; then python3 -m venv venv; fi
./venv/bin/pip install --upgrade pip
if [ -f "requirements.txt" ]; then ./venv/bin/pip install -r requirements.txt; fi
VENV_PYTHON="$PROJECT_ROOT/ia/venv/bin/python"

# --- 3. Backend (Build TypeScript) ---
echo "--- 3. Configurando Backend (Install & Build) ---"
cd "$PROJECT_ROOT/backend" || exit

# 3.1 Instala dependências
echo "Instalando node_modules..."
npm install

# 3.2 Compila o TypeScript (Gera a pasta dist/)
echo "Compilando TypeScript (npm run build)..."
if npm run build; then
    echo "Build do backend concluído com sucesso."
else
    echo "ERRO: Falha ao compilar o backend. Verifique se 'tsc' está nas devDependencies."
    exit 1
fi

# Verifica se a pasta dist foi criada
if [ ! -d "dist" ]; then
    echo "ERRO: Pasta 'dist' não encontrada após o build. Verifique seu tsconfig.json."
    exit 1
fi

# --- 4. Frontend (Build) ---
# echo "--- 4. Configurando Frontend (Install & Build) ---"
# cd "$PROJECT_ROOT/frontend" || exit
# if [ ! -d "node_modules" ]; then npm install; fi
# npm run build
# if [ ! -d "dist" ]; then echo "ERRO: Falha no build do frontend."; exit 1; fi

# --- 5. Deploy Frontend (Nginx) ---
echo "--- 5. Configurando Nginx ---"
sudo mkdir -p $FRONTEND_DEPLOY_PATH
sudo rm -rf $FRONTEND_DEPLOY_PATH/*
# sudo cp -r dist/* $FRONTEND_DEPLOY_PATH/
sudo chown -R www-data:www-data $FRONTEND_DEPLOY_PATH
sudo chmod -R 755 $FRONTEND_DEPLOY_PATH

sudo bash -c "cat > /etc/nginx/sites-available/healthcheck <<EOF
server {
    listen 80;
    server_name _; 
    root $FRONTEND_DEPLOY_PATH;
    index index.html;
    location / {
        try_files \$uri \$uri/ /index.html;
    }
}
EOF"
sudo ln -sf /etc/nginx/sites-available/healthcheck /etc/nginx/sites-enabled/
if [ -f /etc/nginx/sites-enabled/default ]; then sudo rm /etc/nginx/sites-enabled/default; fi
sudo nginx -t && sudo systemctl restart nginx

# --- 6. Criação dos Serviços (Systemd) ---
echo "--- 6. Criando serviços Systemd ---"

# Backend Service
# Aqui usamos o npm start que você configurou (que roda o código compilado)
# Ou podemos rodar direto: ExecStart=$NODE_PATH dist/app.js
echo "Configurando HealthCheck Backend..."
sudo bash -c "cat > /etc/systemd/system/healthcheck-backend.service <<EOF
[Unit]
Description=HealthCheck Backend Service
After=network.target

[Service]
Type=simple
User=$CURRENT_USER
WorkingDirectory=$PROJECT_ROOT/backend
# Opção A: Usar npm start (Se o package.json tiver 'start': 'node dist/app.js')
# ExecStart=$NPM_PATH start
# Opção B (Alternativa direta se a Opção A falhar):
ExecStart=$NODE_PATH dist/app.js
Restart=on-failure
Environment=NODE_ENV=production

[Install]
WantedBy=multi-user.target
EOF"

# IA Heart
echo "Configurando HealthCheck IA Heart..."
sudo bash -c "cat > /etc/systemd/system/healthcheck-ia-heart.service <<EOF
[Unit]
Description=HealthCheck AI Heart Consumer
After=network.target

[Service]
Type=simple
User=$CURRENT_USER
WorkingDirectory=$PROJECT_ROOT/ia
ExecStart=$VENV_PYTHON heart/ia_consumer_heart.py
Restart=on-failure

[Install]
WantedBy=multi-user.target
EOF"

# IA Sleep
echo "Configurando HealthCheck IA Sleep..."
sudo bash -c "cat > /etc/systemd/system/healthcheck-ia-sleep.service <<EOF
[Unit]
Description=HealthCheck AI Sleep Consumer
After=network.target

[Service]
Type=simple
User=$CURRENT_USER
WorkingDirectory=$PROJECT_ROOT/ia
ExecStart=$VENV_PYTHON sleep/ia_consumer_sleep.py
Restart=on-failure

[Install]
WantedBy=multi-user.target
EOF"

# --- Finalização ---
echo "--- 7. Iniciando Serviços ---"
sudo systemctl daemon-reload
sudo systemctl enable healthcheck-backend healthcheck-ia-heart healthcheck-ia-sleep
sudo systemctl start healthcheck-backend healthcheck-ia-heart healthcheck-ia-sleep

echo "=== Configuração Concluída! ==="
echo "Backend Build: OK (Pasta dist/ gerada)"
echo "Status Backend: sudo systemctl status healthcheck-backend"