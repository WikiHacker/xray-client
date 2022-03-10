'use strict';
/**
 * Created by LOLO on 2022/02/21.
 */


// dayjs
dayjs.extend(window.dayjs_plugin_relativeTime);
dayjs.extend(window.dayjs_plugin_localizedFormat);


const PAGES = {profiles: 'profiles', general: 'general', rules: 'rules', proxies: 'proxies', logs: 'logs'};
let curPage;


/**
 * 切换当前页面至 targetPage
 * @param targetPage {string}
 */
function changePage(targetPage) {
    if (targetPage === curPage) return;
    const change = (p, v) => {
        let btn = document.querySelector(`#${p}Btn`);
        let page = document.querySelector(`#${p}Page`);
        if (v) {
            btn.classList.add('nav-btn-selected');
            page.classList.remove('element-hidden');
        } else {
            btn.classList.remove('nav-btn-selected');
            page.classList.add('element-hidden');
        }
    }
    if (curPage) change(curPage, false);
    change(targetPage, true);
    curPage = targetPage;
}

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
 * @param msg
 */
function showHint(msg) {
    let snackbar = document.querySelector('#hintSnackbar').MaterialSnackbar
    snackbar.showSnackbar({message: msg, timeout: 1700,});
}


(() => {
    // 分页按钮
    for (let page in PAGES) {
        document.querySelector(`#${page}Btn`).addEventListener('click', () => {
            changePage(page);
        });
    }
    changePage(PAGES.proxies);


    // 点击关闭按钮，隐藏所有窗口
    document.querySelector('#hideAppBtn').addEventListener('click', () => {
        window.electron.send(window.electron.S.HIDE_APP);
    });

    // 点击查看规则介绍按钮
    document.querySelector('#ruleHelpBtn').addEventListener('click', () => {
        window.electron.openExternal('https://xtls.github.io/config/routing.html');
    });

    //

    window.electron.receive(window.electron.R.SHOW_TIPS, (msg) => {
        showHint(msg);
    });
})();

