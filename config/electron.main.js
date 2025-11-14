const { app, BrowserWindow } = require('electron');
const path = require('path');
const { spawn } = require('child_process');
const http = require('http');

let serverProcess;

function startBackend() {
  const serverPath = path.join(__dirname, '..', 'server', 'server.js');
  serverProcess = spawn(process.execPath, [serverPath], {
    cwd: path.join(__dirname, '..', 'server'),
    stdio: 'inherit' 
  });

  serverProcess.on('error', (err) => {
    console.error('Falha ao iniciar o backend:', err);
  });
}

function waitForServer(url, timeout = 20000) {
  return new Promise((resolve, reject) => {
    const startTime = Date.now();
    const check = () => {
      http.get(url, (res) => {
        if (res.statusCode === 200) {
          resolve();
        } else {
          retry();
        }
      }).on('error', retry);
    };

    const retry = () => {
      if (Date.now() - startTime > timeout) {
        reject(new Error('Timeout esperando pelo servidor backend.'));
      } else {
        setTimeout(check, 500);
      }
    };
    
    check();
  });
}

async function createWindow() {
  const mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
    }
  });

  const serverUrl = 'http://localhost:3000';

  try {
    await waitForServer(serverUrl);
    mainWindow.loadURL(serverUrl);
  } catch (error) {
    console.error(error.message);
    mainWindow.loadURL(serverUrl);
  }
}

app.on('ready', () => {
  startBackend();
  createWindow();
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('will-quit', () => {
  if (serverProcess) {
    serverProcess.kill();
  }
});

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow();
  }
});
