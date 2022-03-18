'use strict';
/**
 * Created by LOLO on 2022/03/07.
 */

let tmpProfileData = {
    general: {localProxy: {}},
    log: {}
};


/**
 * 底部的 apply 提示
 */
let applyHint = {
    visible: false,
    get snackbar() {
        return document.querySelector('#applySnackbar').MaterialSnackbar;
    },
    show: (msg = 'profile (xray-core config) has changed.') => {
        if (!applyHint.visible) {
            applyHint.visible = true;
            applyHint.snackbar.showSnackbar({
                actionHandler: () => applyXrayConfig(),
                actionText: 'apply', message: msg, timeout: 999999
            });
        } else
            applyHint.snackbar.textElement_.textContent = msg;
    },
    hide: () => {
        if (applyHint.visible) {
            applyHint.visible = false;
            applyHint.snackbar.cleanup_();
        }
    }
};


/**
 * 验证当前 xray 参数是否有改变
 */
function checkOptions() {
    let hasChange = rulesChanged;
    let check = (oldVal, newVal) => {
        hasChange = (hasChange || newVal !== oldVal);
        return newVal;
    };
    let c = curProfileData;
    let t = tmpProfileData;
    t.general.address = check(c.general.address, cts_address.value);
    t.general.port = check(c.general.port, parseInt(cts_port.value));
    t.general.id = check(c.general.id, cts_id.value);
    t.general.level = check(c.general.level, parseInt(cts_level.value));
    t.general.wsPath = check(c.general.wsPath, cts_ws_path.value);
    t.general.network = check(c.general.network, getNetworkValue());
    t.general.security = check(c.general.security, getSecurityValue());
    t.general.localProxy.socks = check(c.general.localProxy.socks, parseInt(lp_socks_port.value));
    t.general.localProxy.http = check(c.general.localProxy.http, parseInt(lp_http_port.value));
    t.general.localProxy.lanEnabled = check(c.general.localProxy.lanEnabled, lp_lanEnabled.checked);

    if (!hasChange)
        hasChange = tmpProfileData.log.level !== curProfileData.log.level;

    hasChange ? applyHint.show() : applyHint.hide();
}


/**
 * 应用配置更改
 */
function applyXrayConfig() {
    checkOptions();
    curProfileData.log.level = tmpProfileData.log.level;
    tmpProfileData.rules = curProfileData.rules;
    window.electron.send(window.electron.S.APPLY_XRAY, tmpProfileData);
    rulesChanged = false;
    applyHint.hide();
    cleanLogContent();
}


(() => {
    const applyBtn = document.querySelector('#applyBtn');
    const disconnectBtn = document.querySelector('#disconnectBtn');

    applyBtn.addEventListener('click', () => applyXrayConfig());
    window.electron.receive(window.electron.R.APPLY_CHANGES, () => applyXrayConfig());

    disconnectBtn.addEventListener('click', () => window.electron.send(window.electron.S.STOP_XRAY));

    window.electron.receive(window.electron.R.UPDATE_RUNNING_STATUS, (running) => {
        if (running) {
            applyBtn.textContent = 'apply';
            disconnectBtn.disabled = false;
        } else {
            applyBtn.textContent = 'start';
            disconnectBtn.disabled = true;
        }
    });

})();