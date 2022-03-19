'use strict';
/**
 * Created by LOLO on 2022/02/12.
 */

const {app, powerMonitor, BrowserWindow, Tray, Menu} = require('electron');
const common = require('./common');
const consts = require('./consts');
const xray = require('./xray');
const profile = require('./profile');
const proxies = require('./proxies');


// 单例
if (!app.requestSingleInstanceLock()) {
    app.quit();
} else {
    app.on('second-instance', () => {
        if (common.mainWnd) {
            if (common.mainWnd.isMinimized())
                common.mainWnd.restore();
            common.mainWnd.focus();
        }
    });

    main().then(() => console.log('Startup completed!'));
}


// 入口
async function main() {
    if (consts.IS_PC) {
        Menu.setApplicationMenu(null);
    } else {
        Menu.setApplicationMenu(Menu.buildFromTemplate(common.appMenu));
        app.dock.hide();
    }

    const quit = async (event) => {
        event.preventDefault();
        await proxies.disable();
        console.log('Safe exit!');
        app.quit();
    }

    app.on('quit', quit);
    powerMonitor.on('shutdown', quit);

    await app.whenReady();
    await createWindow();
    await xray.init();
    await profile.init();
}


async function createWindow() {
    // tray
    let trayIcon = `../icons/tray.${consts.IS_PC ? 'ico' : 'png'}`;
    let tray = common.tray = new Tray(common.appPath(trayIcon));
    tray.setContextMenu(Menu.buildFromTemplate(common.trayMenu));
    tray.setToolTip('XrayClient\nversion: ' + app.getVersion());
    tray.on('double-click', () => wnd.show());
    tray.on('mouse-move', () => {
        common.trayMenu[3].label = xray.running ? 'Apply Changes' : 'Startup XrayClient';
        common.trayMenu[4].label = `${proxies.running ? 'Disable' : 'Enable'} Global Proxy`;
        tray.setContextMenu(Menu.buildFromTemplate(common.trayMenu));
    });
    common.trayMenu[4].click = () => proxies.switchStatus();


    // main window
    let wnd = common.mainWnd = new BrowserWindow({
        width: 460,
        height: 600,
        resizable: false,
        frame: false,
        skipTaskbar: true,
        webPreferences: {
            preload: common.appPath('preload.js')
        }
    });

    // MacOS 启动时，先隐藏窗口，随后再显示。否则有可能窗口无法响应鼠标事件
    if (consts.IS_MAC) {
        wnd.hide();
        wnd.on('ready-to-show', () => wnd.show());
    }

    wnd.on('show', () => {
        common.showed = true;
        xray.updateSpeedStats();
    });

    wnd.on('hide', () => common.showed = false);

    await wnd.loadFile(common.appPath('../renderer/index.html'));
}

