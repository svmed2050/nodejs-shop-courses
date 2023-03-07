const { body } = require('express-validator')
const User = require('../models/user')

exports.registerValidators = [
  body('email')
    .isEmail()
    .withMessage('Please enter a valid email address')
    .custom(async (value, { req }) => {
      try {
        const user = await User.findOne({ email: value })
        if (user) {
          return Promise.reject('This email has already been used')
        }
      } catch (error) {
        console.log(error)
      }
    }).normalizeEmail(),

  body('password', 'Password must be at least 6 characters')
    .isLength({ min: 6, max: 56 })
    .isAlphanumeric()
    .trim(),

  body('confirm').custom((value, { req }) => {
    if (value !== req.body.password) {
      throw new Error('Passwords must match')
    }
    return true
  }).trim(),

  body('name').isLength({ min: 3 })
    .withMessage('Name must contain at least 3 characters')
    .trim()
]


exports.courseValidators = [
  body('title').isLength({ min: 3 })
    .withMessage('The minimum length of the course name is at least 3 characters')
    .trim(),

  body('price')
    .isNumeric()
    .withMessage('Please enter a valid price'),

  body('img', 'Please enter a valid image URL')
    .isURL()
]