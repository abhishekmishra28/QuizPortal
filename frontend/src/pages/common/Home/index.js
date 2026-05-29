import { message } from 'antd'
import React, { useState, useEffect, useCallback } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import { useNavigate } from 'react-router-dom'
import { getAllExams, searchExams } from '../../../apicalls/exams'
import { HideLoading, ShowLoading } from '../../../redux/loaderSlice'
import { getAllAttemptsByUser } from '../../../apicalls/reports'

function HomePage() {
  const [exams, setExams] = useState([])
  const [filteredExams, setFilteredExams] = useState([])
  const [searchQuery, setSearchQuery] = useState('')
  const [viewMode, setViewMode] = useState('grid') // 'grid' | 'list'
  const [attemptedExamIds, setAttemptedExamIds] = useState(new Set())
  const dispatch = useDispatch()
  const navigate = useNavigate()
  const user = useSelector(state => state.users.user)

  const getExams = useCallback(async () => {
    try {
      dispatch(ShowLoading())
      const [examsRes, attemptsRes] = await Promise.all([getAllExams(), getAllAttemptsByUser()])
      dispatch(HideLoading())
      if (examsRes.success) {
        setExams(examsRes.data)
        setFilteredExams(examsRes.data)
      } else {
        message.error(examsRes.message)
      }
      if (attemptsRes.success) {
        const ids = new Set(attemptsRes.data.filter(r => r.exam).map(r => r.exam._id))
        setAttemptedExamIds(ids)
      }
    }
    catch (error) {
      dispatch(HideLoading())
      message.error(error.message)
    }
  }, [dispatch])

  useEffect(() => {
    getExams()
  }, [getExams])

  // Debounced search
  useEffect(() => {
    const timeout = setTimeout(async () => {
      if (searchQuery.trim() === '') {
        setFilteredExams(exams)
      } else {
        try {
          const response = await searchExams(searchQuery)
          if (response.success) {
            setFilteredExams(response.data)
          }
        } catch {
          // fallback: client-side filter
          setFilteredExams(exams.filter(e =>
            e.name.toLowerCase().includes(searchQuery.toLowerCase())
          ))
        }
      }
    }, 350)
    return () => clearTimeout(timeout)
  }, [searchQuery, exams])

  // Check if exam is expired
  const isExamExpired = (expiryDate) => {
    if (!expiryDate) return false;
    return new Date(expiryDate) < new Date();
  };

  const ExamCardGrid = ({ exam }) => {
    const expired = isExamExpired(exam.expiryDate);
    const attempted = attemptedExamIds.has(exam._id);
    const isDisabled = expired || attempted;
    return (
    <div className="exam-card-grid">
      <div className="exam-card-header">
        <div className="exam-card-category">{exam.category}</div>
        <div className="exam-card-name">{exam.name}</div>
      </div>
      <div className="exam-card-body">
        {exam.description && (
          <div className="exam-card-description">{exam.description}</div>
        )}
        <div className="exam-meta-grid">
          <div className="exam-meta-item">
            <i className="ri-question-line"></i>
            <span>{exam.questions?.length || 0} Questions</span>
          </div>
          <div className="exam-meta-item">
            <i className="ri-time-line"></i>
            <span>{exam.duration} min</span>
          </div>
          <div className="exam-meta-item">
            <i className="ri-trophy-line"></i>
            <span>{exam.totalMarks} Marks</span>
          </div>
          <div className="exam-meta-item">
            <i className="ri-medal-line"></i>
            <span>Pass: {exam.passingMarks}</span>
          </div>
        </div>
      </div>
      <div className="exam-card-footer">
        <button
          className={isDisabled ? "primary-outlined-btn" : "primary-contained-btn"}
          style={{ width: '100%', justifyContent: 'center', opacity: isDisabled ? 0.6 : 1, cursor: isDisabled ? 'not-allowed' : 'pointer' }}
          onClick={() => !isDisabled && navigate(`/user/write-exam/${exam._id}`)}
          disabled={isDisabled}
        >
          {attempted ? (
            <><i className="ri-checkbox-circle-line"></i> Attempted</>
          ) : expired ? (
            <><i className="ri-close-circle-line"></i> Expired</>
          ) : (
            <><i className="ri-play-circle-line"></i> Start Exam</>
          )}
        </button>
      </div>
    </div>
  )
  };

  const ExamListItem = ({ exam }) => {
    const expired = isExamExpired(exam.expiryDate);
    const attempted = attemptedExamIds.has(exam._id);
    const isDisabled = expired || attempted;
    return (
    <div className="exam-list-item">
      <div className="exam-list-info">
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 4 }}>
          <div className="exam-list-name">{exam.name}</div>
          <span className="badge badge-primary">{exam.category}</span>
          {attempted && <span className="badge badge-success">Attempted</span>}
        </div>
        {exam.description && (
          <div style={{ fontSize: 13, color: 'var(--text-muted)', marginBottom: 8 }}>
            {exam.description.substring(0, 80)}{exam.description.length > 80 ? '...' : ''}
          </div>
        )}
        <div className="exam-list-meta">
          <div className="exam-list-meta-item">
            <i className="ri-question-line" style={{ color: 'var(--primary-light)' }}></i>
            <span>{exam.questions?.length || 0} Questions</span>
          </div>
          <div className="exam-list-meta-item">
            <i className="ri-time-line" style={{ color: 'var(--primary-light)' }}></i>
            <span>{exam.duration} min</span>
          </div>
          <div className="exam-list-meta-item">
            <i className="ri-trophy-line" style={{ color: 'var(--primary-light)' }}></i>
            <span>{exam.totalMarks} Marks</span>
          </div>
          <div className="exam-list-meta-item">
            <i className="ri-medal-line" style={{ color: 'var(--primary-light)' }}></i>
            <span>Pass: {exam.passingMarks}</span>
          </div>
        </div>
      </div>
      <div style={{ flexShrink: 0 }}>
        <button
          className={isDisabled ? "primary-outlined-btn" : "primary-contained-btn"}
          style={{ opacity: isDisabled ? 0.6 : 1, cursor: isDisabled ? 'not-allowed' : 'pointer' }}
          onClick={() => !isDisabled && navigate(`/user/write-exam/${exam._id}`)}
          disabled={isDisabled}
        >
          {attempted ? (
            <><i className="ri-checkbox-circle-line"></i> Attempted</>
          ) : expired ? (
            <><i className="ri-close-circle-line"></i> Expired</>
          ) : (
            <><i className="ri-play-circle-line"></i> Start Exam</>
          )}
        </button>
      </div>
    </div>
  )
  };

  return (
    user && (
      <div>
        {/* Page Header */}
        <div style={{ marginBottom: 24 }}>
          <h1 className="page-title">Welcome back, {user.name} 👋</h1>
          <p style={{ color: 'var(--text-muted)', fontSize: 14, marginTop: 4 }}>
            {filteredExams.length} exam{filteredExams.length !== 1 ? 's' : ''} available for you
          </p>
        </div>

        {/* Search + View Toggle Row */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: 12,
          marginBottom: 24,
          flexWrap: 'wrap'
        }}>
          <div className="search-bar-container" style={{ flex: 1 }}>
            <i className="ri-search-line"></i>
            <input
              type="text"
              className="search-bar"
              placeholder="Search exams by name..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
            />
          </div>
          <div className="view-toggle">
            <button
              className={`view-toggle-btn ${viewMode === 'grid' ? 'active' : ''}`}
              onClick={() => setViewMode('grid')}
              title="Grid View"
            >
              <i className="ri-layout-grid-2-line"></i>
            </button>
            <button
              className={`view-toggle-btn ${viewMode === 'list' ? 'active' : ''}`}
              onClick={() => setViewMode('list')}
              title="List View"
            >
              <i className="ri-list-check-2"></i>
            </button>
          </div>
        </div>

        {/* Exam List */}
        {filteredExams.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '60px 0', color: 'var(--text-muted)' }}>
            <i className="ri-inbox-line" style={{ fontSize: 48, display: 'block', marginBottom: 12 }}></i>
            <p style={{ fontSize: 16 }}>No exams found{searchQuery ? ` for "${searchQuery}"` : ''}</p>
          </div>
        ) : viewMode === 'grid' ? (
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
            gap: 20
          }}>
            {filteredExams.map((exam, i) => <ExamCardGrid key={i} exam={exam} />)}
          </div>
        ) : (
          <div>
            {filteredExams.map((exam, i) => <ExamListItem key={i} exam={exam} />)}
          </div>
        )}
      </div>
    )
  )
}

export default HomePage