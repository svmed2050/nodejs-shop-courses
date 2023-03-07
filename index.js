const express = require('express')
const path = require('path')
const csrf = require('csurf')
const mongoose = require('mongoose')
const exphbs = require('express-handlebars')
const app = express()
const helmet = require('helmet')
const compression = require('compression')

const session = require('express-session')
const MongoStore = require('connect-mongodb-session')(session)
const flash = require('connect-flash')
const varMiddleware = require('./middleware/variables')
const userMiddleware = require('./middleware/user')
const fileMiddleware = require('./middleware/file')

const homeRoutes = require('./routes/home')
const cartRoutes = require('./routes/cart')
const addRoutes = require('./routes/add')
const coursesRoutes = require('./routes/courses')
const ordersRoutes = require('./routes/orders')
const authRoutes = require('./routes/auth')
const profileRoutes = require('./routes/profile')

const Handlebars = require('handlebars')
const { allowInsecurePrototypeAccess } = require('@handlebars/allow-prototype-access')

const keys = require('./keys')
const errorHandler = require('./middleware/error')



// Configure express-handlebars
const hbs = exphbs.create({
  defaultLayout: 'main',
  extname: 'hbs',
  handlebars: allowInsecurePrototypeAccess(Handlebars),
  helpers: require('./utils/hbs-helpers')
})
const store = new MongoStore({
  collection: 'sessions',
  uri: keys.MONGODB_URI
})

// Регистрируем в express наличие движка hbs
app.engine('hbs', hbs.engine)
// Используем зарегистрированный движок hbs
app.set('view engine', 'hbs')
/* 
Вторым аргументов передаем название папки,
где будут храниться все шаблоны
*/
app.set('views', 'views')

/*  
app.use - позволяет добавлять новую функциональность
в наше приложение (middlewares)

Регистрируем папку public
*/
app.use(express.static(path.join(__dirname, 'public')))
app.use('/images', express.static(path.join(__dirname, 'images')))

app.use(express.urlencoded({ extended: true }))
app.use(session({
  secret: keys.SESSION_SECRET,
  resave: false,
  saveUninitialized: false,
  store
}))

app.use(fileMiddleware.single('avatar'))
app.use(csrf())
app.use(flash())
// app.use(helmet({
//     contentSecurityPolicy: {
//       useDefaults: true,
//       directives: {
//         "script-src": ["'self'", "cdn.jsdelivr.net", "cdnjs.cloudflare.com"],
//       },
//     },
//   }))
// app.use(helmet({
//   contentSecurityPolicy: false,
// }))
app.use(compression())
app.use(varMiddleware)
app.use(userMiddleware)

// Добавляем новые роуты
app.use('/', homeRoutes)
app.use('/courses', coursesRoutes)
app.use('/add', addRoutes)
app.use('/cart', cartRoutes)
app.use('/orders', ordersRoutes)
app.use('/auth', authRoutes)
app.use('/profile', profileRoutes)


app.use(errorHandler)










const PORT = process.env.PORT || 3000


async function start() {
  try {
    await mongoose.connect(keys.MONGODB_URI, {
      useNewUrlParser: true,
      // useFindAndModify: false
    })


    app.listen(PORT, () => {
      console.log(`Server is running in port ${PORT}`)
    })

  } catch (error) {
    console.log(error)
  }
}

start()

