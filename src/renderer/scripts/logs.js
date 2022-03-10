'use strict';

/**
 * Created by LOLO on 2022/03/09.
 */


/**
 * 拷贝日志到系统剪切板
 * @param type {string}
 */
function copyLogToClipboard(type) {
    let text = document.querySelector(`#${type}LogContent`).textContent;
    window.electron.setClipboardText(text);
    showHint('copied');
}

/**
 * 另存日志到本地文件中
 * @param type {string}
 */
function saveAsLogFile(type) {
    let text = document.querySelector(`#${type}LogContent`).textContent;
    window.electron.send(window.electron.S.SAVE_FILE, type + '.log', text);
}


(() => {
    window.electron.receive(window.electron.R.UPDATE_ACCESS_LOG, (data) => {
        console.log('acc:' + data);
    });

    window.electron.receive(window.electron.R.UPDATE_ERROR_LOG, (data) => {
        console.log('err:' + data);
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