const express = require('express')

const router = express.Router()

// Controller
const { addBooks, getAllBooks, getBook } = require('../controllers/books')
const { getProfile, updateProfile } = require('../controllers/profile')
const { register, login, checkAuth } = require('../controllers/auth')

// Middleware
// import middleware here
const { auth } = require('../middlewares/auth')
const { uploadFile } = require('../middlewares/uploadFile')

// Register & Login
router.post('/register', register)
router.post('/login', login)
router.get('/check-auth', auth, checkAuth);

// Book Route
router.post('/book', auth, uploadFile.fields([{name:"bookattachment", maxCount:1},{name:"thumbnail", maxCount:1},]), addBooks)
router.get('/book', auth, getAllBooks )
router.get('/book/:id', auth, getBook)

// Profile
router.patch('/profile/:id', auth, uploadFile.single("image"), updateProfile)
router.get('/profile/:id', auth, getProfile)

module.exports = router