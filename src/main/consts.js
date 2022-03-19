'use strict';
/**
 * Created by LOLO on 2022/02/26.
 */


const consts = {
    IS_MAC: process.platform === 'darwin',
    IS_PC: process.platform !== 'darwin',
    IS_DEVELOPMENT: process.env.npm_command !== undefined,

    STATS_PORT: 1078,
    LOCAL_IP: '127.0.0.1',

    M_R: {
        SHOW_TIPS: 'show-tips',
        SHOW_ABOUT: 'show-about',
        SHOW_TAB_PAGE: 'show-tab-page',
        UPDATE_RUNNING_STATUS: 'update-running-status',
        APPLY_CHANGES: 'apply-changes',
        UPDATE_SPEED_STATS: 'update-speed-stats',
        UPDATE_PROFILE_LIST: 'update-profile-list',
        UPDATE_PROFILE_DATA: 'update-profile-data',
        UPDATE_VERSION_INFO: 'update-version-info',
        UPDATE_UUID: 'update-uuid',
        UPDATE_PROGRESS: 'update-progress',
        SWITCH_GLOBAL_PROXY: 'switch-global-proxy',
        UPDATE_ERROR_LOG: 'update-error-log',
        UPDATE_ACCESS_LOG: 'update-access-log',
    },

    R_M: {
        HIDE_APP: 'hide-app',
        SAVE_FILE: 'save-file',
        PING: 'ping',
        SAVE_PROFILE: 'save-profile',
        CHANGE_PROFILE: 'change-profile',
        REMOVE_PROFILE: 'remove-profile',
        CREATE_PROFILE: 'create-profile',
        IMPORT_PROFILE: 'import-profile',
        CREATE_UUID: 'create-uuid',
        UPDATE_XRAY_DAT: 'update-xray-dat',
        SET_LOCAL_PROXY: 'set-local-proxy',
        APPLY_XRAY: 'apply-xray',
        STOP_XRAY: 'stop-xray',
    },
};


module.exports = consts;

