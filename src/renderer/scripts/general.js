'use strict';
/**
 * Created by LOLO on 2022/03/05.
 */


const cts_address = document.querySelector('#cts_address');
const cts_port = document.querySelector('#cts_port');
const cts_id = document.querySelector('#cts_id');
const cts_level = document.querySelector('#cts_level');
const cts_ws_path = document.querySelector('#cts_ws_path');
const cts_net_tcp = document.querySelector('#cts_net_tcp');
const cts_net_ws = document.querySelector('#cts_net_ws');
const cts_security_none = document.querySelector('#cts_security_none');
const cts_security_tls = document.querySelector('#cts_security_tls');
const cts_security_xtls = document.querySelector('#cts_security_xtls');
const lp_socks_port = document.querySelector('#lp_socks_port');
const lp_http_port = document.querySelector('#lp_http_port');
const lp_lanEnabled = document.querySelector('#lp_lanEnabled');


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


(() => {
    // 控件值有改变时，检查是否需要重新应用 xray config
    let options = [
        cts_address, cts_port, cts_id, cts_level, cts_ws_path,
        cts_net_tcp, cts_net_ws,
        cts_security_none, cts_security_tls, cts_security_xtls,
        lp_socks_port, lp_http_port, lp_lanEnabled
    ];
    for (let option of options) {
        option.onchange = checkOptions;
    }


    // 点击随机或转换 uuid 按钮
    document.querySelector('#cts_idBtn').addEventListener('click', () => {
        window.electron.send(window.electron.S.CREATE_UUID, cts_id.value);
    });

    // 更新 uuid
    window.electron.receive(window.electron.R.UPDATE_UUID, (uuid) => {
        cts_id.value = uuid;
        mdlTextFieldCheckDirty();
        checkOptions();
    });

    // 更新 profile
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
        let lpSwitch = lp_lanEnabled.parentNode.MaterialSwitch;
        data.general.localProxy.lanEnabled ? lpSwitch.on() : lpSwitch.off();
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
