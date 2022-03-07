'use strict';
/**
 * Created by LOLO on 2022/02/21.
 */

const {contextBridge, ipcRenderer, shell} = require('electron');
const consts = require('./consts');


contextBridge.exposeInMainWorld(
    'electron',
    {
        send: (channel, data) => ipcRenderer.send(channel, data),
        receive: (channel, func) => ipcRenderer.on(channel, (event, ...args) => {
            try {
                func(...args);
            } catch (e) {
                console.log('channel error: ' + channel);
                console.error(e);
            }
        }),

        openExternal: (url) => shell.openExternal(url),


        S: {
            HIDE_APP: consts.R_M.HIDE_APP,
            SAVE_PROFILE: consts.R_M.SAVE_PROFILE,
            CHANGE_PROFILE: consts.R_M.CHANGE_PROFILE,
            REMOVE_PROFILE: consts.R_M.REMOVE_PROFILE,
            CREATE_PROFILE: consts.R_M.CREATE_PROFILE,
            IMPORT_PROFILE: consts.R_M.IMPORT_PROFILE,
        },

        R: {
            UPDATE_PROFILE_LIST: consts.M_R.UPDATE_PROFILE_LIST,
            UPDATE_PROFILE_DATA: consts.M_R.UPDATE_PROFILE_DATA,
            SHOW_TIPS: consts.M_R.SHOW_TIPS,
        }
    }
);

