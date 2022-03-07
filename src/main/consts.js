'use strict';
/**
 * Created by LOLO on 2022/02/26.
 */


const consts = {
    IS_MAC: process.platform === 'darwin',
    IS_PC: process.platform !== 'darwin',

    M_R: {
        UPDATE_PROFILE_LIST: 'update-profile-list',
        UPDATE_PROFILE_DATA: 'update-profile-data',
        SHOW_TIPS: 'show-tips',
    },

    R_M: {
        HIDE_APP: 'hide-app',
        SAVE_PROFILE: 'save-profile',
        CHANGE_PROFILE: 'change-profile',
        REMOVE_PROFILE: 'remove-profile',
        CREATE_PROFILE: 'create-profile',
        IMPORT_PROFILE: 'import-profile',
    },
};


module.exports = consts;

