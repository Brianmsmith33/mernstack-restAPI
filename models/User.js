const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
	firstname: {
		type: String,
		required: true,
	},
	lastname: {
		type: String,
		required: true,
	},
	email: {
		type: String,
		required: true,
		unique: true,
	},
	password: {
		type: String,
		required: true,
    },
    avatar: {
        type: String,
    },
    isAdmin: {
        type: Boolean,
        required: true
    },
	joined: {
		type: Date,
		default: Date.now,
	}
});

module.exports = User = mongoose.model('users', UserSchema);
