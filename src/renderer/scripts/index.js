'use strict';
/**
 * Created by LOLO on 2022/02/21.
 */


// dayjs
dayjs.extend(window.dayjs_plugin_relativeTime);


const PAGES = {profiles: 'profiles', general: 'general', rules: 'rules', proxies: 'proxies', logs: 'logs'};
let curPage;
let optionsChanged;


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
 * 验证当前 xray 参数是否有改变
 */
function checkOptions() {
    console.log(document.querySelector('input[name="cts_net"]:checked').value);
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


function mdlTextfieldCheckDirty() {
    let mdlInputs = document.querySelectorAll('.mdl-js-textfield');
    for (let mdlInput of mdlInputs) {
        mdlInput.MaterialTextfield.checkDirty();
    }
}


(() => {
    // 分页按钮
    for (let page in PAGES) {
        document.querySelector(`#${page}Btn`).addEventListener('click', () => {
            changePage(page);
        });
    }
    changePage(PAGES.general);


    // 添加 rule 弹窗界面
    let addRuleDialog = document.querySelector('#addRuleDialog');
    addRuleDialog.querySelector('.cancel').addEventListener('click', () => {
        addRuleDialog.close();
    });
    addRuleDialog.querySelector('.ok').addEventListener('click', () => {
        addRuleDialog.close();
        console.log('YES!!');
    });
    let addRuleBtn = document.querySelector('#addRuleBtn');
    addRuleBtn.addEventListener('click', () => {
        addRuleDialog.showModal();
    });


    // 点击关闭按钮，隐藏所有窗口
    document.querySelector('#hideAppBtn').addEventListener('click', () => {
        window.electron.send(window.electron.S.HIDE_APP);
    });

    // 点击查看规则介绍按钮
    document.querySelector('#ruleHelpBtn').addEventListener('click', () => {
        window.electron.openExternal('https://xtls.github.io/config/routing.html');
    });


    // 显示一段文字提示
    window.electron.receive(window.electron.R.SHOW_TIPS, (msg) => {
        let snackbar = document.querySelector('#tipsSnackbar');
        snackbar.MaterialSnackbar.showSnackbar({
            actionHandler: () => {
                snackbar.MaterialSnackbar.cleanup_();
            },
            actionText: 'ok', message: msg, timeout: 2000
        });
    });
})();

