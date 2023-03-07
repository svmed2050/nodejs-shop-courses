const { v4: uuidv4 } = require('uuid')
const fs = require('fs')
const path = require('path')

class Course {
  constructor(title, price, img) {
    this.title = title
    this.price = price
    this.img = img
    this.id = uuidv4()
  }

  static async update(course) {
    const courses = await Course.getAll()
    const idx = courses.findIndex(c => c.id === course.id)
    courses[idx] = course

    return new Promise((resolve, reject) => {
      fs.writeFile(
        path.join(__dirname, '..', 'data', 'courses.json'),
        JSON.stringify(courses),
        (err) => {
          if (err) {
            reject(err)
          } else {
            resolve()
          }
        }
      )
    })
  }

  // helper function
  toJSON() {
    return {
      title: this.title,
      price: this.price,
      img: this.img,
      id: this.id
    }
  }

  // Сохраняем новый курс в файл courses.json
  async save() {
    const courses = await Course.getAll()
    courses.push(this.toJSON())

    return new Promise((resolve, reject) => {
      fs.writeFile(
        path.join(__dirname, '..', 'data', 'courses.json'),
        JSON.stringify(courses),
        (err) => {
          if (err) {
            reject(err)
          } else {
            resolve()
          }
        }
      )
    })
  }

  // Читаем из файла courses.json
  static getAll() {
    return new Promise((resolve, reject) => {
      fs.readFile(
        path.join(__dirname, '..', 'data', 'courses.json'),
        'utf-8',
        (err, content) => {
          if (err) {
            reject(err)
          } else {
            resolve(JSON.parse(content))
          }
        }
      )
    })
  }

  static async getById(id) {
    const courses = await Course.getAll()
    return courses.find(c => c.id === id)
  }


}

module.exports = Course