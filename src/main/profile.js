'use strict';
/**
 * Created by LOLO on 2022/02/28.
 */

const {app, ipcMain, shell, dialog} = require('electron');
const path = require('path');
const fs = require('fs-extra');
const datastore = require('./datastore');
const common = require('./common');
const consts = require('./consts');


const PROFILE_DIR = common.storePath('Data/Profiles/');
let curProfileName, curProfileData;
let stopXrayFunc;
let isFirstUse = true;


/**
 * 初始化
 * @returns {Promise<void>}
 */
async function init() {
    if (datastore.data.lastUsedProfile) {
        await readProfile(datastore.data.lastUsedProfile);
    } else {
        await createNewProfile();
    }
    await updateProfileList();
}


/**
 * 更新 profile 列表
 * @returns {Promise<void>}
 */
async function updateProfileList() {
    let files = await getProfileList();
    let data = [];
    for (let file of files) {
        file = path.normalize(PROFILE_DIR + file);
        let profile = await fs.readJson(file);
        data.push({
            name: profile.name,
            lastUsed: profile.lastUsed,
            address: profile.general.address,
            port: profile.general.port,
        });
    }
    common.send(consts.M_R.UPDATE_PROFILE_LIST, data);
}


/**
 * 创建并使用一个新的配置文件
 * @returns {Promise<void>}
 */
async function createNewProfile() {
    // default profile
    let nowTime = Date.now();
    curProfileData = {
        name: nowTime.toString(),
        lastUsed: nowTime,
        general: {
            address: '', port: 12301,
            id: '',
            level: 1, wsPath: '',
            network: 'tcp',
            security: 'xtls',
            localProxy: {http: 1087, socks: 7801, enabled: true},
        },
        proxies: {
            http: {server: '127.0.0.1', port: 1087},
            socks: {server: '127.0.0.1', port: 7801},
            enabled: false,
        },
        log: {
            level: 'warning',
        },
        rules: {
            reject: {
                domain: ['geosite:category-ads'],
            },
            proxy: {
                domain: ['full:cdn.jsdelivr.net'],
            },
            direct: {
                domain: [
                    'domain:lolo.link',
                    'domain:ruizhan.com',
                    'domain:aoshitang.com',
                    'geosite:apple',
                    'geosite:private',
                    'geosite:cn',
                ],
                ip: [
                    'geoip:private',
                    'geoip:cn',
                ],
            },
        },
    };
    curProfileName = curProfileData.name;
    await saveCurrentProfile();

    datastore.data.lastUsedProfile = curProfileName;
    await datastore.save();
    currentProfileChanged(true);
}


/**
 * 读取并使用一个配置文件
 * @param profileName
 * @returns {Promise<void>}
 */
async function readProfile(profileName) {
    curProfileName = profileName;
    datastore.data.lastUsedProfile = curProfileName;
    await datastore.save();
    curProfileData = await fs.readJson(getProfilePath(curProfileName));
    curProfileData.lastUsed = Date.now();
    await saveCurrentProfile();
    currentProfileChanged(false);
}


function currentProfileChanged(isNew) {
    stopXrayFunc();
    common.send(consts.M_R.UPDATE_PROFILE_DATA, curProfileData);
    if (isFirstUse)
        isFirstUse = false;
    else
        common.send(consts.M_R.SHOW_TIPS, isNew ? 'Using new profile.' : 'Profile changed.');
}


/**
 * 保存当前使用的配置文件
 * @returns {Promise<void>}
 */
async function saveCurrentProfile() {
    await fs.ensureDir(PROFILE_DIR);
    await fs.writeJson(getProfilePath(curProfileName), curProfileData);
}


/**
 * 获取 profile 列表
 * @returns {Promise<string[]>}
 */
async function getProfileList() {
    let list = await fs.readdir(PROFILE_DIR);
    return list.filter(item => !/(^|\/)\.[^/.]/g.test(item));
}

/**
 * 获取配置文件路径
 * @param profileName
 * @returns {string}
 */
function getProfilePath(profileName) {
    return PROFILE_DIR + profileName + '.json';
}


//


/**
 * 保存 name 对应的 profile 到本地目录，并打开文件夹视图
 */
ipcMain.on(consts.R_M.SAVE_PROFILE, async (event, name) => {
    let file = path.normalize(app.getPath('downloads') + '/XrayClient-Profile.json');
    let result = await dialog.showSaveDialog({title: 'Save Profile', defaultPath: file});
    if (!result.canceled) {
        await fs.copy(getProfilePath(name), result.filePath);
        shell.showItemInFolder(result.filePath);
    }
});

/**
 * 切换 profile
 */
ipcMain.on(consts.R_M.CHANGE_PROFILE, async (event, name) => {
    await readProfile(name);
});

/**
 * 移除 profile
 */
ipcMain.on(consts.R_M.REMOVE_PROFILE, async (event, name) => {
    await fs.remove(getProfilePath(name));
    if (name.toString() === curProfileName) {
        let files = await getProfileList();
        if (files.length === 0) {
            await createNewProfile();
        } else
            await readProfile(path.basename(files[0], '.json'));
    }
    await updateProfileList();
});

/**
 * 创建一个新的 profile，并启用它
 */
ipcMain.on(consts.R_M.CREATE_PROFILE, async () => {
    await createNewProfile();
    await updateProfileList();
});

/**
 * 导入一个 profile，并启用它
 */
ipcMain.on(consts.R_M.IMPORT_PROFILE, async () => {
    let result = await dialog.showOpenDialog({
        title: 'Importing a Profile',
        filters: [{name: 'json', extensions: ['json']}]
    });
    if (!result.canceled) {
        let data, notProfile = true;
        try {
            data = await fs.readJson(result.filePaths[0]);
        } catch {
        }
        if (data && data.general && data.proxies && data.log && data.rules) {
            notProfile = false;
            let name = Date.now().toString();
            data.name = name;
            await fs.writeJson(getProfilePath(name), data);
            await readProfile(name);
            await updateProfileList();
        }
        if (notProfile)
            common.send(consts.M_R.SHOW_TIPS, 'Not a Profile!');
    }
});


//


module.exports = {
    init,
    saveCurrentProfile,
    updateProfileList,

    getCurrentProfileData: () => {
        return curProfileData;
    },

    setStopXrayFunc: (value) => {
        stopXrayFunc = value;
    },
};

