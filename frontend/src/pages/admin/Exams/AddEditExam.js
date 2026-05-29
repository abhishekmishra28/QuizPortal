import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Form, Row, Col, message, Table } from 'antd';
import { useNavigate, useParams, useLocation } from 'react-router-dom';
import { addExam, editExam, getExamById, deleteQuestionFromExam } from '../../../apicalls/exams';
import { useDispatch } from 'react-redux';
import { HideLoading, ShowLoading } from '../../../redux/loaderSlice';
import AddEditQuestion from './AddEditQuestion';

const STEPS = [
  { label: 'Exam Details', icon: 'ri-file-info-line' },
  { label: 'Questions', icon: 'ri-question-line' },
  { label: 'Publish', icon: 'ri-send-plane-line' },
]

function AddEditExam() {
  const navigate = useNavigate()
  const location = useLocation()
  const dispatch = useDispatch()
  const { id } = useParams()
  const [form] = Form.useForm()
  const [examData, setExamData] = useState(null)
  // Read initial step from navigation state (used when redirecting after new exam creation)
  const [activeStep, setActiveStep] = useState(location.state?.initialStep || 0)
  const [showAddEditQuestionModal, setShowAddEditQuestionModal] = useState(false)
  const [selectedQuestion, setSelectedQuestion] = useState(null)
  const [publishTo, setPublishTo] = useState('all')
  // Track current exam ID (handles both edit-mode URL param and newly created exam)
  const [examId, setExamId] = useState(id || null)
  const fetchedRef = useRef(false)

  const getExamDataById = useCallback(async (eid) => {
    if (!eid) return
    try {
      dispatch(ShowLoading())
      const response = await getExamById(eid)
      dispatch(HideLoading())
      if (response.success) {
        const data = response.data
        setExamData(data)
        setPublishTo(data.publishTo || 'all')
        form.setFieldsValue({
          name: data.name,
          duration: data.duration,
          category: data.category,
          totalMarks: data.totalMarks,
          passingMarks: data.passingMarks,
          totalQuestions: data.totalQuestions,
          description: data.description || '',
          publishDate: data.publishDate
            ? new Date(data.publishDate).toISOString().slice(0, 16) : '',
          expiryDate: data.expiryDate
            ? new Date(data.expiryDate).toISOString().slice(0, 16) : '',
          targetEmails: (data.targetEmails || []).join(', ')
        })
      } else {
        message.error(response.message)
      }
    } catch (error) {
      dispatch(HideLoading())
      message.error(error.message)
    }
  }, [dispatch, form])

  useEffect(() => {
    if (examId && !fetchedRef.current) {
      fetchedRef.current = true
      getExamDataById(examId)
    }
  }, [examId, getExamDataById])

  // Save exam details (section 1)
  const handleSaveDetails = async () => {
    try {
      const values = await form.validateFields([
        'name', 'duration', 'category', 'totalMarks', 'passingMarks', 'totalQuestions', 'description'
      ])
      dispatch(ShowLoading())
      let response

      if (examId) {
        // Editing existing exam
        const allValues = form.getFieldsValue(true)
        response = await editExam({ ...allValues, ...values }, examId)
      } else {
        // Creating new exam
        response = await addExam(values)
      }
      dispatch(HideLoading())

      if (response.success) {
        message.success(response.message)

        if (!examId && response.data?._id) {
          // New exam created — update URL without remounting, set examId, go to step 2
          const newId = response.data._id
          setExamId(newId)
          setExamData(response.data)
          fetchedRef.current = true
          // Update browser URL silently so refresh works
          window.history.replaceState(null, '', `/admin/exams/edit/${newId}`)
          setActiveStep(1)
        } else {
          // Edit mode — re-fetch to get fresh questions list & totalQuestions
          await getExamDataById(examId)
          setActiveStep(1)
        }
      } else {
        message.error(response.message)
      }
    } catch (error) {
      if (error.errorFields) {
        message.error('Please fill in all required fields')
      } else {
        message.error(error.message)
      }
      dispatch(HideLoading())
    }
  }

  // Save publish settings (section 3)
  const handleSavePublish = async () => {
    try {
      const allValues = form.getFieldsValue(true)
      const targetEmailsRaw = allValues.targetEmails || ''
      const targetEmailsArr = typeof targetEmailsRaw === 'string'
        ? targetEmailsRaw.split(',').map(e => e.trim()).filter(Boolean)
        : targetEmailsRaw

      const payload = {
        ...allValues,
        publishTo,
        targetEmails: publishTo === 'selected' ? targetEmailsArr : [],
        publishDate: allValues.publishDate || null,
        expiryDate: allValues.expiryDate || null,
      }
      dispatch(ShowLoading())
      const response = await editExam(payload, examId)
      dispatch(HideLoading())
      if (response.success) {
        message.success('Exam published successfully!')
        navigate('/admin/exams')
      } else {
        message.error(response.message)
      }
    } catch (error) {
      dispatch(HideLoading())
      message.error(error.message)
    }
  }

  // Refresh exam data (called after adding/editing/deleting questions)
  const refreshExamData = useCallback(async () => {
    if (examId) {
      await getExamDataById(examId)
    }
  }, [examId, getExamDataById])

  const deleteQuestionById = async (questionId) => {
    try {
      dispatch(ShowLoading())
      const response = await deleteQuestionFromExam(examId, { questionId })
      dispatch(HideLoading())
      if (response.success) {
        message.success(response.message)
        await refreshExamData()
      } else {
        message.error(response.message)
      }
    } catch (error) {
      dispatch(HideLoading())
      message.error(error.message)
    }
  }

  const questionColumns = [
    {
      title: 'Q',
      render: (_, __, idx) => (
        <span style={{
          background: 'rgba(99,102,241,0.2)', color: 'var(--primary-light)',
          borderRadius: '50%', width: 28, height: 28,
          display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
          fontWeight: 700, fontSize: 12
        }}>{idx + 1}</span>
      ),
      width: 50
    },
    {
      title: 'Question',
      dataIndex: 'name',
      ellipsis: true,
      render: (text) => <span style={{ color: 'var(--text-primary)' }}>{text}</span>
    },
    {
      title: 'Type',
      dataIndex: 'questionType',
      render: t => (
        <span className={`badge ${t === 'multi' ? 'badge-warning' : 'badge-primary'}`}>
          {t === 'multi' ? 'Multi-correct' : 'Single'}
        </span>
      ),
      width: 120
    },
    {
      title: 'Options',
      dataIndex: 'options',
      render: (_, record) => (
        <div style={{ fontSize: 12, color: 'var(--text-secondary)' }}>
          {Object.keys(record.options || {}).map(key => (
            <span key={key} style={{ marginRight: 8 }}>
              <b style={{ color: 'var(--primary-light)' }}>{key}.</b> {record.options[key]}
            </span>
          ))}
        </div>
      )
    },
    {
      title: 'Answer',
      render: (_, record) => {
        if (record.questionType === 'multi') {
          return <span style={{ color: 'var(--success)', fontWeight: 600, fontSize: 13 }}>
            {(record.correctOptions || []).join(', ')}
          </span>
        }
        return <span style={{ color: 'var(--success)', fontWeight: 600, fontSize: 13 }}>
          {record.correctOption}. {record.options?.[record.correctOption]}
        </span>
      }
    },
    {
      title: 'Image',
      render: (_, record) => record.image
        ? <img src={record.image} alt="q" style={{ height: 36, width: 52, objectFit: 'cover', borderRadius: 4 }} />
        : <span style={{ color: 'var(--text-muted)', fontSize: 12 }}>—</span>,
      width: 70
    },
    {
      title: 'Actions',
      width: 100,
      render: (_, record) => (
        <div style={{ display: 'flex', gap: 8 }}>
          <button
            className="primary-outlined-btn"
            style={{ padding: '5px 10px', fontSize: 12 }}
            onClick={() => { setSelectedQuestion(record); setShowAddEditQuestionModal(true) }}
          >
            <i className="ri-pencil-line"></i>
          </button>
          <button
            className="danger-btn"
            style={{ padding: '5px 10px', fontSize: 12 }}
            onClick={() => deleteQuestionById(record._id)}
          >
            <i className="ri-delete-bin-line"></i>
          </button>
        </div>
      )
    }
  ]

  const totalQuestionsLimit = Number(examData?.totalQuestions) || 0
  const currentQuestionsCount = examData?.questions?.length || 0
  const progressPct = totalQuestionsLimit > 0
    ? Math.min((currentQuestionsCount / totalQuestionsLimit) * 100, 100)
    : 0

  const WizardSteps = () => (
    <div className="wizard-steps" style={{ marginBottom: 28 }}>
      {STEPS.map((step, idx) => {
        const status = idx < activeStep ? 'done' : idx === activeStep ? 'active' : 'inactive'
        const isClickable = idx < activeStep || (idx === 1 && examId) || (idx === 2 && examId)
        return (
          <React.Fragment key={idx}>
            <div
              className={`wizard-step ${status}`}
              style={{ cursor: isClickable ? 'pointer' : 'default' }}
              onClick={() => { if (isClickable) setActiveStep(idx) }}
            >
              <div className="wizard-step-number">
                {status === 'done'
                  ? <i className="ri-check-line" style={{ fontSize: 16 }}></i>
                  : <span>{idx + 1}</span>}
              </div>
              <div>
                <div className="wizard-step-label">{step.label}</div>
              </div>
            </div>
            {idx < STEPS.length - 1 && (
              <div className={`wizard-connector ${idx < activeStep ? 'done' : ''}`}></div>
            )}
          </React.Fragment>
        )
      })}
    </div>
  )

  return (
    <div>
      {/* Page Header */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 24 }}>
        <button
          className="primary-outlined-btn"
          style={{ padding: '8px 12px' }}
          onClick={() => navigate('/admin/exams')}
        >
          <i className="ri-arrow-left-line"></i>
        </button>
        <div>
          <h1 className="page-title">{examId ? 'Edit Exam' : 'Create New Exam'}</h1>
          <p style={{ color: 'var(--text-muted)', fontSize: 13, marginTop: 2 }}>
            {examId
              ? 'Update your exam details, questions and publish settings'
              : 'Fill in all 3 sections to create and publish your exam'}
          </p>
        </div>
      </div>

      <WizardSteps />

      <Form form={form} layout="vertical">

        {/* ===== SECTION 1: EXAM DETAILS ===== */}
        {activeStep === 0 && (
          <div className="page-section">
            <div className="section-header">
              <div className="section-badge">1</div>
              <div>
                <div className="section-title">Exam Details</div>
                <div className="section-subtitle">Basic information about your exam</div>
              </div>
            </div>

            <Row gutter={[20, 4]}>
              <Col xs={24} sm={12} lg={8}>
                <Form.Item
                  label="Exam Name"
                  name="name"
                  rules={[{ required: true, message: 'Exam name is required' }]}
                >
                  <input type="text" placeholder="e.g. JavaScript Fundamentals" />
                </Form.Item>
              </Col>

              <Col xs={24} sm={12} lg={8}>
                <Form.Item
                  label="Category"
                  name="category"
                  rules={[{ required: true, message: 'Category is required' }]}
                >
                  <input type="text" placeholder="e.g. Programming, Mathematics, Science" />
                </Form.Item>
              </Col>

              <Col xs={24} sm={12} lg={8}>
                <Form.Item
                  label="Duration (minutes)"
                  name="duration"
                  rules={[{ required: true, message: 'Duration is required' }]}
                >
                  <input type="number" min={1} placeholder="e.g. 60" />
                </Form.Item>
              </Col>

              <Col xs={24} sm={12} lg={8}>
                <Form.Item
                  label="Total Questions"
                  name="totalQuestions"
                  rules={[{ required: true, message: 'Total questions is required' }]}
                >
                  <input type="number" min={1} placeholder="e.g. 20" />
                </Form.Item>
              </Col>

              <Col xs={24} sm={12} lg={8}>
                <Form.Item
                  label="Max Marks"
                  name="totalMarks"
                  rules={[{ required: true, message: 'Max marks is required' }]}
                >
                  <input type="number" min={1} placeholder="e.g. 100" />
                </Form.Item>
              </Col>

              <Col xs={24} sm={12} lg={8}>
                <Form.Item
                  label="Passing Marks"
                  name="passingMarks"
                  rules={[{ required: true, message: 'Passing marks is required' }]}
                >
                  <input type="number" min={0} placeholder="e.g. 40" />
                </Form.Item>
              </Col>

              <Col xs={24}>
                <Form.Item label="Exam Description" name="description">
                  <textarea
                    rows={3}
                    placeholder="Briefly describe what this exam covers, who it is for, and any important instructions..."
                    style={{ color: 'var(--text-primary)', background: 'var(--bg-input)' }}
                  />
                </Form.Item>
              </Col>
            </Row>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 12, marginTop: 8 }}>
              <button
                className="primary-outlined-btn"
                type="button"
                onClick={() => navigate('/admin/exams')}
              >
                Cancel
              </button>
              <button
                className="primary-contained-btn"
                type="button"
                onClick={handleSaveDetails}
              >
                Save & Continue
                <i className="ri-arrow-right-line"></i>
              </button>
            </div>
          </div>
        )}

        {/* ===== SECTION 2: QUESTIONS ===== */}
        {activeStep === 1 && (
          <div className="page-section">
            <div className="section-header">
              <div className="section-badge">2</div>
              <div>
                <div className="section-title">Questions</div>
                <div className="section-subtitle">
                  Add up to <strong style={{ color: 'var(--primary-light)' }}>{totalQuestionsLimit}</strong> questions
                </div>
              </div>
            </div>

            {/* Progress */}
            <div style={{
              display: 'flex', alignItems: 'center', justifyContent: 'space-between',
              marginBottom: 20, gap: 16
            }}>
              <div style={{ flex: 1 }}>
                <div style={{
                  display: 'flex', justifyContent: 'space-between',
                  fontSize: 13, color: 'var(--text-secondary)', marginBottom: 6
                }}>
                  <span>Questions added</span>
                  <span style={{
                    fontWeight: 700,
                    color: currentQuestionsCount >= totalQuestionsLimit && totalQuestionsLimit > 0
                      ? 'var(--success)' : 'var(--text-primary)'
                  }}>
                    {currentQuestionsCount} / {totalQuestionsLimit}
                  </span>
                </div>
                <div className="progress-bar-container">
                  <div className="progress-bar-fill" style={{ width: `${progressPct}%` }}></div>
                </div>
              </div>
              <button
                className="primary-contained-btn"
                type="button"
                disabled={totalQuestionsLimit > 0 && currentQuestionsCount >= totalQuestionsLimit}
                style={{
                  opacity: totalQuestionsLimit > 0 && currentQuestionsCount >= totalQuestionsLimit ? 0.5 : 1,
                  cursor: totalQuestionsLimit > 0 && currentQuestionsCount >= totalQuestionsLimit ? 'not-allowed' : 'pointer',
                  flexShrink: 0
                }}
                onClick={() => { setSelectedQuestion(null); setShowAddEditQuestionModal(true) }}
              >
                <i className="ri-add-line"></i>
                Add Question
              </button>
            </div>

            {currentQuestionsCount >= totalQuestionsLimit && totalQuestionsLimit > 0 && (
              <div style={{
                background: 'rgba(16,185,129,0.1)', border: '1px solid rgba(16,185,129,0.3)',
                borderRadius: 'var(--radius-sm)', padding: '10px 14px', marginBottom: 16,
                color: 'var(--success)', fontSize: 13, display: 'flex', alignItems: 'center', gap: 8
              }}>
                <i className="ri-check-double-line"></i>
                All {totalQuestionsLimit} questions have been added!
              </div>
            )}

            <Table
              columns={questionColumns}
              dataSource={examData?.questions || []}
              rowKey="_id"
              pagination={false}
              locale={{
                emptyText: (
                  <div style={{ padding: '40px 0', color: 'var(--text-muted)', textAlign: 'center' }}>
                    <i className="ri-question-line" style={{ fontSize: 36, display: 'block', marginBottom: 8 }}></i>
                    No questions yet. Click "Add Question" to get started.
                  </div>
                )
              }}
            />

            <div style={{ display: 'flex', justifyContent: 'space-between', gap: 12, marginTop: 20 }}>
              <button
                className="primary-outlined-btn"
                type="button"
                onClick={() => setActiveStep(0)}
              >
                <i className="ri-arrow-left-line"></i>
                Back
              </button>
              <button
                className="primary-contained-btn"
                type="button"
                onClick={() => setActiveStep(2)}
              >
                Continue to Publish
                <i className="ri-arrow-right-line"></i>
              </button>
            </div>
          </div>
        )}

        {/* ===== SECTION 3: PUBLISH SETTINGS ===== */}
        {activeStep === 2 && (
          <div className="page-section">
            <div className="section-header">
              <div className="section-badge">3</div>
              <div>
                <div className="section-title">Publish Settings</div>
                <div className="section-subtitle">Control when and who can take this exam</div>
              </div>
            </div>

            <Row gutter={[20, 4]}>
              <Col xs={24} sm={12}>
                <Form.Item label="Publish Date & Time" name="publishDate">
                  <input type="datetime-local" />
                </Form.Item>
                <p style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: -8, marginBottom: 12 }}>
                  Leave empty to publish immediately
                </p>
              </Col>

              <Col xs={24} sm={12}>
                <Form.Item label="Expiry Date & Time" name="expiryDate">
                  <input type="datetime-local" />
                </Form.Item>
                <p style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: -8, marginBottom: 12 }}>
                  Leave empty for no expiry
                </p>
              </Col>
            </Row>

            {/* Publish To */}
            <div style={{ marginBottom: 20 }}>
              <div style={{ fontSize: 13, color: 'var(--text-secondary)', fontWeight: 500, marginBottom: 12 }}>
                Publish To
              </div>
              <div style={{ display: 'flex', gap: 12 }}>
                <div
                  onClick={() => setPublishTo('all')}
                  style={{
                    flex: 1, padding: '16px 20px',
                    border: `2px solid ${publishTo === 'all' ? 'var(--primary)' : 'var(--border)'}`,
                    borderRadius: 'var(--radius-md)', cursor: 'pointer',
                    background: publishTo === 'all' ? 'rgba(99,102,241,0.1)' : 'var(--bg-input)',
                    transition: 'all 0.2s',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <i className="ri-global-line" style={{
                      fontSize: 22, color: publishTo === 'all' ? 'var(--primary-light)' : 'var(--text-muted)'
                    }}></i>
                    <div>
                      <div style={{ fontWeight: 700, color: 'var(--text-primary)', fontSize: 14 }}>All Users</div>
                      <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>Everyone can see and attempt this exam</div>
                    </div>
                    {publishTo === 'all' && (
                      <i className="ri-check-circle-fill" style={{ marginLeft: 'auto', color: 'var(--primary)', fontSize: 20 }}></i>
                    )}
                  </div>
                </div>

                <div
                  onClick={() => setPublishTo('selected')}
                  style={{
                    flex: 1, padding: '16px 20px',
                    border: `2px solid ${publishTo === 'selected' ? 'var(--primary)' : 'var(--border)'}`,
                    borderRadius: 'var(--radius-md)', cursor: 'pointer',
                    background: publishTo === 'selected' ? 'rgba(99,102,241,0.1)' : 'var(--bg-input)',
                    transition: 'all 0.2s',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <i className="ri-team-line" style={{
                      fontSize: 22, color: publishTo === 'selected' ? 'var(--primary-light)' : 'var(--text-muted)'
                    }}></i>
                    <div>
                      <div style={{ fontWeight: 700, color: 'var(--text-primary)', fontSize: 14 }}>Selected Users</div>
                      <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>Only specific email addresses</div>
                    </div>
                    {publishTo === 'selected' && (
                      <i className="ri-check-circle-fill" style={{ marginLeft: 'auto', color: 'var(--primary)', fontSize: 20 }}></i>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {publishTo === 'selected' && (
              <Form.Item
                label="Target Email Addresses (comma separated)"
                name="targetEmails"
              >
                <textarea
                  rows={3}
                  placeholder="student1@example.com, student2@example.com, student3@example.com"
                  style={{ color: 'var(--text-primary)', background: 'var(--bg-input)' }}
                />
              </Form.Item>
            )}

            {/* Summary */}
            <div style={{
              background: 'rgba(99,102,241,0.05)', border: '1px solid rgba(99,102,241,0.15)',
              borderRadius: 'var(--radius-md)', padding: '16px 20px', marginTop: 8,
              display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: 12
            }}>
              {[
                { icon: 'ri-file-text-line', label: 'Exam', value: examData?.name || form.getFieldValue('name') },
                { icon: 'ri-question-line', label: 'Questions', value: `${currentQuestionsCount} / ${totalQuestionsLimit}` },
                { icon: 'ri-time-line', label: 'Duration', value: `${examData?.duration || form.getFieldValue('duration')} min` },
                { icon: 'ri-trophy-line', label: 'Total Marks', value: examData?.totalMarks || form.getFieldValue('totalMarks') },
              ].map((item, i) => (
                <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <i className={item.icon} style={{ color: 'var(--primary-light)', fontSize: 18 }}></i>
                  <div>
                    <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>{item.label}</div>
                    <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-primary)' }}>{item.value}</div>
                  </div>
                </div>
              ))}
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', gap: 12, marginTop: 24 }}>
              <button
                className="primary-outlined-btn"
                type="button"
                onClick={() => setActiveStep(1)}
              >
                <i className="ri-arrow-left-line"></i>
                Back
              </button>
              <div style={{ display: 'flex', gap: 12 }}>
                <button
                  className="primary-outlined-btn"
                  type="button"
                  onClick={() => navigate('/admin/exams')}
                >
                  Save as Draft
                </button>
                <button
                  className="success-btn"
                  type="button"
                  onClick={handleSavePublish}
                >
                  <i className="ri-send-plane-fill"></i>
                  Publish Exam
                </button>
              </div>
            </div>
          </div>
        )}

      </Form>

      {/* Question Modal */}
      {showAddEditQuestionModal && (
        <AddEditQuestion
          showAddEditQuestionModal={showAddEditQuestionModal}
          setShowAddEditQuestionModal={setShowAddEditQuestionModal}
          examId={examId}
          refreshData={refreshExamData}
          selectedQuestion={selectedQuestion}
          setSelectedQuestion={setSelectedQuestion}
        />
      )}
    </div>
  )
}

export default AddEditExam