var bcrypt = require('bcryptjs');

const checkFields = (fields) => {
    let errors = ''
    for (const key in fields) {
        if(!fields[key])
            errors += `${key} `
    }
    if(errors)
        return errors
}

const cryptPass = (password) => {
    var salt = bcrypt.genSaltSync(10);
    var hash = bcrypt.hashSync(password, salt);
    return hash;
}

const compareCrypt = (password, hash) => {
    return bcrypt.compareSync(password, hash);
}

module.exports = {checkFields, cryptPass, compareCrypt}