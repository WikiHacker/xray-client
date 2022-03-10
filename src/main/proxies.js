'use strict';
/**
 * Created by LOLO on 2022/03/09.
 */

const {exec} = require('child_process');
const {ipcMain} = require('electron');
const consts = require('./consts');


//


const cmdList = [];
let executing = false;


async function execCmd(...args) {
    cmdList.push(...args);
    if (executing) return;

    executing = true;
    while (cmdList.length > 0) {
        let cmd = cmdList.shift();
        await exec(cmd);
    }
    executing = false;
}


/**
 * 设置本地代理
 */
ipcMain.on(consts.R_M.SET_LOCAL_PROXY, async (event, data) => {
    if (data) {
        if (consts.IS_MAC)
            await execCmd(
                `networksetup -setwebproxy Wi-Fi ${data.http.server} ${data.http.port}`,
                `networksetup -setsecurewebproxy Wi-Fi ${data.http.server} ${data.http.port}`,
                `networksetup -setsocksfirewallproxy Wi-Fi ${data.socks.server} ${data.socks.port}`
            );
        else
            await execCmd(
                `reg add "HKCU\\Software\\Microsoft\\Windows\\CurrentVersion\\Internet Settings" /v ProxyEnable /t REG_DWORD /d 1 /f`,
                `reg add "HKCU\\Software\\Microsoft\\Windows\\CurrentVersion\\Internet Settings" /v ProxyServer /d "${data.http.server}:${data.http.port}" /f`
            );
    } else {
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
    }
});

