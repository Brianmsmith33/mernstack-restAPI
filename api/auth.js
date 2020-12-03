const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const auth = require('../middleware/auth');
const jwt = require('jsonwebtoken');
const { check, validationResult } = require('express-validator');

const User = require('../models/User');

// Check if Registered
router.post(
	'/check',
	[
		[
			check('firstname', 'First name is required').not().isEmpty(),
			check('lastname', 'Last name is required').not().isEmpty(),
			check('email', 'Email is required').not().isEmpty(),
			check('password', 'Password is required').not().isEmpty(),
		],
	],
	async (req, res) => {
		try {
			const user = await User.findOne({ email: req.body.email });
            if (user) {
                if(user.isAdmin) {
                    const result = 1;
                    res.json(result);
                }else{
                    const result = 2;
                    res.json(result);
                }
                
            } else {
                const result = 0;
                res.json(result);
            }
		} catch (err) {
			res.status(500).send('Server Error');
		}
	}
);

//Get User
router.get('/user', auth, async (req, res) => {
	try {
		const user = await User.findById(req.user.user.id).select('-password');
		res.json(user);
	} catch (err) {
		console.error(err.message);
		res.status(500).send('Server Error');
	}
});

//Login
router.post(
	'/user',
	[
		check('email', 'Please provide a valid email').isEmail(),
		check('password', 'Password is required').exists(),
	],
	async (req, res) => {
		const errors = validationResult(req);
		if (!errors.isEmpty()) {
			return res.status(400).json({ errors: errors.array() });
		}
		const { email, password } = req.body;

		try {
			let user = await User.findOne({ email });

			if (!user) {
				return res
					.status(400)
					.json({ errors: [{ msg: 'Incorrect email or password' }] });
			}

			const isMatch = await bcrypt.compare(password, user.password);

			if (!isMatch) {
				return res
					.status(400)
					.json({ errors: [{ msg: 'Incorrect email or password' }] });
			}

			
			const payload = {
				user: {
					id: user.id,
				},
			};

			jwt.sign(
				payload,
				process.env.JWT_SECRET,
				{ expiresIn: 3600 },
				(err, token) => {
					if (err) throw err;
					res.json({ token });
				}
			);
		} catch (err) {
			console.error(err.message);
			res.status(500).send('Server error');
		}
	}
);

// Register
router.post(
	'/',
	[
		check('firstname', 'First name is required').not().isEmpty(),
		check('lastname', 'Last name is required').not().isEmpty(),
		check('email', 'Please provide a valid email').isEmail(),
		check(
			'password',
			'Please enter a password with 6 or or characters'
		).isLength({ min: 6 }),
	],
	async (req, res) => {
		console.log(req);
		const errors = validationResult(req);
		if (!errors.isEmpty()) {
			return res.status(400).json({ errors: errors.array() });
		}

		const { firstname, lastname, email, password } = req.body;

		try {
			let user = await User.findOne({ email });

			if (user) {
				return res
					.status(400)
					.json({ errors: [{ msg: 'User already exists' }] });
			}

			user = new User({
				firstname,
				lastname,
				email,
				password,
			});

			const salt = await bcrypt.genSalt(10);

			user.password = await bcrypt.hash(password, salt);
			await user.save();

			const payload = user.toJSON();

			jwt.sign(
				payload,
				process.env.JWT_SECRET,
				{ expiresIn: 360000 },
				(err, token) => {
					if (err) throw err;
					res.json({ token });
				}
			);
		} catch (err) {
			console.error(err);
			res.status(500).send('Server error');
		}
	}
);


module.exports = router;
