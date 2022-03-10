'use strict';
/**
 * Created by LOLO on 2022/03/05.
 */


let cts_address = document.querySelector('#cts_address');
let cts_port = document.querySelector('#cts_port');
let cts_id = document.querySelector('#cts_id');
let cts_level = document.querySelector('#cts_level');
let cts_ws_path = document.querySelector('#cts_ws_path');
let cts_net_tcp = document.querySelector('#cts_net_tcp');
let cts_net_ws = document.querySelector('#cts_net_ws');
let cts_security_none = document.querySelector('#cts_security_none');
let cts_security_tls = document.querySelector('#cts_security_tls');
let cts_security_xtls = document.querySelector('#cts_security_xtls');
let lp_socks_port = document.querySelector('#lp_socks_port');
let lp_http_port = document.querySelector('#lp_http_port');
let lp_enabled = document.querySelector('#lp_enabled');


/**
 * 获取当前所选的网络类型的值
 * @returns {string}
 */
function getNetworkValue() {
    return document.querySelector('input[name="cts_net"]:checked').value
}

/**
 * 获取当前所选的安全协议的值
 * @returns {string}
 */
function getSecurityValue() {
    return document.querySelector('input[name="cts_security"]:checked').value
}


function uuidBtnOnClick() {
    window.electron.send(window.electron.S.CREATE_UUID, cts_id.value);
}


(() => {
    // 控件值有改变时，检查是否需要重新应用 xray config
    let options = [
        cts_address, cts_port, cts_id, cts_level, cts_ws_path,
        cts_net_tcp, cts_net_ws,
        cts_security_none, cts_security_tls, cts_security_xtls,
        lp_socks_port, lp_http_port, lp_enabled
    ];
    for (let option of options) {
        option.onchange = checkOptions;
    }


    // 更新 uuid
    window.electron.receive(window.electron.R.UPDATE_UUID, (uuid) => {
        cts_id.value = uuid;
        mdlTextFieldCheckDirty();
        checkOptions();
    });

    // 切换了 profile
    window.electron.receive(window.electron.R.UPDATE_PROFILE_DATA, (data) => {
        cts_address.value = data.general.address;
        cts_port.value = data.general.port;
        cts_id.value = data.general.id;
        cts_level.value = data.general.level;
        cts_ws_path.value = data.general.wsPath;
        document.querySelector('#cts_net_' + data.general.network).parentNode.MaterialRadio.check();
        document.querySelector('#cts_security_' + data.general.security).parentNode.MaterialRadio.check();
        lp_socks_port.value = data.general.localProxy.socks;
        lp_http_port.value = data.general.localProxy.http;
        let lpSwitch = lp_enabled.parentNode.MaterialSwitch;
        data.general.localProxy.enabled ? lpSwitch.on() : lpSwitch.off();
        mdlTextFieldCheckDirty();
        networkChange();
    });


    // 在网络类型和安全协议有改变时，修改描述文本
    let changeIntroText = () => {
        let content = 'VLESS over ' + getNetworkValue();
        let security = getSecurityValue();
        if (security !== 'none') content += ' with ' + security;
        document.querySelector('#generalIntroText').innerText = content;

    };
    cts_security_none.onchange = cts_security_tls.onchange = cts_security_xtls.onchange = changeIntroText;

    // 网络类型有改变时
    let networkChange = () => {
        let wsPath = cts_ws_path.parentNode.MaterialTextfield;
        getNetworkValue() === 'ws' ? wsPath.enable() : wsPath.disable();
        changeIntroText();
    }
    cts_net_tcp.onchange = cts_net_ws.onchange = networkChange;
})();
