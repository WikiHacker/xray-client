'use strict';
/**
 * Created by LOLO on 2022/02/26.
 */


const consts = {
    IS_MAC: process.platform === 'darwin',
    IS_PC: process.platform !== 'darwin',

    M_R: {
        SHOW_TIPS: 'show-tips',
        UPDATE_PROFILE_LIST: 'update-profile-list',
        UPDATE_PROFILE_DATA: 'update-profile-data',
        UPDATE_XRAY_INFO: 'update-xray-info',
        UPDATE_UUID: 'update-uuid',
        UPDATE_PROGRESS: 'update-progress',
        UPDATE_ERROR_LOG: 'update-error-log',
        UPDATE_ACCESS_LOG: 'update-access-log',
    },

    R_M: {
        HIDE_APP: 'hide-app',
        SAVE_FILE: 'save-file',
        SAVE_PROFILE: 'save-profile',
        CHANGE_PROFILE: 'change-profile',
        REMOVE_PROFILE: 'remove-profile',
        CREATE_PROFILE: 'create-profile',
        IMPORT_PROFILE: 'import-profile',
        CREATE_UUID: 'create-uuid',
        UPDATE_XRAY_DAT: 'update-xray-dat',
        SET_LOCAL_PROXY: 'set-local-proxy',
    },
};


module.exports = consts;

