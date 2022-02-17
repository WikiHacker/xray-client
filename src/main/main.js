/**
 * Created by LOLO on 2022/02/12.
 */

const {app, dialog, BrowserWindow, Tray, Menu} = require('electron');
const path = require('path');


let tray, mainWnd;


// 单例
if (!app.requestSingleInstanceLock()) {
    app.quit();
} else {
    app.on('second-instance', () => {
        if (mainWnd) {
            if (mainWnd.isMinimized()) mainWnd.restore();
            mainWnd.focus();
        }
    });
    main();
}


// 入口
function main() {
    Menu.setApplicationMenu(null);
    app.dock.hide();

    app.on('before-quit', () => {
        console.log('!!!');
        // showAbout();
    });

    app.whenReady().then(() => {
        createWindow();
    });
}


// 创建主窗口
function createWindow() {
    tray = new Tray(path.join(__dirname, '../icons/tray.png'));
    tray.setContextMenu(Menu.buildFromTemplate([
        {
            label: 'Application', click: () => {
                mainWnd.show();
            }
        },

        {type: 'separator'},
        {
            label: 'Developer Tools', click: () => {
                mainWnd.openDevTools({mode: 'detach'});
            }
        },
        {
            label: 'About V2RayP', click: () => {
                showAbout();
            }
        },

        {type: 'separator'},
        {
            label: 'Quit', click: () => {
                app.quit();
            }
        },
    ]));
    tray.setToolTip('V2Ray - Personal');


    mainWnd = new BrowserWindow({
        width: 460,
        height: 600,
        resizable: false,
        frame: false,
        // webPreferences: {nodeIntegration: true}
    });
    mainWnd.loadFile(path.join(__dirname, '../renderer/index.html'));

    // 启动时，先隐藏窗口，随后再显示。不然有可能窗口无法响应鼠标事件
    mainWnd.hide();
    mainWnd.on('ready-to-show', () => {
        mainWnd.show();
    });
}


// 显示 About 界面
function showAbout() {
    dialog.showMessageBox({
        type: 'info',
        title: 'About',
        message: 'ABOUT!!!',
        detail: 'The community platform for the future.',
        icon: path.join(__dirname, '../icons/icon.png')
    });
}
