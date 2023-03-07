const { Router } = require('express')
const Course = require('../models/course')
const router = Router()
const auth = require('../middleware/auth')

const { courseValidators } = require('../utils/validators')
const { validationResult } = require('express-validator')

function isOwner(course, req) {
  return course.userId.toString() === req.user._id.toString()
}

router.get('/', async (req, res) => {

  try {
    const courses = await Course.find()
      .populate('userId', 'email name')
      .select('price title img')

    res.render('courses', {
      title: 'Courses',
      isCourses: true,
      userId: req.user ? req.user._id.toString() : null,
      courses
    })
  } catch (error) {
    console.log(error)
  }


})

router.get('/:id', async (req, res) => {
  try {
    const id = req.params.id
    if (id.match(/^[0-9a-fA-F]{24}$/)) {
      const course = await Course.findById(id)
      res.render('course', {
        layout: 'empty',
        title: `Course ${course.title}`,
        course
      })
    }
  } catch (error) {
    console.log(error)
  }

})

router.post('/remove', auth, async (req, res) => {
  try {
    await Course.deleteOne({
      _id: req.body.id,
      userId: req.user._id
    })
    res.redirect('/courses')
  } catch (error) {
    console.log(error)
  }

})

router.get('/:id/edit', auth, async (req, res) => {
  if (!req.query.allow) {
    return res.redirect('/')
  }

  try {
    const course = await Course.findById(req.params.id)

    if (!isOwner(course, req)) {
      return res.redirect('/courses')
    }

    res.render('course-edit', {
      title: `Editing ${course.title} course`,
      course
    })
  } catch (error) {
    console.log(error)
  }


})

router.post('/edit', auth, courseValidators, async (req, res) => {

  const errors = validationResult(req)
  const { id } = req.body

  if (!errors.isEmpty()) {
    return res.status(422).redirect(`/courses/${id}/edit?allow=true`)
  }


  try {

    delete req.body.id
    const course = await Course.findById(id)
    if (!isOwner(course, req)) {
      return res.redirect('/courses')
    }

    Object.assign(course, req.body)
    await course.save()

    // await Course.findByIdAndUpdate(id, req.body)
    res.redirect('/courses')
  } catch (error) {
    console.log(error)
  }


})




module.exports = router