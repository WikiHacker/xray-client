'use strict';
/**
 * Created by LOLO on 2022/03/07.
 */

const {spawn} = require('child_process');
const fs = require('fs-extra');
const {ipcMain, app} = require('electron');
const consts = require('./consts');
const common = require('./common');


// xray-core 相关文件路径
const XRAY_DIR = common.storePath('xray-core/');
const XRAY_PATH = XRAY_DIR + (consts.IS_MAC ? 'xray' : 'xray.exe');
const GEOIP_PATH = XRAY_DIR + 'geoip.dat';
const GEOSITE_PATH = XRAY_DIR + 'geosite.dat';


async function xray(cmd, ...args) {
    args.unshift(cmd);
    const child = spawn(XRAY_PATH, args);

    let data = "";
    for await (const chunk of child.stdout)
        data += chunk;

    let error = "";
    for await (const chunk of child.stderr)
        error += chunk;

    const exitCode = await new Promise((resolve, reject) => {
        child.on('close', resolve);
    });

    if (exitCode) {
        throw new Error(`xray-core error exit: ${exitCode}, ${error}`);
    }
    return data;
}


/**
 * 初始化
 * @returns {Promise<void>}
 */
async function init() {
    // 将包体内的 xray-core 相关文件拷贝到存储目录下，便于更新
    await fs.ensureDir(XRAY_DIR);
    let xrayDir = common.appPath('../xray-core/');

    let exists = await fs.pathExists(XRAY_PATH);
    if (!exists) {
        let xrayPath = xrayDir + 'xray-';
        if (consts.IS_MAC)
            xrayPath += process.arch === 'arm64' ? 'macos-arm64-v8a' : 'macos-64';
        else
            xrayPath += 'windows-64.exe';
        await fs.copy(xrayPath, XRAY_PATH);
    }

    exists = await fs.pathExists(GEOIP_PATH);
    if (!exists)
        await fs.copy(xrayDir + 'geoip.dat', GEOIP_PATH);

    exists = await fs.pathExists(GEOSITE_PATH);
    if (!exists)
        await fs.copy(xrayDir + 'geosite.dat', GEOSITE_PATH);

    let version = await xray('version');
    let stats = await fs.stat(GEOIP_PATH);
    common.send(consts.M_R.UPDATE_XRAY_INFO, {version, lastUpdate: stats.mtime});
}


//


/**
 * 如果传入参数 id（任意字符串），将生成该 id 对应的 UUID
 * 如果没有传入 id，或 id 长度大于30，将生成一个随机的 UUID。
 */
ipcMain.on(consts.R_M.CREATE_UUID, async (event, id) => {
    let args = ['uuid'];
    if (!common.isEmpty(id) && id.length < 30) args.push('-i', id);
    id = await xray(...args);
    common.send(consts.M_R.UPDATE_UUID, id);
});


/**
 * 开始更新 geoip.dat & geosite.dat
 */
ipcMain.on(consts.R_M.UPDATE_XRAY_DAT, async () => {
    const dir = app.getPath('temp') + '/XrayClient/';
    await fs.ensureDir(dir);

    // update geoip.dat


    // require('electron').shell.showItemInFolder(dir);

    // common.send(consts.M_R.UPDATE_PROGRESS, id);
});


//


module.exports = {
    init,
};