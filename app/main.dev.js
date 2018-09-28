/* eslint global-require: 0 */

/**
 * This module executes inside of electron's main process. You can start
 * electron renderer process from here and communicate with the other processes
 * through IPC.
 *
 * When running `yarn build` or `yarn build-main`, this file is compiled to
 * `./app/main.prod.js` using webpack. This gives us some performance wins.
 *
 */
import { app, BrowserWindow, ipcMain, Menu, Tray } from 'electron';
import moment from 'moment';
import net from 'net';
import tls from 'tls';

import MenuBuilder from './menu';

let mainWindow = null;

if (process.env.NODE_ENV === 'production') {
  const sourceMapSupport = require('source-map-support');
  sourceMapSupport.install();
}

if (
  process.env.NODE_ENV === 'development' ||
  process.env.DEBUG_PROD === 'true'
) {
  require('electron-debug')();
  const path = require('path');
  const p = path.join(__dirname, '..', 'app', 'node_modules');
  require('module').globalPaths.push(p);
}

const installExtensions = async () => {
  const installer = require('electron-devtools-installer');
  const forceDownload = !!process.env.UPGRADE_EXTENSIONS;
  const extensions = ['REACT_DEVELOPER_TOOLS', 'REDUX_DEVTOOLS'];

  return Promise.all(
    extensions.map(name => installer.default(installer[name], forceDownload)),
  ).catch(console.log);
};

/**
 * Add event listeners...
 */

app.on('window-all-closed', () => {
  // Respect the OSX convention of having the application in memory even
  // after all windows have been closed
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.commandLine.appendSwitch('disable-renderer-backgrounding');
app.on('ready', async () => {
  if (
    process.env.NODE_ENV === 'development' ||
    process.env.DEBUG_PROD === 'true'
  ) {
    await installExtensions();
  }

  mainWindow = new BrowserWindow({
    show: false,
    width: 800,
    height: 575,
  });

  mainWindow.loadURL(`file://${__dirname}/app.html`);

  mainWindow.webContents.on('did-finish-load', () => {
    if (!mainWindow) {
      throw new Error('"mainWindow" is not defined');
    }
    if (process.env.START_MINIMIZED) {
      mainWindow.minimize();
    } else {
      mainWindow.show();
      mainWindow.focus();
    }
  });

  mainWindow.on('closed', () => {
    mainWindow = null;
  });

  mainWindow.on('minimize', (event) => {
    event.preventDefault();

    const tray = new Tray(`${__dirname}/app.png`);
    tray.setToolTip('OnamaeClient');
    tray.setContextMenu(Menu.buildFromTemplate([
      {
        label: 'Open',
        click: () => {
          mainWindow.show();
          tray.destroy();
        },
      },
      {
        label: 'Run All',
        click: () => {
          mainWindow.webContents.send('menu:clickRunAll');
        },
      },
      {
        label: 'Exit',
        click: () => {
          mainWindow.close();
        },
      },
    ]));

    mainWindow.hide();
  });

  const menuBuilder = new MenuBuilder(mainWindow);
  menuBuilder.buildMenu();
});

/**
 * IPC Connections
 */

const sendRequest = (tlsSocket, req) => new Promise((resolve, reject) => {
  tlsSocket.once('data', (str) => {
    const end = str.indexOf(' ');
    const response = {
      status: parseInt(str.substring(0, end), 10),
      message: str.substring(end + 1, str.length - 3),
      raw: str,
    };
    if (response.status === 0) {
      resolve(response);
    } else {
      reject(response);
    }
  });
  tlsSocket.write(`\n${req}\n.`);
});


ipcMain.on('onamae:modIP', (event, setting, task) => {
  const tlsSocket = tls.connect(setting.update.port, setting.update.host);
  tlsSocket.setEncoding('utf8');
  tlsSocket.on('secureConnect', async () => {
    try {
      await sendRequest(tlsSocket, `LOGIN\nUSERID:${task.user.id}\nPASSWORD:${task.user.pass}`);
    } catch (e) {
      event.sender.send('onamae:modIP:res', 'Login failed', false);
      tlsSocket.end();
      return;
    }
    const ip = task.ip.type === 'default' ? setting.$data.ip : task.ip.customIP;
    try {
      await sendRequest(tlsSocket, `MODIP\nHOSTNAME:${task.host.subdomain}\nDOMNAME:${task.host.domain}\nIPV4:${ip}`);
    } catch (e) {
      event.sender.send('onamae:modIP:res', 'Modify ip failed', false);
      tlsSocket.end();
      return;
    }
    try {
      await sendRequest(tlsSocket, 'LOGOUT');
      event.sender.send('onamae:modIP:res', 'Success', true, ip);
    } catch (e) {
      event.sender.send('onamae:modIP:res', e.message, false);
    }
    tlsSocket.end();
  });
});

ipcMain.on('onamae:getIP', (event, setting) => {
  const socket = net.connect(setting.check.port, setting.check.host);
  socket.setEncoding('utf8');
  socket.on('data', (str) => {
    // eslint-disable-next-line
    event.sender.send('onamae:getIP:res', str.substring(6, str.length - 3));
    socket.end();
  });
});

let timerId = null;
ipcMain.on('onamae:setTimer', (event, nextTime) => {
  if (timerId) clearTimeout(timerId);
  const next = moment(nextTime, 'YYYY/MM/DD HH:mm:ss').valueOf();
  const now = Date.now().valueOf();
  timerId = setTimeout(() => {
    mainWindow.webContents.send('menu:clickRunAll');
  }, next - now);
});
