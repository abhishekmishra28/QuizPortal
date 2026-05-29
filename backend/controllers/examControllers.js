const Exam = require("../models/examModel")
const User = require("../models/userModel")
const Question = require('../models/questionModel')

const addExam = async(req, res) => {
   try {
      const user = await User.findOne({ _id: req.body.userid })
      if (!user || !user.isAdmin) {
         return res.send({ message: "Unauthorized. Only admins can add exams.", success: false })
      }
      const examExists = await Exam.findOne({ name: req.body.name })
      if (examExists) {
         return res.send({ message: "Exam already exists", success: false })
      }
      req.body.questions = []
      const newExam = new Exam(req.body)
      await newExam.save()
      res.send({ message: "Exam added successfully", success: true, data: newExam })
   }
   catch (error) {
      res.send({ message: error.message, data: error, success: false })
   }
}

const getAllExams = async(req, res) => {
   try {
      const user = await User.findOne({ _id: req.body.userid })
      let exams;
      if (user && user.isAdmin) {
         // Admins see all exams
         exams = await Exam.find()
      } else {
         // Regular users see "all" published exams OR exams targeting their email
         const now = new Date()
         exams = await Exam.find({
            $or: [
               { publishTo: "all" },
               { publishTo: "selected", targetEmails: user ? user.email : "" }
            ],
            $and: [
               { $or: [{ publishDate: null }, { publishDate: { $lte: now } }] },
               { $or: [{ expiryDate: null }, { expiryDate: { $gte: now } }] }
            ]
         })
      }
      res.send({ message: "Exams list fetched successfully.", data: exams, success: true })
   }
   catch (error) {
      res.send({ message: error.message, data: error, success: false })
   }
}

const searchExams = async(req, res) => {
   try {
      const q = req.query.q || ""
      const user = await User.findOne({ _id: req.body.userid })
      let filter = { name: { $regex: q, $options: "i" } }
      if (!user || !user.isAdmin) {
         const now = new Date()
         filter = {
            name: { $regex: q, $options: "i" },
            $or: [
               { publishTo: "all" },
               { publishTo: "selected", targetEmails: user ? user.email : "" }
            ],
            $and: [
               { $or: [{ publishDate: null }, { publishDate: { $lte: now } }] },
               { $or: [{ expiryDate: null }, { expiryDate: { $gte: now } }] }
            ]
         }
      }
      const exams = await Exam.find(filter)
      res.send({ message: "Search results fetched.", data: exams, success: true })
   }
   catch (error) {
      res.send({ message: error.message, data: error, success: false })
   }
}

const getExamById = async(req, res) => {
   try {
      const exam = await Exam.findById(req.params.id).populate('questions');
      if (exam) {
         res.send({ message: "Exam data fetched successfully.", data: exam, success: true })
      } else {
         res.send({ message: "Exam does not exist.", data: exam, success: false })
      }
   }
   catch (error) {
      res.send({ message: error.message, data: error, success: false })
   }
}

const editExam = async(req, res) => {
   try {
      const user = await User.findOne({ _id: req.body.userid })
      if (!user || !user.isAdmin) {
         return res.send({ message: "Unauthorized.", data: null, success: false })
      }
      const exam = await Exam.findOne({ _id: req.params.id })
      if (!exam) {
         return res.send({ message: "Exam doesn't exist.", data: null, success: false })
      }
      exam.name = req.body.name
      exam.duration = req.body.duration
      exam.category = req.body.category
      exam.totalMarks = req.body.totalMarks
      exam.passingMarks = req.body.passingMarks
      exam.totalQuestions = req.body.totalQuestions
      exam.description = req.body.description || ""
      exam.publishDate = req.body.publishDate || null
      exam.expiryDate = req.body.expiryDate || null
      exam.publishTo = req.body.publishTo || "all"
      exam.targetEmails = req.body.targetEmails || []
      await exam.save()
      res.send({ message: "Exam details updated successfully.", data: exam, success: true })
   }
   catch (error) {
      res.send({ message: error.message, data: error, success: false })
   }
}

const deleteExam = async(req, res) => {
   try {
      const user = await User.findOne({ _id: req.body.userid })
      if (!user || !user.isAdmin) {
         return res.send({ message: "Unauthorized.", data: null, success: false })
      }
      // findOneAndDelete triggers the post('findOneAndDelete') hook to remove questions
      const exam = await Exam.findOneAndDelete({ _id: req.params.id })
      if (!exam) {
         return res.send({ message: "Exam doesn't exist.", data: null, success: false })
      }
      // Also manually delete questions in case hook didn't fire
      await Question.deleteMany({ exam: req.params.id })
      res.send({ message: "Exam deleted successfully.", data: null, success: true })
   }
   catch (error) {
      res.send({ message: error.message, data: error, success: false })
   }
}

const addQuestionToExam = async(req, res) => {
   try {
      const user = await User.findById(req.body.userid)
      if (!user || !user.isAdmin) {
         return res.send({ message: "Unauthorized.", data: null, success: false })
      }
      const exam = await Exam.findOne({ _id: req.params.id })
      if (!exam) {
         return res.send({ message: "Exam not found.", data: null, success: false })
      }
      // Enforce question limit
      if (exam.questions.length >= exam.totalQuestions) {
         return res.send({ message: `Cannot add more than ${exam.totalQuestions} questions.`, success: false })
      }
      const newQuestion = new Question(req.body)
      const question = await newQuestion.save()
      exam.questions.push(question._id)
      await exam.save()
      res.send({ message: "Question added successfully.", data: question, success: true })
   }
   catch (error) {
      console.log(error.message)
      res.send({ message: error.message, data: error, success: false })
   }
}

const editQuestionInExam = async(req, res) => {
   try {
      const user = await User.findById(req.body.userid)
      if (!user || !user.isAdmin) {
         return res.send({ message: "Unauthorized.", success: false })
      }
      await Question.findByIdAndUpdate(req.body.questionId, req.body)
      res.send({ message: "Question updated successfully", success: true })
   }
   catch (error) {
      res.send({ message: error.message, data: error, success: false })
   }
}

const deleteQuestionFromExam = async(req, res) => {
   try {
      const user = await User.findById(req.body.userid)
      if (!user || !user.isAdmin) {
         return res.send({ message: "Unauthorized.", success: false })
      }
      await Question.findByIdAndDelete(req.body.questionId)
      await Exam.findByIdAndUpdate(req.params.id, {
         $pull: { questions: req.body.questionId }
      })
      res.send({ message: "Question deleted successfully", success: true })
   }
   catch (error) {
      res.send({ message: error.message, data: error, success: false })
   }
}

module.exports = {
   addExam, getAllExams, getExamById, editExam, deleteExam,
   addQuestionToExam, editQuestionInExam, deleteQuestionFromExam, searchExams
}
