const router = require("express").Router()
const {register, login, getUserInfo, getAllUsers, deleteUser} = require("../controllers/userControllers")
const authMiddleware = require("../middlewares/authMiddleware")

router.post('/register',register)
router.post('/login',login)
router.post('/get-user-info',authMiddleware,getUserInfo)
router.post('/get-all-users',authMiddleware,getAllUsers)
router.post('/delete-user',authMiddleware,deleteUser)


module.exports = router