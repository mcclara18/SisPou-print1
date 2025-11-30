const { app, BrowserWindow } = require('electron');
const path = require('path');
const { spawn } = require('child_process');
const http = require('http');

let backendProcess;
let frontendProcess;
let mainWindow;

function startBackend() {
  const backPath = path.join(__dirname, '..', 'server', 'server.js');
  const backRoot = path.join(__dirname, '..'); // back/
  
  console.log('🔧 Starting backend server...');
  
  backendProcess = spawn(process.execPath, [backPath], {
    cwd: backRoot,
    stdio: 'inherit',
    env: { ...process.env, NODE_ENV: 'production' }
  });

  backendProcess.on('error', (err) => {
    console.error('❌ Falha ao iniciar backend:', err);
  });

  backendProcess.on('exit', (code) => {
    console.log(`📤 Backend exited with code ${code}`);
  });
}

function startFrontend() {
  const frontPath = path.join(__dirname, '..', '..', 'front', 'server.js');
  const frontRoot = path.join(__dirname, '..', '..', 'front'); // front/
  
  console.log('🎨 Starting frontend server...');
  
  frontendProcess = spawn(process.execPath, [frontPath], {
    cwd: frontRoot,
    stdio: 'inherit',
    env: { ...process.env, NODE_ENV: 'production' }
  });

  frontendProcess.on('error', (err) => {
    console.error('❌ Falha ao iniciar frontend:', err);
  });

  frontendProcess.on('exit', (code) => {
    console.log(`📤 Frontend exited with code ${code}`);
  });
}

function waitForServer(url, timeout = 30000) {
  return new Promise((resolve, reject) => {
    const startTime = Date.now();
    const check = () => {
      http.get(url, (res) => {
        console.log('✅ Servidor pronto!');
        resolve();
      }).on('error', retry);
    };

    const retry = () => {
      if (Date.now() - startTime > timeout) {
        console.warn('⚠️  Timeout, carregando mesmo assim...');
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

  try {
    console.log('⏳ Aguardando servidores...');
    await waitForServer('http://localhost:3001'); // Backend
    await waitForServer('http://localhost:3000'); // Frontend
    
    console.log('📂 Carregando frontend...');
    mainWindow.loadURL('http://localhost:3000');
  } catch (error) {
    console.error('❌ Erro:', error.message);
    mainWindow.loadURL('http://localhost:3000');
  }

  mainWindow.on('closed', () => {
    mainWindow = null;
  });
}

app.on('ready', () => {
  console.log('🚀 SISPOU iniciando...');
  startBackend();
  startFrontend();
  
  setTimeout(createWindow, 3000);
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    console.log('👋 Fechando SISPOU');
    app.quit();
  }
});

app.on('will-quit', () => {
  if (backendProcess) {
    console.log('🛑 Fechando backend');
    backendProcess.kill();
  }
  if (frontendProcess) {
    console.log('🛑 Fechando frontend');
    frontendProcess.kill();
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
