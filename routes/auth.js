const express = require('express')
const { body } = require('express-validator')

const authController = require('../controllers/auth')

const User = require('../models/user')

const router = express.Router()

router.put('/signup', [
    body('email')
    .isEmail()
    .withMessage('Enter a valid email!')
    .custom( (value) => {
        return User.findOne({ email: value})
                    .then(userDoc => {
                        if(userDoc) {
                            return Promise.reject('Email already exists!')
                        }
                    })
    })
    .normalizeEmail(),
    body('password').trim().isLength({min: 4}),
    body('name').trim().not().isEmpty()
], authController.signUp)

router.post('/login', authController.login)

module.exports = router