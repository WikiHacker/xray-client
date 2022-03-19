'use strict';
/**
 * Created by LOLO on 2022/02/21.
 */


// dayjs
dayjs.extend(window.dayjs_plugin_relativeTime);
dayjs.extend(window.dayjs_plugin_localizedFormat);

const CSS_CLASS_HIDDEN = 'element-hidden';


/**
 * 设置 element 的 innerHTML，并更新其中的 MDL 元素
 * @param element {string|Element}
 * @param innerHTML {string}
 */
function mdlSetInnerHTML(element, innerHTML) {
    if (typeof (element) === 'string')
        element = document.querySelector(element);
    element.innerHTML = innerHTML;
    componentHandler.upgradeAllRegistered();
}


/**
 * 更新 MDL 输入框
 */
function mdlTextFieldCheckDirty() {
    let mdlInputs = document.querySelectorAll('.mdl-js-textfield');
    for (let mdlInput of mdlInputs) {
        mdlInput.MaterialTextfield.checkDirty();
    }
}


function replaceInputSpace(input) {
    input.value = input.value.replace(/\s+/g, '');
}

function isEmpty(str) {
    return (!str || str.trim().length === 0);
}


/**
 * 在底部弹出一个提示文本
 * @param msg {string}
 * @param timeout {number}
 */
function showHint(msg, timeout = 2000) {
    let snackbar = document.querySelector('#hintSnackbar').MaterialSnackbar
    snackbar.showSnackbar({message: msg, timeout});
}


(() => {
    // pages & buttons
    const pages = {profiles: 'profiles', general: 'general', rules: 'rules', proxies: 'proxies', logs: 'logs'};
    let curPage;

    const CLS_NAV_BTN_SEL = 'nav-btn-selected';
    const invokeChangePage = (p, v) => {
        let btn = document.querySelector(`#${p}Btn`);
        let page = document.querySelector(`#${p}Page`);
        if (v) {
            btn.classList.add(CLS_NAV_BTN_SEL);
            page.classList.remove(CSS_CLASS_HIDDEN);
        } else {
            btn.classList.remove(CLS_NAV_BTN_SEL);
            page.classList.add(CSS_CLASS_HIDDEN);
        }
    }
    const changePage = (targetPage) => {
        if (targetPage === curPage) return;
        if (curPage) invokeChangePage(curPage, false);
        invokeChangePage(targetPage, true);
        curPage = targetPage;
    }

    for (let page in pages) {
        document.querySelector(`#${page}Btn`).addEventListener('click', () => {
            changePage(page);
        });
    }
    changePage(pages.general);


    // 点击关闭按钮，隐藏所有窗口
    document.querySelector('#hideAppBtn').addEventListener('click', () => {
        window.electron.send(window.electron.S.HIDE_APP);
    });

    // 点击查看规则介绍按钮
    document.querySelector('#ruleHelpBtn').addEventListener('click', () => {
        window.electron.openExternal('https://xtls.github.io/config/routing.html');
    });


    //
    window.electron.receive(window.electron.R.SHOW_TIPS, msg => showHint(msg));


    // footer - speed stats
    const speedStats = document.querySelector('#speedStats');
    const formatByte = (byte) => {
        if (byte === 0)
            return '0';
        if (byte > 1000000)
            return (byte / 1048576).toFixed(2) + ' MB';
        if (byte > 1000)
            return (byte / 1024).toFixed(2) + ' KB';
        return byte.toFixed(0) + ' B';
    };

    window.electron.receive(window.electron.R.UPDATE_SPEED_STATS, (speed) => {
        speedStats.textContent = `${formatByte(speed.up)} / ${formatByte(speed.down)}`;
    });


    // footer - conn status
    const connectedStatus = document.querySelector('#connectedStatus');
    const disconnectStatus = document.querySelector('#disconnectStatus');
    connectedStatus.classList.add(CSS_CLASS_HIDDEN)

    window.electron.receive(window.electron.R.UPDATE_RUNNING_STATUS, (running) => {
        if (running) {
            connectedStatus.classList.remove(CSS_CLASS_HIDDEN);
            disconnectStatus.classList.add(CSS_CLASS_HIDDEN);
        } else {
            connectedStatus.classList.add(CSS_CLASS_HIDDEN);
            disconnectStatus.classList.remove(CSS_CLASS_HIDDEN);
            speedStats.textContent = '0 / 0';
            showHint('Xray has stopped.');
        }
    });


    // about dialog
    const aboutDialog = document.querySelector('#aboutDialog');
    aboutDialog.querySelector('.github').addEventListener('click', () => {
        window.electron.openExternal('https://github.com/lolo1208/XrayClient');
    });
    aboutDialog.querySelector('.close').addEventListener('click', () => {
        aboutDialog.classList.add(CSS_CLASS_HIDDEN);
    });

    window.electron.receive(window.electron.R.SHOW_ABOUT, () => {
        aboutDialog.classList.remove(CSS_CLASS_HIDDEN);
    });

    window.electron.receive(window.electron.R.UPDATE_VERSION_INFO, (data) => {
        aboutDialog.querySelector('.mdl-card__supporting-text').innerHTML = `
            XrayClient version: ${data.appVersion}<br>
            Xray-Core version: ${data.xrayVersion.split(' ')[1]}<br>
            GEOs last updated on ${dayjs(data.geoLastUpdate).format('LL')}
        `;
    });
})();

