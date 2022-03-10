'use strict';
/**
 * Created by LOLO on 2022/02/21.
 */

const {contextBridge, ipcRenderer, shell, clipboard} = require('electron');
const consts = require('./consts');


contextBridge.exposeInMainWorld(
    'electron',
    {
        send: (channel, ...data) => ipcRenderer.send(channel, ...data),
        receive: (channel, func) => ipcRenderer.on(channel, (event, ...args) => {
            try {
                func(...args);
            } catch (e) {
                console.log('[CHANNEL ERROR]: ' + channel);
                console.error(e);
            }
        }),

        openExternal: (url) => shell.openExternal(url),

        setClipboardText: (text) => clipboard.writeText(text),


        // send channels
        S: {
            HIDE_APP: consts.R_M.HIDE_APP,
            SAVE_FILE: consts.R_M.SAVE_FILE,
            SAVE_PROFILE: consts.R_M.SAVE_PROFILE,
            CHANGE_PROFILE: consts.R_M.CHANGE_PROFILE,
            REMOVE_PROFILE: consts.R_M.REMOVE_PROFILE,
            CREATE_PROFILE: consts.R_M.CREATE_PROFILE,
            IMPORT_PROFILE: consts.R_M.IMPORT_PROFILE,
            CREATE_UUID: consts.R_M.CREATE_UUID,
            UPDATE_XRAY_DAT: consts.R_M.UPDATE_XRAY_DAT,
            SET_LOCAL_PROXY: consts.R_M.SET_LOCAL_PROXY,
        },

        // receive - channels
        R: {
            SHOW_TIPS: consts.M_R.SHOW_TIPS,
            UPDATE_PROFILE_LIST: consts.M_R.UPDATE_PROFILE_LIST,
            UPDATE_PROFILE_DATA: consts.M_R.UPDATE_PROFILE_DATA,
            UPDATE_XRAY_INFO: consts.M_R.UPDATE_XRAY_INFO,
            UPDATE_UUID: consts.M_R.UPDATE_UUID,
            UPDATE_PROGRESS: consts.M_R.UPDATE_PROGRESS,
            UPDATE_ERROR_LOG: consts.M_R.UPDATE_ERROR_LOG,
            UPDATE_ACCESS_LOG: consts.M_R.UPDATE_ACCESS_LOG,
        }
    }
);

