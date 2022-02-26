'use strict';
/**
 * Created by LOLO on 2022/02/12.
 */

const {app, BrowserWindow, Tray, Menu} = require('electron');
const common = require('./common');
const consts = require('./consts');


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
    main();
}


// 入口
function main() {
    if (consts.IS_PC) {
        Menu.setApplicationMenu(null);
    } else {
        Menu.setApplicationMenu(Menu.buildFromTemplate(common.appMenu));
        app.dock.hide();
    }

    app.on('before-quit', () => {
        console.log('!!!');
    });

    app.whenReady().then(() => {
        createWindow();
        app.on('activate', function () {
            if (BrowserWindow.getAllWindows().length === 0)
                createWindow();
        })
    });
}


// 创建主窗口
function createWindow() {
    let wnd = common.mainWnd = new BrowserWindow({
        width: 460,
        height: 600,
        resizable: false,
        frame: false,
        skipTaskbar: true,
        webPreferences: {
            preload: common.formatPath('preload.js')
        }
    });
    wnd.loadFile(common.formatPath('../renderer/index.html'));

    // MacOS 启动时，先隐藏窗口，随后再显示。不然有可能窗口无法响应鼠标事件
    if (consts.IS_MAC) {
        wnd.hide();
        wnd.on('ready-to-show', () => {
            wnd.show();
        });
    }


    let trayIcon = `../icons/tray.${consts.IS_PC ? 'ico' : 'png'}`;
    let tray = common.tray = new Tray(common.formatPath(trayIcon));
    tray.setContextMenu(Menu.buildFromTemplate(common.trayMenu));
    tray.setToolTip('V2Ray - Personal');
    tray.on('double-click', () => {
        wnd.show();
    });
}

