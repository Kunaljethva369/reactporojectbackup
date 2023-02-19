const jwt = require('jsonwebtoken');
const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    Name: {
        type: String,
        required: true,
    },
    Email: {
        type: String,
        required: true,
        index: { unique: true }
    },
    Password: {
        type: String,
        requtied: true
    },
    tokens: [
        {
            token: {
                type: String,
                required: true,
            }
        }
    ]
});


userSchema.methods.generateAuth = async function () {
    try {
        let token = jwt.sign({ _id: this._id }, process.env.Secret_key);
        this.tokens = this.tokens.concat({ token: token });
        await this.save();
        return token;
    }
    catch (err) {
        console.log(err);
    }
}

const User = mongoose.model('user', userSchema);


module.exports = User;
