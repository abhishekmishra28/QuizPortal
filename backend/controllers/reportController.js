const Report = require("../models/reportModel")
const Exam = require("../models/examModel")
const User = require("../models/userModel")

//add attempts

const addReport = async(req,res) => {
    try{
        const { exam, user } = req.body;
        const existing = await Report.findOne({ exam, user });
        if (existing) {
            return res.send({
                message: "You have already attempted this exam. Reattempting is not allowed.",
                data: null,
                success: false
            });
        }
        const report = new Report(req.body);
        await report.save()
        res.send({
            message: "Attempt added successfully",
            data: null,
            success: true
        })
    }
    catch(error){
        res.send({
            message: error.message,
            data: error,
            success: false
        })
    }
}

// get all attempts
const getAllAttempts = async(req,res) => {
    try{
        const user_admin = await User.findOne({
            _id: req.body.userid
        })
        if(user_admin.isAdmin){
            const { examName, userName } = req.body
            const exam = await Exam.find({
                name: {
                    $regex: examName,
                }, 
            })
            const matchedExamIds = exam.map((exam)=>exam._id)
            const user = await User.find({
                name: {
                    $regex: userName,
                }, 
            })
            const matchedUserIds = user.map((user)=>user._id)
            const reports = await Report.find({
                exam: {
                  $in: matchedExamIds,
                },
                user: {
                  $in: matchedUserIds,
                },
            }).populate("exam").populate("user").sort({createdAt: -1})
            if(reports){
                res.send({
                    message: "All Attempts fetched successfully.",
                    data: reports,
                    success: true
                })
            }
            else{
                res.send({
                    message: "No Attempts to display.",
                    data: null,
                    success: false
                })
            }   
        }
        else{
            res.send({
                message: "Cannot Fetch All Attempts.",
                data: null,
                success: false
            })
        }
    }
    catch(error){
        res.send({
            message: error.message,
            data: error,
            success: false
        })
    }
}

const getAllAttemptsByUser = async(req,res) => {
    try{
        const reports = await Report.find({user: req.body.userid}).populate("exam").populate("user").sort({createdAt: -1})
        if(reports){
            res.send({
                message: "All Attempts fetched successfully.",
                data: reports,
                success: true
            })
        }
        else{
            res.send({
                message: "No Attempts to display.",
                data: null,
                success: false
            })
        }
    }
    catch(error){
        res.send({
            message: error.message,
            data: error,
            success: false
        })
    }
}


const getAdminAnalytics = async(req,res) => {
    try {
        const user_admin = await User.findOne({ _id: req.body.userid });
        if(user_admin && user_admin.isAdmin) {
            const examsCount = await Exam.countDocuments();
            const usersCount = await User.countDocuments();
            const reportsCount = await Report.countDocuments();
            res.send({
                message: "Analytics fetched successfully.",
                data: { examsCount, usersCount, reportsCount },
                success: true
            });
        } else {
            res.send({
                message: "Not authorized.",
                data: null,
                success: false
            });
        }
    } catch (error) {
        res.send({
            message: error.message,
            data: error,
            success: false
        });
    }
}

const getUserAnalytics = async(req,res) => {
    try {
        const reports = await Report.find({ user: req.body.userid });
        let totalMarksObtained = 0;
        let passCount = 0;
        reports.forEach(report => {
            if (report.result.verdict === 'Pass') {
                passCount++;
            }
            totalMarksObtained += report.result.correctAnswers.length;
        });
        
        res.send({
            message: "Analytics fetched successfully.",
            data: {
                totalAttempts: reports.length,
                passCount,
                failCount: reports.length - passCount,
                totalMarksObtained,
            },
            success: true
        });
    } catch (error) {
        res.send({
            message: error.message,
            data: error,
            success: false
        });
    }
}

const getAttemptsByExam = async(req,res) => {
    try {
        const { examId } = req.body;
        const reports = await Report.find({ exam: examId }).populate("exam").populate("user").sort({createdAt: -1});
        res.send({
            message: "Attempts fetched successfully.",
            data: reports,
            success: true
        });
    } catch (error) {
        res.send({
            message: error.message,
            success: false
        })
    }
}

module.exports = {addReport,getAllAttempts, getAllAttemptsByUser, getAdminAnalytics, getUserAnalytics, getAttemptsByExam}
