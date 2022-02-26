'use strict';
/**
 * Created by LOLO on 2022/02/21.
 */

const {contextBridge, ipcRenderer, shell} = require('electron');
const consts = require('./consts');


contextBridge.exposeInMainWorld(
    'electron',
    {
        hideApp: () => {
            ipcRenderer.send(consts.R_M.HIDE_APP);
        },

        openExternal: (url) => {
            shell.openExternal(url);
        },

    }
);

