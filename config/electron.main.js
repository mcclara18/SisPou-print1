const { app, BrowserWindow } = require('electron');
const path = require('path');
const { spawn } = require('child_process');
const http = require('http');

let serverProcess;
let mainWindow;

function startBackend() {
  const serverPath = path.join(__dirname, '..', 'server', 'server.js');
  const projectRoot = path.join(__dirname, '..');
  
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
    console.log('⏳ Waiting for server to be ready...');
    await waitForServer(serverUrl);
    console.log('📂 Loading URL:', serverUrl);
    mainWindow.loadURL(serverUrl);
  } catch (error) {
    console.error('❌ Error:', error.message);
    mainWindow.loadURL(serverUrl);
  }

  mainWindow.on('closed', () => {
    mainWindow = null;
  });
}

app.on('ready', () => {
  console.log('🚀 SISPOU Desktop Application Starting...');
  startBackend();
  
  // Delay para garantir que o backend está rodando antes de criar a janela
  setTimeout(createWindow, 2000);
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    console.log('👋 Closing SISPOU...');
    app.quit();
  }
});

app.on('will-quit', () => {
  if (serverProcess) {
    console.log('🛑 Stopping backend server...');
    serverProcess.kill();
  }
});

app.on('activate', () => {
  if (mainWindow === null) {
    createWindow();
  }
});

// Tratamento de erros não capturados
process.on('uncaughtException', (error) => {
  console.error('❌ Uncaught Exception:', error);
});
