'use strict';
/**
 * Created by LOLO on 2022/02/28.
 */

const {app} = require('electron');
const path = require('path');
const fs = require('fs-extra');


const STORE_FILE_PATH = path.normalize(app.getPath('userData') + '/Data/data.json');


let data;
if (fs.pathExistsSync(STORE_FILE_PATH))
    data = fs.readJsonSync(STORE_FILE_PATH);
else
    // default data
    data = {
        lastUsedProfile: null,
    };


/**
 * 将当前数据写入文件中
 * @returns {Promise<void>}
 */
async function save() {
    await fs.ensureDir(path.dirname(STORE_FILE_PATH));
    await fs.writeJson(STORE_FILE_PATH, data);
}


module.exports = {
    get data() {
        return data;
    },
    save,
};

