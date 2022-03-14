'use strict';
/**
 * Created by LOLO on 2022/03/07.
 */

const {spawn} = require('child_process');
const https = require('https');
const url = require('url');
const path = require('path');
const fs = require('fs-extra');
const HttpsProxyAgent = require('https-proxy-agent')
const progress = require('progress-stream');
const {ipcMain, app} = require('electron');
const consts = require('./consts');
const common = require('./common');
const proxies = require('./proxies');
const profile = require('./profile');


// xray-core 相关文件路径
const XRAY_DIR = common.storePath('xray-core/');
const XRAY_PATH = XRAY_DIR + (consts.IS_MAC ? 'xray' : 'xray.exe');
const GEOIP_PATH = XRAY_DIR + 'geoip.dat';
const GEOSITE_PATH = XRAY_DIR + 'geosite.dat';
const XRAY_CONFIG_PATH = common.storePath('Data/config.json');
const TEMP_FILE_PATH = path.normalize(app.getPath('temp') + '/XrayClient/geo.dat.tmp');

// dat 更新地址
const GEOIP_URL = [
    'https://cdn.jsdelivr.net/gh/Loyalsoldier/v2ray-rules-dat@release/geoip.dat',
    'https://github.com/Loyalsoldier/v2ray-rules-dat/releases/latest/download/geoip.dat'
];
const GEOSITE_URL = [
    'https://cdn.jsdelivr.net/gh/Loyalsoldier/v2ray-rules-dat@release/geosite.dat',
    'https://github.com/Loyalsoldier/v2ray-rules-dat/releases/latest/download/geosite.dat'
];

const RULE = {
    OUT: {REJECT: 'reject', PROXY: 'proxy', DIRECT: 'direct'},
    TYPE: {DOMAIN: 'domain', IP: 'ip', PORT: 'port'}
};

let updateInfo = {};
let xray_process;
let getStatsTimeoutId;
profile.setStopXrayFunc(stopXray);


//


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

    let version = await xrayCommand('version');
    let stats = await fs.stat(GEOIP_PATH);
    common.send(consts.M_R.UPDATE_XRAY_INFO, {version, lastUpdate: stats.mtime});
}


//


/**
 * 执行 xray 命令，并返回运行结果
 * @param cmd
 * @param args
 * @returns {Promise<string>}
 */
async function xrayCommand(cmd, ...args) {
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


//


/**
 * 根据配置文件内容，运行（或重启）xray
 * @returns {Promise<void>}
 */
async function runXray() {
    let isFirstStart = !xray_process;
    if (!isFirstStart) {
        xray_process.kill();
        xray_process = null;
    }

    await generateConfig();

    if (profile.getCurrentProfileData().general.localProxy.enabled)
        await proxies.enable();

    let subprocess = xray_process = spawn(XRAY_PATH, ['run', '-c=' + XRAY_CONFIG_PATH]);
    subprocess.on('exit', () => {
        if (xray_process === subprocess) {
            xray_process = null;
            common.send(consts.M_R.UPDATE_RUNNING_STATUS, false);
        }
    });
    subprocess.stdout.on('data', (data) => {
        if (xray_process === subprocess)
            common.send(consts.M_R.UPDATE_ACCESS_LOG, data.toString().trim());
    });
    subprocess.stderr.on('data', (data) => {
        if (xray_process === subprocess)
            common.send(consts.M_R.UPDATE_ERROR_LOG, data.toString().trim());
    });

    common.send(consts.M_R.UPDATE_RUNNING_STATUS, true);
    common.send(consts.M_R.SHOW_TIPS,
        isFirstStart ? 'Xray startup complete.' : 'Changes have been applied.');
    updateSpeedStats();
}

// 生成 xray 配置文件
async function generateConfig() {
    let data = profile.getCurrentProfileData();

    // base
    let config = {
        stats: {},
        api: {tag: 'api', services: ['StatsService']},
        policy: {system: {statsOutboundUplink: true, statsOutboundDownlink: true}},

        log: {loglevel: data.log.level},

        routing: {
            domainStrategy: 'IPIfNonMatch',
            rules: [
                {
                    type: 'field',
                    inboundTag: ['api'],
                    outboundTag: 'api'
                }
            ]
        },

        inbounds: [
            {
                protocol: 'http',
                listen: "127.0.0.1",
                port: data.general.localProxy.http,
                settings: {timeout: 0}
            },
            {
                protocol: 'socks',
                listen: '127.0.0.1',
                port: data.general.localProxy.socks,
                settings: {udp: true}
            },
            {
                tag: 'api',
                protocol: 'dokodemo-door',
                listen: '127.0.0.1',
                port: consts.STATS_PORT,
                settings: {address: '127.0.0.1'}
            }
        ],

        outbounds: [
            {
                tag: 'direct',
                protocol: 'freedom',
                settings: {}
            },
            {
                tag: 'reject',
                protocol: 'blackhole',
                settings: {}
            }
        ]
    };

    // proxy outbound
    let outbound = {tag: 'proxy', protocol: 'vless'};
    let vnext = {address: data.general.address, port: data.general.port};
    let user = {id: data.general.id, level: data.general.level, encryption: "none"};
    let streamSettings = {network: data.general.network, security: data.general.security};

    if (data.general.network === 'ws')
        streamSettings.wsSettings = {path: data.general.wsPath};

    if (data.general.security === 'xtls') {
        streamSettings.xtlsSettings = {serverName: data.general.address};
        user.flow = 'xtls-rprx-direct';
    } else if (data.general.security === 'tls')
        streamSettings.tlsSettings = {serverName: data.general.address};

    vnext.users = [user];
    outbound.settings = {vnext: [vnext]};
    outbound.streamSettings = streamSettings;
    config.outbounds.push(outbound);

    // rules
    let rules = config.routing.rules;
    let rule = (outbound, type) => {
        let list = data.rules[outbound][type];
        if (list && list.length > 0)
            rules.push({
                type: 'field',
                outboundTag: outbound,
                [type]: type === RULE.TYPE.PORT ? list.join(',') : list
            });
    };
    rule(RULE.OUT.REJECT, RULE.TYPE.DOMAIN);
    rule(RULE.OUT.REJECT, RULE.TYPE.IP);
    rule(RULE.OUT.REJECT, RULE.TYPE.PORT);
    rule(RULE.OUT.PROXY, RULE.TYPE.DOMAIN);
    rule(RULE.OUT.PROXY, RULE.TYPE.IP);
    rule(RULE.OUT.PROXY, RULE.TYPE.PORT);
    rule(RULE.OUT.DIRECT, RULE.TYPE.DOMAIN);
    rule(RULE.OUT.DIRECT, RULE.TYPE.IP);
    rule(RULE.OUT.DIRECT, RULE.TYPE.PORT);
    rules.push({type: 'field', outboundTag: RULE.OUT.PROXY, port: '0-65535'});// 没匹配到规则的，全部走代理

    await fs.writeJson(XRAY_CONFIG_PATH, config);
}


/**
 * 停止当前正在运行的 xray-core
 */
function stopXray() {
    if (xray_process) {
        xray_process.kill();
        xray_process = null;
        common.send(consts.M_R.UPDATE_RUNNING_STATUS, false);
    }
}


//


/**
 * 下载一个 dat 文件
 * @param datUrl
 * @param filePath
 * @returns {Promise<Error | null>}
 */
async function downloadDat(datUrl, filePath) {
    console.log('download...\n  ' + datUrl);

    return new Promise((resolve, reject) => {
        const file = fs.createWriteStream(TEMP_FILE_PATH);

        // let options = new url.URL(datUrl);
        let options = url.parse(datUrl);
        let proxy = proxies.getSettings();
        if (proxy)
            options.agent = new HttpsProxyAgent(`http://${proxy.http.server}:${proxy.http.port}`);

        const request = https.get(options, response => {
            if (response.statusCode !== 200) {
                reject(new Error(`Failed to get '${datUrl}' (${response.statusCode})`));
                return;
            }

            const size = parseInt(response.headers['content-length']);
            const str = progress({length: size, time: 500});
            str.on('progress', updateDatProgress);
            response
                .pipe(str)
                .pipe(file);
        });

        file.on('error', err => reject(err));
        file.on('finish', () => {
            fs.move(TEMP_FILE_PATH, filePath, {overwrite: true}, err => {
                if (err)
                    reject(err);
                else
                    resolve();
            });
        });

        request.on('error', err => reject(err));
        request.end();
    });
}

// 通知 dat 更新进度
function updateDatProgress(progress) {
    updateInfo.progress = updateInfo.geoip ? 80 : 0;
    updateInfo.progress += progress.percentage * (updateInfo.geoip ? 0.2 : 0.8);
    common.send(consts.M_R.UPDATE_PROGRESS, updateInfo);
}


//


/**
 *
 */
function updateSpeedStats() {
    clearTimeout(getStatsTimeoutId);
    if (!xray_process) return;

    xrayCommand('api', 'statsquery', '--server=127.0.0.1:' + consts.STATS_PORT, '--reset').then((data) => {
        data = JSON.parse(data);
        let up, down;
        data.stat.forEach(item => {
            switch (item.name) {
                case 'outbound>>>proxy>>>traffic>>>uplink':
                    up = item.value ? item.value / 3 : 0;
                    break;
                case 'outbound>>>proxy>>>traffic>>>downlink':
                    down = item.value ? item.value / 3 : 0;
                    break;
            }
        });
        common.send(consts.M_R.UPDATE_SPEED_STATS, {up, down});
    });
    getStatsTimeoutId = setTimeout(updateSpeedStats, 3000);
}


//


/**
 * 如果传入参数 id（任意字符串），将生成该 id 对应的 UUID
 * 如果没有传入 id，或 id 长度大于30，将生成一个随机的 UUID。
 */
ipcMain.on(consts.R_M.CREATE_UUID, async (event, id) => {
    let args = ['uuid'];
    if (!common.isEmpty(id) && id.length < 30) args.push('-i', id);
    id = await xrayCommand(...args);
    common.send(consts.M_R.UPDATE_UUID, id);
});


/**
 * 更新 geoip.dat & geosite.dat
 */
ipcMain.on(consts.R_M.UPDATE_XRAY_DAT, async () => {
    if (updateInfo.running) return;
    updateInfo = {running: true, end: false, err: null, progress: 0, geoip: false};

    await fs.ensureDir(path.dirname(TEMP_FILE_PATH));
    let updateEnd = (errFileName) => {
        updateInfo.running = false;
        updateInfo.end = true;
        updateInfo.err = errFileName;
        if (!errFileName) updateInfo.progress = 100;
        common.send(consts.M_R.UPDATE_PROGRESS, updateInfo);
    }

    // update geoip.dat
    try {
        await downloadDat(GEOIP_URL[0], GEOIP_PATH);
    } catch {
        try {
            await downloadDat(GEOIP_URL[1], GEOIP_PATH);
        } catch {
            updateEnd(path.basename(GEOIP_PATH));
            return;
        }
    }
    updateInfo.geoip = true;

    // update geosite.dat
    try {
        await downloadDat(GEOSITE_URL[0], GEOSITE_PATH);
    } catch {
        try {
            await downloadDat(GEOSITE_URL[1], GEOSITE_PATH);
        } catch {
            updateEnd(path.basename(GEOSITE_PATH));
            return;
        }
    }

    updateEnd();
});


/**
 * 将更改应用到 xray-core，并保存到配置文件中
 */
ipcMain.on(consts.R_M.APPLY_XRAY, async (event, data) => {
    const curData = profile.getCurrentProfileData();
    curData.general = data.general;
    curData.log.level = data.log.level;
    curData.rules = data.rules;
    await profile.saveCurrentProfile();
    await profile.updateProfileList();

    await runXray();
});


//
ipcMain.on(consts.R_M.STOP_XRAY, () => stopXray());


//


module.exports = {
    init,
};