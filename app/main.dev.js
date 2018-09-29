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
import program from 'commander';
import net from 'net';
import tls from 'tls';

import MenuBuilder from './menu';

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

const getIP = (host, port) => new Promise((resolve) => {
  const socket = net.connect(port, host);
  socket.setEncoding('utf8');
  socket.on('data', (str) => {
    resolve(str.substring(6, str.length - 3));
    socket.end();
  });
});

const modIP = (host, port, userId, userPass, ip, domain, subDomain) => new Promise((resolve, reject) => {
  const tlsSocket = tls.connect(port, host);
  tlsSocket.setEncoding('utf8');
  tlsSocket.on('secureConnect', async () => {
    try {
      await sendRequest(tlsSocket, `LOGIN\nUSERID:${userId}\nPASSWORD:${userPass}`);
    } catch (e) {
      reject(new Error('Login failed'));
      tlsSocket.end();
      return;
    }
    try {
      await sendRequest(tlsSocket, `MODIP\nHOSTNAME:${subDomain}\nDOMNAME:${domain}\nIPV4:${ip}`);
    } catch (e) {
      reject(new Error('Modify ip failed'));
      tlsSocket.end();
      return;
    }
    try {
      await sendRequest(tlsSocket, 'LOGOUT');
      resolve(ip);
    } catch (e) {
      reject(new Error(e.message));
    }
    tlsSocket.end();
  });
});

const argv = [...process.argv];
if (argv.length >= 2) {
  argv.shift();
  if (!argv[0].startsWith('-')) argv.shift();
}
program
  .version('1.0.2', '-v, --version')
  .option('-u, --userid <userid>', 'UserID')
  .option('-p, --password <password>', 'Password')
  .option('-d, --domain <domain>', 'Domain')
  .option('-s, --sub-domain [subdomain]', 'SubDomain', v => v, '')
  .option('--ip [ip]', 'Update ip address (option)')
  .option('--check-host [host]', 'IP Check Host', v => v, 'ddnsclient.onamae.com')
  .option('--check-port [port]', 'IP Check Port', parseInt, 65000)
  .option('--update-host [host]', 'IP Update Host', v => v, 'ddnsclient.onamae.com')
  .option('--update-port [port]', 'IP Update Port', parseInt, 65010)
  .parse(['', '', ...argv]);

const opt = program.opts();
delete opt.version;
delete opt.ip;
console.log(opt);
if (Object.values(opt).some(v => v !== undefined)) {
  (async () => {
    if (Object.values(opt).some(v => v === undefined)) {
      console.log('[-u, -p, -d] require');
    } else {
      await modIP(program.updateHost, program.updatePort, program.userid, program.password,
        program.ip || await getIP(program.checkHost, program.checkPort), program.domain, program.subDomain)
        .then(() => {
          console.log('Success');
          return undefined;
        })
        .catch((e) => {
          console.log(e.message);
        });
    }
    process.exit();
  })();
} else {
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

  ipcMain.on('onamae:modIP', (event, setting, task) => {
    modIP(setting.update.host, setting.update.port, task.user.id, task.user.pass,
      task.ip.type === 'default' ? setting.$data.ip : task.ip.customIP, task.host.domain, task.host.subdomain)
      .then((ip) => {
        event.sender.send('onamae:modIP:res', 'Success', true, ip);
        return undefined;
      })
      .catch((e) => {
        event.sender.send('onamae:modIP:res', e.message, false);
      });
  });

  ipcMain.on('onamae:getIP', async (event, setting) => {
    const IP = await getIP(setting.check.host, setting.check.port);
    event.sender.send('onamae:getIP:res', IP);
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

}
