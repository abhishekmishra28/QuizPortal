import React, { useState, useEffect } from 'react'
import { useDispatch } from 'react-redux'
import { useLocation, useNavigate } from 'react-router-dom'
import { getExamById } from '../../../apicalls/exams'
import { HideLoading, ShowLoading } from '../../../redux/loaderSlice'
import { message } from 'antd'

function ReviewExam() {
  const [examData, setExamData] = useState(null)
  const [questions, setQuestions] = useState([])
  const location = useLocation()
  const navigate = useNavigate()
  const dispatch = useDispatch()
  
  // The report object should be passed via location.state
  const report = location.state?.report
  const selectedOptions = report?.result?.selectedOptions || {}

  const getExamData = async (id) => {
    try {
      dispatch(ShowLoading())
      const response = await getExamById(id)
      dispatch(HideLoading())
      if (response.success) {
        setExamData(response.data)
        setQuestions(response.data.questions)
      } else {
        message.error(response.message)
      }
    } catch (error) {
      dispatch(HideLoading())
      message.error(error.message)
    }
  }

  useEffect(() => {
    if (!report) {
      message.error("Report data not found. Please navigate from the Reports page.")
      navigate('/user/reports')
    } else {
      getExamData(report.exam._id)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  if (!report || !examData) {
    return null
  }

  return (
    <div style={{ maxWidth: 900, margin: '0 auto' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
        <h1 className="page-title">Review: {examData.name}</h1>
        <button className="primary-outlined-btn" onClick={() => navigate('/user/reports')}>
          <i className="ri-arrow-left-line"></i> Back to Reports
        </button>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
        {questions.map((question, index) => {
          const isMulti = question.questionType === 'multi'
          const selected = selectedOptions[index]

          let isCorrect = false
          let userAnsStr = ''
          let correctAnsStr = ''

          if (isMulti) {
            const userArr = Array.isArray(selected) ? [...selected].sort() : []
            const correctArr = [...(question.correctOptions || [])].sort()
            isCorrect = JSON.stringify(userArr) === JSON.stringify(correctArr)
            userAnsStr = userArr.length > 0 ? userArr.join(', ') : 'N/A (No answer or missing data)'
            correctAnsStr = correctArr.join(', ')
          } else {
            isCorrect = question.correctOption === selected
            userAnsStr = selected || 'N/A (No answer or missing data)'
            correctAnsStr = question.correctOption || ''
          }

          return (
            <div key={index} className="card" style={{ padding: 24, borderLeft: `4px solid ${isCorrect ? 'var(--success)' : 'var(--danger)'}` }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 12 }}>
                <h2 style={{ fontSize: 16, color: 'var(--text-primary)', flex: 1 }}>
                  <span style={{ color: 'var(--primary-light)', marginRight: 8 }}>Q{index + 1}.</span>
                  {question.name}
                </h2>
                {isMulti && <span className="badge badge-warning" style={{ alignSelf: 'flex-start' }}>Multi</span>}
              </div>

              {question.image && (
                <img src={question.image} alt="Q" style={{ maxHeight: 150, borderRadius: 4, marginBottom: 16 }} />
              )}

              <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 16 }}>
                {Object.keys(question.options).map((optionKey) => {
                  let isOptionSelected = false;
                  if (isMulti) {
                    isOptionSelected = Array.isArray(selected) && selected.includes(optionKey)
                  } else {
                    isOptionSelected = selected === optionKey
                  }
                  
                  return (
                    <div key={optionKey} style={{
                        padding: '8px 12px',
                        borderRadius: '4px',
                        background: isOptionSelected ? 'rgba(99, 102, 241, 0.1)' : 'transparent',
                        border: isOptionSelected ? '1px solid var(--primary-light)' : '1px solid transparent',
                        fontSize: 14,
                        color: 'var(--text-secondary)'
                    }}>
                        <strong style={{ marginRight: 6 }}>{optionKey}.</strong>
                        {question.options[optionKey]}
                    </div>
                  )
                })}
              </div>

              <div style={{
                background: 'var(--bg-input)', padding: 16, borderRadius: 'var(--radius-sm)',
                display: 'flex', flexDirection: 'column', gap: 8
              }}>
                <div style={{ fontSize: 14 }}>
                  <span style={{ color: 'var(--text-muted)', display: 'inline-block', width: 120 }}>Your Answer:</span>
                  <strong style={{ color: isCorrect ? 'var(--success)' : 'var(--danger)' }}>
                    {userAnsStr}
                  </strong>
                </div>
                <div style={{ fontSize: 14 }}>
                  <span style={{ color: 'var(--text-muted)', display: 'inline-block', width: 120 }}>Correct Answer:</span>
                  <strong style={{ color: 'var(--success)' }}>
                    {correctAnsStr}
                  </strong>
                </div>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}

export default ReviewExam
