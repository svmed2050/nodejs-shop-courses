const { Router } = require('express')
const router = Router()
const User = require('../models/user')

const { validationResult } = require('express-validator')
const { registerValidators } = require('../utils/validators')

const bcrypt = require('bcryptjs')
const crypto = require('crypto')

// const nodemailer = require('nodemailer')
// const sendgrid = require('nodemailer-sendgrid-transport')
const keys = require('../keys')
const regEmail = require('../emails/registration')
const resetEmail = require('../emails/reset')

var SibApiV3Sdk = require('sib-api-v3-sdk');
SibApiV3Sdk.ApiClient.instance.authentications['api-key'].apiKey = keys.SENDINBLUE_API_KEY;

// const transporter = nodemailer.createTransport(
//   sendgrid({
//     auth: { api_key: keys.SENDGRID_API_KEY }
//   })
//   // {
//   //   service: 'gmail',
//   //   auth: {
//   //     user: 'pavelsergienko7@gmail.com',
//   //     pass: ''
//   //   }
//   // }
// )

async function sendEmail(sendingFunction, ...args) {
  return await new SibApiV3Sdk.TransactionalEmailsApi().sendTransacEmail(sendingFunction(...args)).then(function (data) {
    console.log(data);
  }, function (error) {
    console.error(error);
  });
}

router.get('/password/:token', async (req, res) => {
  if (!req.params.token) {
    return res.redirect('/auth/login')
  }

  try {
    const user = await User.findOne({
      resetToken: req.params.token,
      resetTokenExp: { $gt: Date.now() }
    })

    if (!user) {
      return res.redirect('/auth/login')
    } else {
      res.render('auth/password', {
        title: 'Restore access',
        error: req.flash('error'),
        userId: user._id.toString(),
        token: req.params.token
      })
    }

  } catch (error) {
    console.log(error)
  }


})

router.post('/password', async (req, res) => {
  try {
    const user = await User.findOne({
      _id: req.body.userId,
      resetToken: req.body.token,
      resetTokenExp: { $gt: Date.now() }
    })

    if (user) {
      user.password = await bcrypt.hash(req.body.password, 10)
      user.resetToken = undefined
      user.resetTokenExp = undefined
      await user.save()
      res.redirect('/auth/login')
    } else {
      req.flash('loginError', 'Lifetime of token has expired')
      res.redirect('/auth/login')
    }

  } catch (error) {
    console.log(error)
  }
})

router.get('/login', async (req, res) => {
  res.render('auth/login', {
    title: 'Authorization',
    isLogin: true,
    loginError: req.flash('loginError'),
    registerError: req.flash('registerError')
  })
})

router.get('/logout', async (req, res) => {
  req.session.destroy(() => {
    res.redirect('/auth/login#login')
  })
})

router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body

    const candidate = await User.findOne({ email })

    if (candidate) {
      const areSame = await bcrypt.compare(password, candidate.password)

      if (areSame) {
        req.session.user = candidate
        req.session.isAuthenticated = true
        req.session.save(err => {
          if (err) {
            throw err
          }
          res.redirect('/')
        })
      } else {
        req.flash('loginError', `Wrong password`)
        res.redirect('/auth/login#login')
      }

    } else {
      req.flash('loginError', `This user doesn't exist`)
      res.redirect('/auth/login#login')
    }

  } catch (error) {
    console.log(error)
  }


})

router.post('/register', registerValidators, async (req, res) => {
  try {
    const { email, password, name } = req.body

    const errors = validationResult(req)
    if (!errors.isEmpty()) {
      req.flash('registerError', errors.array()[0].msg)
      return res.status(422).redirect('/auth/login#register')
    }
    const hashPassword = await bcrypt.hash(password, 10)
    const user = new User({
      email,
      name,
      password: hashPassword,
      cart: { items: [] }
    })
    await user.save()
    res.redirect('/auth/login#login')
    await sendEmail(regEmail, email)

  } catch (error) {
    console.log(error)
  }
})

router.get('/reset', (req, res) => {
  res.render('auth/reset', {
    title: 'Forgot your password?',
    error: req.flash('error')
  })
})

/* 
 Алгоритм восстановления пароля:
 1. Генерируем рандомный ключ, который запишем
 пользователю в базу данных
 2. Отправим пользователю письмо, 
 содержащее данный ключ
 3. Человек перейдет по ссылке,
 содержащий данных ключ
 4. Если этот ключ будет совпадать с тем,
 который записан в базе данных + у него 
 не истечет время жизни данного токена,
 тогда мы дадим ему возможность изменить пароль.
 5. Для этого нам нужно синхронизировать:
 - токен, который лежит в базе
 - токен, который мы передаем через email
 - время жизни, id пользователя, 
 email пользователя и изменение пароля
 
 */

router.post('/reset', (req, res) => {
  try {
    crypto.randomBytes(32, async (err, buffer) => {
      if (err) {
        req.flash('error', 'Something went wrong - try again')
        return res.redirect('/auth/reset')
      }
      // Создаем токен для изменения пароля
      const token = buffer.toString('hex')
      const candidate = await User.findOne({ email: req.body.email })

      if (candidate) {
        candidate.resetToken = token
        candidate.resetTokenExp = Date.now() + 60 * 60 * 1000 // 1 hour
        await candidate.save()
        await sendEmail(resetEmail, candidate.email, token)
        res.redirect('/auth/login')

      } else {
        req.flash('error', `This email doesn't exist`)
        res.redirect('/auth/reset')
      }
    })
  } catch (error) {
    console.log(error)
  }
})


module.exports = router