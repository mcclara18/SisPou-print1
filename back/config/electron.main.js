const { app, BrowserWindow } = require('electron');
const path = require('path');
const { spawn } = require('child_process');
const http = require('http');

let serverProcess;
let mainWindow;

function startBackend() {
  const serverPath = path.join(__dirname, '..', 'server', 'server.js');
  const projectRoot = path.join(__dirname, '..'); // Aponta para back/
  
  console.log('🔧 Starting backend server from:', projectRoot);
  
  serverProcess = spawn(process.execPath, [serverPath], {
    cwd: projectRoot,
    stdio: 'inherit',
    env: { ...process.env, NODE_ENV: 'production' }
  });

  serverProcess.on('error', (err) => {
    console.error('❌ Falha ao iniciar o backend:', err);
  });

  serverProcess.on('exit', (code) => {
    console.log(`📤 Backend process exited with code ${code}`);
  });
}

function waitForServer(url, timeout = 30000) {
  return new Promise((resolve, reject) => {
    const startTime = Date.now();
    const check = () => {
      http.get(url, (res) => {
        if (res.statusCode === 200 || res.statusCode === 404) {
          console.log('✅ Backend server is ready!');
          resolve();
        } else {
          retry();
        }
      }).on('error', retry);
    };

    const retry = () => {
      if (Date.now() - startTime > timeout) {
        console.warn('⚠️  Timeout esperando pelo servidor backend, carregando mesmo assim...');
        resolve();
      } else {
        setTimeout(check, 500);
      }
    };
    
    check();
  });
}

async function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1400,
    height: 900,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      preload: path.join(__dirname, 'preload.js')
    }
  });

  mainWindow.removeMenu();

  const serverUrl = 'http://localhost:3001';

  try {
    console.log('⏳ Aguardando o servidor estar pronto...');
    await waitForServer(serverUrl);
    console.log('📂 Carregando URL:', serverUrl);
    mainWindow.loadURL(serverUrl);
  } catch (error) {
    console.error('❌ Erro:', error.message);
    mainWindow.loadURL(serverUrl);
  }

  mainWindow.on('closed', () => {
    mainWindow = null;
  });
}

app.on('ready', () => {
  console.log('🚀 Aplicação dektop SISPOU iniciando');
  startBackend();
  
  setTimeout(createWindow, 2000);
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    console.log('👋 Fechando SISPOU');
    app.quit();
  }
});

app.on('will-quit', () => {
  if (serverProcess) {
    console.log('🛑 Fechando');
    serverProcess.kill();
  }
});

app.on('activate', () => {
  if (mainWindow === null) {
    createWindow();
  }
});

process.on('uncaughtException', (error) => {
  console.error('❌ Erro inesperado', error);
});
