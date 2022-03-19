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
    return formatLogRuleOut(element.innerHTML)
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
 * 清空日志内容
 */
function cleanLogContent(type) {
    if (type) {
        let element = type === 'error' ? errorLogContent : accessLogContent;
        element.textContent = '';
    } else
        errorLogContent.textContent = accessLogContent.textContent = '';
}


function formatLogRuleOut(input, toHtml) {
    for (let i = 0; i < RULE_OUT.length; i++) {
        let out = RULE_OUT[i];
        let a = `<span class="log-rule rule-${out}">${out}</span>`;
        let b = `[${out}]`;
        input = toHtml ? input.replaceAll(b, a) : input.replaceAll(a, b);
    }
    return input;
}


(() => {
    // receive logs
    const appendLog = (element, data) => {
        element.innerHTML += `<span>${data}</span>`;
        // limit 200 logs
        while (element.childElementCount > 200)
            element.removeChild(element.firstChild);
    };

    window.electron.receive(window.electron.R.UPDATE_ACCESS_LOG, (data) => {
        let list = data.split('\n');
        for (let item of list) {
            item = item.trim();
            if (isEmpty(item) || item.endsWith('[api]')) continue;
            if (item.endsWith(']')) {
                let idx = item.indexOf('//') + 2;
                if (idx === 1) idx = item.indexOf('accepted') + 9;
                item = formatLogRuleOut(item.substr(idx), true);
                appendLog(accessLogContent, item);
            } else
                appendLog(errorLogContent, item);
        }
    });

    window.electron.receive(window.electron.R.UPDATE_ERROR_LOG, (data) => {
        appendLog(errorLogContent, data.trim());
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