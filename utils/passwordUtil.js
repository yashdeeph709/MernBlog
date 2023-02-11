const bcrypt = require('bcryptjs');
const _isEmpty = require('lodash').isEmpty;

const getPasswordHash = async ( password ) => {
    if(_isEmpty(password)){
        throw new Error('Password cannot be empty');
    }
    const salt = await bcrypt.genSalt(10);
    return await bcrypt.hash(password, salt);
}
const comparePassword = async ( expectedPassword, actualPassword  ) => {
    if(_isEmpty(actualPassword) || _isEmpty(expectedPassword)){
        throw new Error('Password cannot be empty');
    }
    return await bcrypt.compare(expectedPassword, actualPassword);
}
module.exports = { getPasswordHash, comparePassword };