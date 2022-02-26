'use strict';

/**
 * Created by LOLO on 2022/02/21.
 */

const PAGES = {profiles: 'profiles', general: 'general', rules: 'rules', proxies: 'proxies', logs: 'logs'};
let curPage;


/**
 * 移除当前选中的配置文件
 */
const removeCurrentProfile = () => {
    console.log('???!!!');
}


/**
 * 切换当前页面至 targetPage
 * @param targetPage {string}
 */
const changePage = (targetPage) => {
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


(() => {
    // 分页按钮
    for (let page in PAGES) {
        document.querySelector(`#${page}Btn`).addEventListener('click', () => {
            changePage(page);
        });
    }
    changePage(PAGES.rules);

    // 点击关闭按钮，隐藏所有窗口
    document.querySelector('#hideAppBtn').addEventListener('click', () => {
        window.electron.hideApp();
    });


    // 移除 profile 提示弹窗
    let removeProfileDialog = document.querySelector('#removeProfileDialog');
    removeProfileDialog.querySelector('.cancel').addEventListener('click', () => {
        removeProfileDialog.close();
    });
    removeProfileDialog.querySelector('.yes').addEventListener('click', () => {
        removeProfileDialog.close();
        removeCurrentProfile();
    });
    let showDialogBtn = document.querySelector('#pingBtn');
    showDialogBtn.addEventListener('click', () => {
        removeProfileDialog.showModal();
    });


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


    // 点击查看规则介绍按钮
    document.querySelector('#ruleHelpBtn').addEventListener('click', () => {
        window.electron.openExternal('https://www.v2ray.com/en/configuration/routing.html');
    });
})();

