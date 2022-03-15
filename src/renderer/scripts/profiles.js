'use strict';
/**
 * Created by LOLO on 2022/03/01.
 */


const UNKNOWN_HOST = 'unknown host'
let curProfileData;


function updateProfileList(list) {
    let data = '';
    for (let item of list) {
        let server = isEmpty(item.address) ? UNKNOWN_HOST : item.address;
        server += item.port === '' ? '' : ':' + item.port;
        let lastUsed = dayjs(item.lastUsed).fromNow();
        let name = item.name;

        data += `
        <div class="profiles-item">
            <div class="profile-intro">
                <span>${server}</span>
                <span>Last used: ${lastUsed}</span>
            </div>
            <button id="ping${name}btn" class="mdl-button mdl-js-button mdl-button--icon" onclick="pingProfileAddress(${name}, '${item.address}')">
                <img id="ping${name}img" src="assets/icons/ping-dead.svg"/>
            </button>
            <div id="ping${name}time" class="mdl-tooltip" for="ping${name}btn"></div>

            <button class="mdl-button mdl-js-button mdl-button--icon" onclick="saveProfile(${name})">
                <img src="assets/icons/profile-save.svg"/>
            </button>
            <button class="mdl-button mdl-js-button mdl-button--icon" onclick="removeProfile(${name})">
                <img src="assets/icons/profile-remove.svg"/>
            </button>
            <p></p>
            <label class="mdl-radio mdl-js-radio mdl-js-ripple-effect" for="use${name}">
                <input type="radio" class="mdl-radio__button" name="profiles" 
                id="use${name}" value="${name}" onchange="profileOnChange(${name})">
            </label>
        </div>
        `;
    }
    mdlSetInnerHTML('#profileList', data);
    updateCurSelectedProfile();

    // ping all
    for (let item of list) {
        pingProfileAddress(item.name, item.address);
    }
}


function updateCurSelectedProfile() {
    let element = document.querySelector('#use' + curProfileData.name);
    if (element)
        element.parentNode.MaterialRadio.check();
}


function pingProfileAddress(name, address) {
    let element = document.querySelector(`#ping${name}time`);
    if (isEmpty(address))
        element.textContent = UNKNOWN_HOST;
    else
        window.electron.invoke(window.electron.S.PING, address).then(value => {
            let img = document.querySelector(`#ping${name}img`);
            if (value.alive) {
                img.src = 'assets/icons/ping-alive.svg';
                element.textContent = `ping ${value.time}ms`;
            } else {
                img.src = 'assets/icons/ping-dead.svg';
                element.textContent = UNKNOWN_HOST;
            }
        });
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

function profileOnChange(name) {
    window.electron.send(window.electron.S.CHANGE_PROFILE, name);
}


(() => {
    document.querySelector('#importProfileBtn').addEventListener('click', () => {
        window.electron.send(window.electron.S.IMPORT_PROFILE);
    });

    document.querySelector('#createNewProfileBtn').addEventListener('click', () => {
        window.electron.send(window.electron.S.CREATE_PROFILE);
    });


    //

    window.electron.receive(window.electron.R.UPDATE_PROFILE_LIST, (data) => updateProfileList(data));

    window.electron.receive(window.electron.R.UPDATE_PROFILE_DATA, (data) => {
        curProfileData = data;
        updateCurSelectedProfile();
    });
})();

