'use strict';
/**
 * Created by LOLO on 2022/03/09.
 */


let errorLogContent = document.querySelector('#errorLogContent');
let accessLogContent = document.querySelector('#accessLogContent');


/**
 * 获取日志内容
 * @param type
 * @returns {string}
 */
function getLogContent(type) {
    let element = type === 'error' ? errorLogContent : accessLogContent;
    return element.innerHTML
        .replaceAll('<span>', '\n')
        .replaceAll('</span>', '')
        .trim();
}

/**
 * 拷贝日志到系统剪切板
 * @param type {string}
 */
function copyLogToClipboard(type) {
    window.electron.setClipboardText(getLogContent(type));
    showHint('copied');
}

/**
 * 另存日志到本地文件中
 * @param type {string}
 */
function saveAsLogFile(type) {
    window.electron.send(window.electron.S.SAVE_FILE, type + '.log', getLogContent(type));
}

/**
 * 清空所有日志内容
 */
function cleanLogContent() {
    errorLogContent.textContent = accessLogContent.textContent = "";
}

(() => {
    // receive / append logs
    const appendLog = (element, data) => {
        let list = data.split('\n');
        for (let item of list) {
            item = item.trim();
            if (!item.endsWith(' [api]'))
                element.innerHTML += `<span>${item}</span>`;
        }
    };

    window.electron.receive(window.electron.R.UPDATE_ACCESS_LOG, (data) => {
        if (data.substr(19, 2) === ' [')
            appendLog(errorLogContent, data);
        else
            appendLog(accessLogContent, data);
    });

    window.electron.receive(window.electron.R.UPDATE_ERROR_LOG, (data) => {
        appendLog(errorLogContent, data);
    });


    // log level buttons
    const SLE_CLS = 'log-level-selected';
    const log_level_none = document.querySelector('#log_level_none');
    const log_level_error = document.querySelector('#log_level_error');
    const log_level_warning = document.querySelector('#log_level_warning');
    const log_level_info = document.querySelector('#log_level_info');
    const log_level_debug = document.querySelector('#log_level_debug');

    let curSelectedLevel = null;
    const onClickLogLevel = (element) => {
        if (curSelectedLevel)
            curSelectedLevel.classList.remove(SLE_CLS);
        curSelectedLevel = element;
        curSelectedLevel.classList.add(SLE_CLS);
        tmpProfileData.log.level = curSelectedLevel.id.split('_')[2];
        checkOptions();
    };

    log_level_none.addEventListener('click', () => onClickLogLevel(log_level_none));
    log_level_error.addEventListener('click', () => onClickLogLevel(log_level_error));
    log_level_warning.addEventListener('click', () => onClickLogLevel(log_level_warning));
    log_level_info.addEventListener('click', () => onClickLogLevel(log_level_info));
    log_level_debug.addEventListener('click', () => onClickLogLevel(log_level_debug));


    // profile 有更新
    window.electron.receive(window.electron.R.UPDATE_PROFILE_DATA, (data) => {
        onClickLogLevel(document.querySelector('#log_level_' + data.log.level));
    });
})();