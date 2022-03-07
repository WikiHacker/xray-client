'use strict';
/**
 * Created by LOLO on 2022/03/01.
 */


let curProfileData, profileList;


function updateProfileList(list) {
    let data = '';
    for (let item of list) {
        let server = item.address === '' ? 'unknown server' : item.address;
        server += item.port === '' ? '' : ':' + item.port;
        let lastUsed = dayjs(item.lastUsed).fromNow();
        let name = item.name;

        data += `
        <div class="profiles-item">
            <div class="profile-intro">
                <span>${server}</span>
                <span>Last used: ${lastUsed}</span>
            </div>
            <button id="ping${name}Btn" class="mdl-button mdl-js-button mdl-button--icon" onclick="pingByProfile(${name})">
                <img src="assets/icons/ping-dead.svg"/>
            </button>
            <div id="ping${name}Value" class="mdl-tooltip" for="ping${name}Btn">
                ping 123ms
            </div>

            <button class="mdl-button mdl-js-button mdl-button--icon" onclick="saveProfile(${name})">
                <img src="assets/icons/save.svg"/>
            </button>
            <button class="mdl-button mdl-js-button mdl-button--icon" onclick="removeProfile(${name})">
                <img src="assets/icons/remove.svg"/>
            </button>
            <p></p>
            <label class="mdl-radio mdl-js-radio mdl-js-ripple-effect" for="use${name}">
                <input type="radio" class="mdl-radio__button" name="profiles" 
                id="use${name}" value="${name}" onchange="profileOnChange(this)">
            </label>
        </div>
        `;
        mdlSetInnerHTML('#profileList', data);
    }
    profileList = list;
    updateCurSelectedProfile();
}


function updateCurSelectedProfile() {
    let element = document.querySelector('#use' + curProfileData.name);
    if (element)
        element.parentNode.MaterialRadio.check();
}


function pingByProfile(name) {
    let element = document.querySelector(`#ping${name}Value`);
    element.innerHTML = 'ping 233ms';
}

function saveProfile(name) {
    window.electron.send(window.electron.S.SAVE_PROFILE, name);
}

function removeProfile(name) {
    // 移除 profile 提示弹窗
    let removeProfileDialog = document.querySelector('#removeProfileDialog');
    let cancelBtn = removeProfileDialog.querySelector('.cancel');
    let yesBtn = removeProfileDialog.querySelector('.yes');
    let close = () => {
        cancelBtn.removeEventListener('click', close);
        yesBtn.removeEventListener('click', yes);
        removeProfileDialog.close();
    };
    let yes = () => {
        close();
        window.electron.send(window.electron.S.REMOVE_PROFILE, name);
    };
    cancelBtn.addEventListener('click', close);
    yesBtn.addEventListener('click', yes);
    removeProfileDialog.showModal();
}

function profileOnChange(radio) {
    window.electron.send(window.electron.S.CHANGE_PROFILE, radio.value);
}

function createNewProfile() {
    window.electron.send(window.electron.S.CREATE_PROFILE);
}

function importProfile() {
    window.electron.send(window.electron.S.IMPORT_PROFILE);
}


(() => {
    // profile 列表有更新
    window.electron.receive(window.electron.R.UPDATE_PROFILE_LIST, (data) => updateProfileList(data));

    // 切换了 profile
    window.electron.receive(window.electron.R.UPDATE_PROFILE_DATA, (data) => {
        curProfileData = data;
        updateCurSelectedProfile();
    });
})();

