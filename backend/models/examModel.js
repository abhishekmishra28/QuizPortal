const mongoose = require('mongoose')
const Question = require("./questionModel")

const examSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    duration: {
        type: Number,
        required: true
    },
    category: {
        type: String,
        required: true
    },
    totalMarks: {
        type: Number,
        required: true
    },
    passingMarks: {
        type: Number,
        required: true
    },
    totalQuestions: {
        type: Number,
        required: true,
        default: 10
    },
    description: {
        type: String,
        default: ""
    },
    publishDate: {
        type: Date,
        default: null
    },
    expiryDate: {
        type: Date,
        default: null
    },
    publishTo: {
        type: String,
        enum: ["all", "selected"],
        default: "all"
    },
    targetEmails: {
        type: [String],
        default: []
    },
    questions: {
        type: [mongoose.Schema.Types.ObjectId],
        required: true,
        ref: "questions"
    },
},{
    timestamps: true
})

// remove all the questions associated with an exam if that exam is deleted
examSchema.post('findOneAndDelete', async function(doc) {
    if (doc) {
        await Question.deleteMany({ exam: doc._id });
    }
})

const examModel = mongoose.model("exams", examSchema)

module.exports = examModel