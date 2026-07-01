const mongroose = require('mongoose');
require('../database/connection');


const USER_ROLES = {
    ADMIN: 'ADMIN',
    CITIZEN: 'CITIZEN',
};

const userSchema = new mongroose.Schema({

    name: {
        type: String,
        default:""
    },
    email: {
        type: String,
        required: true,
        unique: true,
        validate: {
            validator: function (value) {
                return /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/.test(value);
            },
            message: 'Please enter a valid email address'
        }
    },
    otp: Number,
    roles: {
        type: String,
        enum: [USER_ROLES.CITIZEN, USER_ROLES.ADMIN],
        default: USER_ROLES.CITIZEN
    },
    otpExpires: Number,
    createdAt: Number,
    updatedAt: Number

});


module.exports = mongroose.model("otp", userSchema);