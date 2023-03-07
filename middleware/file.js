const multer = require('multer')
const moment = require('moment')

/* Куда и как сохранять файлы,
который загружаем на сервер*/
const storage = multer.diskStorage({
  destination(req, file, cb) {
    cb(null, 'images')
  },
  filename(req, file, cb) {
    const date = moment().format('DDMMYYYY-HHmmss_SSS')
    // cb(null, new Date().toISOString() + '-' + file.originalname) - неправильная строчка
    cb(null, `${date}-${file.originalname}`)
  }
})

const allowedTypes = ['image/png', 'image/jpg', 'image/jpeg']


/* Валидация для файлов */
const fileFilter = (req, file, cb) => {
  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true)
  } else {
    cb(null, false)
  }
}

const limits = {
  fileSize: 1024 * 1024 * 5
}

module.exports = multer({
  storage,
  fileFilter,
  limits
})
