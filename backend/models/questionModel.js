const mongoose = require('mongoose')

const questionSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    correctOption: {
        type: String,
        default: ""
    },
    correctOptions: {
        type: [String],
        default: []
    },
    options: {
        type: Object,
        required: true
    },
    questionType: {
        type: String,
        enum: ["single", "multi"],
        default: "single"
    },
    image: {
        type: String,
        default: ""
    },
    exam: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "exams",
        required: true
    },
},{
    timestamps: true
})

const questionModel = mongoose.model("questions", questionSchema)
module.exports = questionModel;