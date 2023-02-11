const { validate }= require('uuid')

const validateUUID = id => {
    const isValid = validate(id)
    if(!isValid){
        throw new Error('User id is not valid ')
    }
}
module.exports = { validateUUID }