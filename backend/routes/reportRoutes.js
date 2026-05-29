const router =  require("express").Router()
const {addReport,getAllAttempts,getAllAttemptsByUser,getAdminAnalytics,getUserAnalytics,getAttemptsByExam} = require("../controllers/reportController")
const authMiddleware = require("../middlewares/authMiddleware")


router.post("/addReport",authMiddleware,addReport)
router.post("/getAllAttempts",authMiddleware,getAllAttempts)
router.get("/getAllAttemptsByUser",authMiddleware,getAllAttemptsByUser)
router.post("/admin-analytics",authMiddleware,getAdminAnalytics)
router.post("/user-analytics",authMiddleware,getUserAnalytics)
router.post("/getAttemptsByExam",authMiddleware,getAttemptsByExam)


module.exports = router;