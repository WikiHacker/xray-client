'use strict';
/**
 * Created by LOLO on 2022/02/26.
 */

const {app, dialog, ipcMain} = require('electron');
const path = require('path');
const consts = require('./consts');


// console.log(process.arch);
const common = {
    tray: null,
    mainWnd: null,
}


common.appMenu = [
    {
        label: 'Edit',
        submenu: [
            {role: 'undo'},
            {role: 'redo'},
            {type: 'separator'},
            {role: 'cut'},
            {role: 'copy'},
            {role: 'paste'},
            {role: 'pasteandmatchstyle'},
            {role: 'delete'},
            {role: 'selectall'}
        ]
    }
];

common.trayMenu = [
    {
        label: 'Application', click: () => common.mainWnd.show()
    },

    {type: 'separator'},
    {
        label: 'Developer Tools', click: () => common.mainWnd.openDevTools({mode: 'detach'})
    },
    {
        label: 'About XrayClient', click: () => showAbout()
    },

    {type: 'separator'},
    {
        label: 'Quit', click: () => app.quit()
    },
];


// functions


/**
 * 显示 About 界面
 */
function showAbout() {
    dialog.showMessageBox({
        title: 'About',
        message: 'message',
        detail: 'The is a detail.',
        icon: common.formatPath('../icons/icon.png'),
    });
}


// ipc


ipcMain.on(consts.R_M.HIDE_APP, () => {
    common.mainWnd.hide();
});


// common functions


common.send = (channel, ...args) => {
    common.mainWnd.webContents.send(channel, ...args);
};


/**
 * 格式化文件路径
 * @param filePath
 * @returns {string}
 */
common.formatPath = (filePath) => {
    return path.join(__dirname, filePath);
};


module.exports = common;

