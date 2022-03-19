'use strict';
/**
 * Created by LOLO on 2022/03/09.
 */

const {exec} = require('child_process');
const {ipcMain} = require('electron');
const consts = require('./consts');
const common = require('./common');
const profile = require('./profile');


//


const cmdQueue = [];
let executing = false;
let settings = null;


/**
 * 按序执行开启或关闭本地代理的命令
 * @param args
 * @returns {Promise<void>}
 */
async function execCmd(...args) {
    cmdQueue.push(...args);
    if (executing) return;

    executing = true;
    while (cmdQueue.length > 0) {
        let cmd = cmdQueue.shift();
        await exec(cmd);
    }
    executing = false;
}


async function enable() {
    const {http, socks} = settings = profile.getCurrentProfileData().proxies;
    if (consts.IS_MAC)
        await execCmd(
            `networksetup -setwebproxy Wi-Fi ${http.server} ${http.port}`,
            `networksetup -setsecurewebproxy Wi-Fi ${http.server} ${http.port}`,
            `networksetup -setsocksfirewallproxy Wi-Fi ${socks.server} ${socks.port}`
        );
    else
        await execCmd(
            `reg add "HKCU\\Software\\Microsoft\\Windows\\CurrentVersion\\Internet Settings" /v ProxyEnable /t REG_DWORD /d 1 /f`,
            `reg add "HKCU\\Software\\Microsoft\\Windows\\CurrentVersion\\Internet Settings" /v ProxyServer /d "${http.server}:${http.port}" /f`
        );

    common.send(consts.M_R.SWITCH_GLOBAL_PROXY, true, settings);
}


async function disable() {
    settings = null;
    if (consts.IS_MAC)
        await execCmd(
            'networksetup -setwebproxystate Wi-Fi off',
            'networksetup -setsecurewebproxystate Wi-Fi off',
            'networksetup -setsocksfirewallproxystate Wi-Fi off'
        );
    else
        await execCmd(
            'reg add "HKCU\\Software\\Microsoft\\Windows\\CurrentVersion\\Internet Settings" /v ProxyEnable /t REG_DWORD /d 0 /f',
            'reg delete "HKCU\\Software\\Microsoft\\Windows\\CurrentVersion\\Internet Settings" /v ProxyServer /f'
        );

    common.send(consts.M_R.SWITCH_GLOBAL_PROXY, false);
}


async function switchStatus() {
    if (settings)
        await disable();
    else
        await enable();
}


/**
 * 设置本地代理
 */
ipcMain.on(consts.R_M.SET_LOCAL_PROXY, async (event, data) => {
    if (data) {
        // save to current profile data
        profile.getCurrentProfileData().proxies = data;
        await profile.saveCurrentProfile();
        await enable();
    } else {
        await disable();
    }
});


//


module.exports = {
    enable,
    disable,
    switchStatus,

    get settings() {
        return settings;
    },
    get running() {
        return settings !== null;
    }
};


