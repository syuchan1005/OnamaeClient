import { app, Menu, shell } from 'electron';

export default class MenuBuilder {
  mainWindow;

  constructor(mainWindow) {
    this.mainWindow = mainWindow;
  }

  buildMenu() {
    if (
      process.env.NODE_ENV === 'development' ||
      process.env.DEBUG_PROD === 'true'
    ) {
      this.setupDevelopmentEnvironment();
    }

    const template =
      process.platform === 'darwin'
        ? this.buildDarwinTemplate()
        : this.buildDefaultTemplate();

    const menu = Menu.buildFromTemplate(template);
    Menu.setApplicationMenu(menu);

    return menu;
  }

  setupDevelopmentEnvironment() {
    this.mainWindow.openDevTools();
    this.mainWindow.webContents.on('context-menu', (e, props) => {
      const { x, y } = props;

      Menu.buildFromTemplate([
        {
          label: 'Inspect element',
          click: () => {
            this.mainWindow.inspectElement(x, y);
          },
        },
      ]).popup(this.mainWindow);
    });
  }

  buildDarwinTemplate() {
    const subMenuAbout = {
      label: 'Electron',
      submenu: [
        {
          label: 'About ElectronReact',
          selector: 'orderFrontStandardAboutPanel:',
        },
        { type: 'separator' },
        {
          label: 'Hide ElectronReact',
          accelerator: 'Command+H',
          selector: 'hide:',
        },
        {
          label: 'Hide Others',
          accelerator: 'Command+Shift+H',
          selector: 'hideOtherApplications:',
        },
        { label: 'Show All', selector: 'unhideAllApplications:' },
        { type: 'separator' },
        {
          label: 'Quit',
          accelerator: 'Command+Q',
          click: () => {
            app.quit();
          },
        },
      ],
    };

    return [subMenuAbout, ...this.buildDefaultTemplate()];
  }

  buildDefaultTemplate() {
    const templateDefault = [
      {
        label: '&General',
        submenu: [{
          label: '&Run All',
          click: () => {
            this.mainWindow.webContents.send('menu:clickRunAll');
          },
        }, {
          type: 'separator',
        }, {
          label: 'E&xit',
          click: () => {
            this.mainWindow.close();
          },
        }],
      },
      {
        label: '&Setting',
        submenu: [{
          label: 'GeneralSetting',
          click: () => {
            this.mainWindow.webContents.send('menu:openGeneralSetting');
          },
        }, {
          label: 'Update IP',
          click: () => {
            this.mainWindow.webContents.send('menu:getIP');
          },
        }, {
          label: '&Reload',
          accelerator: 'CmdOrCtrl+R',
          click: () => {
            this.mainWindow.webContents.reload();
          },
        }, {
          label: 'Toggle Developer Tools',
          accelerator: 'Alt+CmdOrCtrl+I',
          click: () => {
            this.mainWindow.toggleDevTools();
          },
        }],
      },
      {
        label: 'Help',
        submenu: [{
          label: 'Github',
          click() {
            shell.openExternal('https://github.com/syuchan1005/OnamaeClient');
          },
        }],
      },
    ];

    return templateDefault;
  }
}
