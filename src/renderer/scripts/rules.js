'use strict';
/**
 * Created by LOLO on 2022/03/08.
 */

let rulesChanged = false;


function updateRules() {
    let rules = curProfileData.rules;

    let data = '';
    let rule = (out, type, value, idx) => {
        let arr = value.split(':');
        let prefix, val;
        if (arr.length > 1) {
            prefix = arr.shift() + ':';
            val = arr.join(':');
        } else {
            prefix = '';
            val = value;
        }
        data += `
        <div class="rule-item">
            <span class="rule-item-out r-i-t-${out}">${out}</span>
            <span class="rule-item-prefix">${prefix}</span>
            <span class="rule-item-value">${val}</span>
            <img class="rule-item-type" src="assets/icons/rule-type-${type}.svg"/>
            <img class="rule-item-remove" src="assets/icons/rule-remove.svg" 
                 onclick="removeRule('${out}.${type}.${idx}')"/>
        </div>
        `;
    };

    let outList = ['reject', 'proxy', 'direct'];
    let typeList = ['domain', 'ip', 'port'];
    for (let i = 0; i < outList.length; i++) {
        let out = outList[i];
        if (rules[out]) {
            for (let j = 0; j < typeList.length; j++) {
                let type = typeList[j];
                let list = rules[out][type];
                if (list) {
                    for (let k = 0; k < list.length; k++) {
                        rule(out, type, list[k], k);
                    }
                }
            }
        }
    }

    document.querySelector('#ruleList').innerHTML = data;
}


/**
 * 移除指定的规则
 * @param key
 */
function removeRule(key) {
    let arr = key.split('.');
    let out = arr[0], type = arr[1], idx = parseInt(arr[2]);
    curProfileData.rules[out][type].splice(idx, 1);
    updateRules();
    rulesChanged = true;
    applyHint.show();
}


(() => {
    // profile 有更新
    window.electron.receive(window.electron.R.UPDATE_PROFILE_DATA, (data) => {
        updateRules();
    });


    // 添加规则弹窗
    const addRuleDialog = document.querySelector('#addRuleDialog');
    const a_r_content = document.querySelector('#a_r_content');

    const getRuleType = () => {
        return document.querySelector('input[name="a_r_type"]:checked').value
    };

    const addRule = () => {
        let content = a_r_content.value;
        if (isEmpty(content)) {
            showHint('Rule content cannot be empty.');
            return;
        }
        let out = document.querySelector('input[name="a_r_out"]:checked').value;
        let type = getRuleType();
        let prefix = curSelectedRuleType.textContent;
        let rules = curProfileData.rules[out][type];
        let rule = prefix === 'none' ? content : prefix + ':' + content;
        if (!rules) {
            rules = curProfileData.rules[out][type] = [];
        } else {
            for (let r of rules)
                if (r === rule) {
                    showHint('The same rule already exist.');
                    return;
                }
        }
        rules.push(rule);
        updateRules();
        rulesChanged = true;
        applyHint.show();
    };

    addRuleDialog.querySelector('.cancel').addEventListener('click', () => {
        addRuleDialog.close();
    });
    addRuleDialog.querySelector('.ok').addEventListener('click', () => {
        addRuleDialog.close();
        addRule();
    });
    document.querySelector('#addRuleBtn').addEventListener('click', () => {
        addRuleDialog.showModal();
    });


    // add rule prefix buttons
    const DIS_CLS = 'a-r-prefix-disabled', SLE_CLS = 'a-r-prefix-selected';
    const a_r_p_none = document.querySelector('#a_r_p_none');
    const a_r_p_regexp = document.querySelector('#a_r_p_regexp');
    const a_r_p_domain = document.querySelector('#a_r_p_domain');
    const a_r_p_full = document.querySelector('#a_r_p_full');
    const a_r_p_geosite = document.querySelector('#a_r_p_geosite');
    const a_r_p_geoip = document.querySelector('#a_r_p_geoip');


    const enablePrefix = (element, enabled) => {
        if (enabled)
            element.classList.remove(DIS_CLS)
        else {
            element.classList.add(DIS_CLS);
            element.classList.remove(SLE_CLS);
        }
    };
    const enableAllPrefix = (e1, e2, e3, e4, e5, e6) => {
        enablePrefix(a_r_p_none, e1);
        enablePrefix(a_r_p_regexp, e2);
        enablePrefix(a_r_p_domain, e3);
        enablePrefix(a_r_p_full, e4);
        enablePrefix(a_r_p_geosite, e5);
        enablePrefix(a_r_p_geoip, e6);
    }


    let curSelectedRuleType = null;
    const selectPrefix = (element, selected) => {
        if (element)
            selected ? element.classList.add(SLE_CLS) : element.classList.remove(SLE_CLS);
    };
    const changePrefix = (element) => {
        if (element !== curSelectedRuleType) {
            selectPrefix(curSelectedRuleType, false);
            selectPrefix(element, true);
            curSelectedRuleType = element;
        }
    }


    const typeChanged = () => {
        switch (getRuleType()) {
            case 'domain':
                enableAllPrefix(true, true, true, true, true, false);
                changePrefix(a_r_p_domain);
                break;
            case 'ip':
                enableAllPrefix(true, false, false, false, false, true);
                changePrefix(a_r_p_none);
                break;
            case 'port':
                enableAllPrefix(true, false, false, false, false, false);
                changePrefix(a_r_p_none);
        }
    }
    document.querySelector('#a_r_type_domain').onchange
        = document.querySelector('#a_r_type_ip').onchange
        = document.querySelector('#a_r_type_port').onchange
        = typeChanged;
    typeChanged();

    const onClickPrefix = (element) => {
        if (!element.classList.contains(DIS_CLS))
            changePrefix(element);
    };

    a_r_p_none.addEventListener('click', () => onClickPrefix(a_r_p_none));
    a_r_p_regexp.addEventListener('click', () => onClickPrefix(a_r_p_regexp));
    a_r_p_domain.addEventListener('click', () => onClickPrefix(a_r_p_domain));
    a_r_p_full.addEventListener('click', () => onClickPrefix(a_r_p_full));
    a_r_p_geosite.addEventListener('click', () => onClickPrefix(a_r_p_geosite));
    a_r_p_geoip.addEventListener('click', () => onClickPrefix(a_r_p_geoip));
})();
