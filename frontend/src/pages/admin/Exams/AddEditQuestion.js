import React, { useState, useRef } from 'react'
import { Modal, Form, message } from 'antd'
import { HideLoading, ShowLoading } from '../../../redux/loaderSlice'
import { useDispatch } from 'react-redux'
import { addQuestionToExam, editQuestionInExam } from '../../../apicalls/exams'

function AddEditQuestion(props) {
  const { showAddEditQuestionModal, setShowAddEditQuestionModal, examId, refreshData, selectedQuestion, setSelectedQuestion } = props
  const dispatch = useDispatch()
  const [form] = Form.useForm()
  const [questionType, setQuestionType] = useState(selectedQuestion?.questionType || 'single')
  const [imagePreview, setImagePreview] = useState(selectedQuestion?.image || '')
  const fileInputRef = useRef(null)

  const handleImageChange = (e) => {
    const file = e.target.files[0]
    if (!file) return
    if (file.size > 2 * 1024 * 1024) {
      message.error('Image must be smaller than 2MB')
      return
    }
    const reader = new FileReader()
    reader.onload = (ev) => setImagePreview(ev.target.result)
    reader.readAsDataURL(file)
  }

  const onFinish = async (values) => {
    try {
      dispatch(ShowLoading())

      const correctOptionsArr = questionType === 'multi'
        ? (values.correctOptions || '').split(',').map(s => s.trim()).filter(Boolean)
        : []

      const payload = {
        name: values.name,
        questionType,
        image: imagePreview || '',
        options: {
          A: values.A,
          B: values.B,
          C: values.C,
          D: values.D,
        },
        correctOption: questionType === 'single' ? (values.correctOption || '') : '',
        correctOptions: questionType === 'multi' ? correctOptionsArr : [],
        exam: examId,
      }

      let response
      if (selectedQuestion) {
        response = await editQuestionInExam({ ...payload, questionId: selectedQuestion._id }, examId)
      } else {
        response = await addQuestionToExam(payload, examId)
      }

      dispatch(HideLoading())
      if (response.success) {
        message.success(response.message)
        refreshData()
        setShowAddEditQuestionModal(false)
        setSelectedQuestion(null)
      } else {
        message.error(response.message)
      }
    } catch (error) {
      dispatch(HideLoading())
      message.error(error.message)
    }
  }

  const initialValues = selectedQuestion ? {
    name: selectedQuestion.name,
    questionType: selectedQuestion.questionType || 'single',
    correctOption: selectedQuestion.correctOption || '',
    correctOptions: (selectedQuestion.correctOptions || []).join(', '),
    A: selectedQuestion.options?.A,
    B: selectedQuestion.options?.B,
    C: selectedQuestion.options?.C,
    D: selectedQuestion.options?.D,
  } : {}

  return (
    <Modal
      title={selectedQuestion ? 'Edit Question' : 'Add Question'}
      open={showAddEditQuestionModal}
      footer={null}
      onCancel={() => {
        setShowAddEditQuestionModal(false)
        setSelectedQuestion(null)
      }}
      width={600}
    >
      <Form form={form} onFinish={onFinish} layout="vertical" initialValues={initialValues}>

        {/* Question Type Toggle */}
        <div style={{ marginBottom: 16 }}>
          <div style={{ fontSize: 13, color: 'var(--text-secondary)', fontWeight: 500, marginBottom: 8 }}>
            Question Type
          </div>
          <div style={{ display: 'flex', gap: 8 }}>
            {[
              { value: 'single', label: 'Single Correct', icon: 'ri-radio-button-line' },
              { value: 'multi', label: 'Multi-Correct', icon: 'ri-checkbox-multiple-line' },
            ].map(opt => (
              <div
                key={opt.value}
                onClick={() => setQuestionType(opt.value)}
                style={{
                  flex: 1, padding: '10px 14px', border: `2px solid ${questionType === opt.value ? 'var(--primary)' : 'var(--border)'}`,
                  borderRadius: 'var(--radius-sm)', cursor: 'pointer',
                  background: questionType === opt.value ? 'rgba(99,102,241,0.1)' : 'var(--bg-input)',
                  display: 'flex', alignItems: 'center', gap: 8, transition: 'all 0.2s'
                }}
              >
                <i className={opt.icon} style={{ color: questionType === opt.value ? 'var(--primary-light)' : 'var(--text-muted)', fontSize: 16 }}></i>
                <span style={{ fontSize: 13, fontWeight: 600, color: questionType === opt.value ? 'var(--primary-light)' : 'var(--text-secondary)' }}>
                  {opt.label}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Question Text */}
        <Form.Item
          name="name"
          label="Question"
          rules={[{ required: true, message: 'Question text is required' }]}
        >
          <textarea rows={2} placeholder="Enter the question..." />
        </Form.Item>

        {/* Image Upload */}
        <div style={{ marginBottom: 16 }}>
          <div style={{ fontSize: 13, color: 'var(--text-secondary)', fontWeight: 500, marginBottom: 8 }}>
            Question Image <span style={{ color: 'var(--text-muted)', fontWeight: 400 }}>(optional)</span>
          </div>
          <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
            <button
              type="button"
              className="primary-outlined-btn"
              style={{ padding: '8px 14px', fontSize: 13 }}
              onClick={() => fileInputRef.current?.click()}
            >
              <i className="ri-image-add-line"></i>
              {imagePreview ? 'Change Image' : 'Upload Image'}
            </button>
            {imagePreview && (
              <button
                type="button"
                className="danger-btn"
                style={{ padding: '8px 12px', fontSize: 12 }}
                onClick={() => { setImagePreview(''); if (fileInputRef.current) fileInputRef.current.value = '' }}
              >
                <i className="ri-delete-bin-line"></i>
              </button>
            )}
          </div>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            style={{ display: 'none' }}
            onChange={handleImageChange}
          />
          {imagePreview && (
            <img src={imagePreview} alt="question" className="image-preview" />
          )}
        </div>

        {/* Options */}
        <div style={{ marginBottom: 8 }}>
          <div style={{ fontSize: 13, color: 'var(--text-secondary)', fontWeight: 500, marginBottom: 8 }}>
            Answer Options
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            {['A', 'B', 'C', 'D'].map(opt => (
              <Form.Item
                key={opt}
                name={opt}
                label={<span style={{ color: 'var(--primary-light)', fontWeight: 700 }}>Option {opt}</span>}
                rules={[{ required: true, message: `Option ${opt} is required` }]}
                style={{ marginBottom: 0 }}
              >
                <input type="text" placeholder={`Enter option ${opt}`} />
              </Form.Item>
            ))}
          </div>
        </div>

        {/* Correct Answer */}
        {questionType === 'single' ? (
          <Form.Item
            name="correctOption"
            label="Correct Option"
            rules={[{ required: true, message: 'Please specify the correct option (A, B, C, or D)' }]}
            style={{ marginTop: 12 }}
          >
            <select>
              <option value="">Select correct option</option>
              {['A', 'B', 'C', 'D'].map(o => <option key={o} value={o}>Option {o}</option>)}
            </select>
          </Form.Item>
        ) : (
          <Form.Item
            name="correctOptions"
            label="Correct Options (comma separated, e.g. A, C)"
            rules={[{ required: true, message: 'Please specify correct options' }]}
            style={{ marginTop: 12 }}
          >
            <input type="text" placeholder="A, C" />
          </Form.Item>
        )}

        {/* Actions */}
        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10, marginTop: 20 }}>
          <button
            className="primary-outlined-btn"
            type="button"
            onClick={() => {
              setShowAddEditQuestionModal(false)
              setSelectedQuestion(null)
            }}
          >
            Cancel
          </button>
          <button className="primary-contained-btn" type="submit">
            <i className="ri-save-line"></i>
            {selectedQuestion ? 'Update Question' : 'Add Question'}
          </button>
        </div>
      </Form>
    </Modal>
  )
}

export default AddEditQuestion