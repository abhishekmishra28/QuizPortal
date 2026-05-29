import React, { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Table, message } from 'antd'
import { useDispatch } from 'react-redux'
import { HideLoading, ShowLoading } from '../../../redux/loaderSlice'
import { getAllExams, deleteExam } from '../../../apicalls/exams'

function ExamsPage() {
  const navigate = useNavigate()
  const dispatch = useDispatch()
  const [exams, setExams] = useState([])

  const columns = [
    {
      title: '#',
      render: (_, __, i) => (
        <span style={{ color: 'var(--text-muted)', fontSize: 12 }}>{i + 1}</span>
      ),
      width: 48
    },
    {
      title: 'Exam Name',
      dataIndex: 'name',
      render: (text) => (
        <span style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{text}</span>
      )
    },
    {
      title: 'Category',
      dataIndex: 'category',
      render: (text) => <span className="badge badge-primary">{text}</span>
    },
    {
      title: 'Duration',
      dataIndex: 'duration',
      render: (v) => <span style={{ color: 'var(--text-secondary)' }}>{v} min</span>
    },
    {
      title: 'Questions',
      render: (_, r) => (
        <span>
          <span style={{ color: 'var(--text-primary)', fontWeight: 600 }}>{r.questions?.length || 0}</span>
          <span style={{ color: 'var(--text-muted)' }}> / {r.totalQuestions}</span>
        </span>
      )
    },
    {
      title: 'Marks',
      render: (_, r) => (
        <span style={{ color: 'var(--text-secondary)' }}>{r.totalMarks} <span style={{ color: 'var(--text-muted)' }}>(Pass: {r.passingMarks})</span></span>
      )
    },
    {
      title: 'Publish',
      dataIndex: 'publishTo',
      render: (v) => (
        <span className={`badge ${v === 'selected' ? 'badge-warning' : 'badge-success'}`}>
          {v === 'selected' ? 'Selected' : 'All Users'}
        </span>
      )
    },
    {
      title: 'Actions',
      width: 120,
      render: (_, record) => (
        <div style={{ display: 'flex', gap: 8 }}>
          <button
            className="primary-contained-btn"
            style={{ padding: '6px 12px', fontSize: 12, marginRight: 8 }}
            onClick={() => navigate(`/admin/exams/results/${record._id}`)}
            title="Results"
          >
            <i className="ri-file-chart-line"></i>
          </button>
          <button
            className="primary-outlined-btn"
            style={{ padding: '6px 12px', fontSize: 12 }}
            onClick={() => navigate(`/admin/exams/edit/${record._id}`)}
            title="Edit"
          >
            <i className="ri-pencil-line"></i>
          </button>
          <button
            className="danger-btn"
            style={{ padding: '6px 12px', fontSize: 12 }}
            onClick={() => deleteExamById(record._id)}
            title="Delete"
          >
            <i className="ri-delete-bin-line"></i>
          </button>
        </div>
      )
    }
  ]

  const getExamsData = async () => {
    try {
      dispatch(ShowLoading())
      const response = await getAllExams()
      dispatch(HideLoading())
      if (response.success) {
        setExams(response.data)
      } else {
        message.error(response.message)
      }
    } catch (error) {
      dispatch(HideLoading())
      message.error(error.message)
    }
  }

  const deleteExamById = async (id) => {
    try {
      dispatch(ShowLoading())
      const response = await deleteExam(id)
      dispatch(HideLoading())
      if (response.success) {
        message.success(response.message)
        getExamsData()
      } else {
        message.error(response.message)
      }
    } catch (error) {
      dispatch(HideLoading())
      message.error(error.message)
    }
  }

  useEffect(() => {
    getExamsData()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return (
    <div>
      {/* Header Row */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24 }}>
        <div>
          <h1 className="page-title">Exams</h1>
          <p style={{ color: 'var(--text-muted)', fontSize: 13, marginTop: 4 }}>
            {exams.length} exam{exams.length !== 1 ? 's' : ''} created
          </p>
        </div>
        <button
          className="primary-contained-btn"
          onClick={() => navigate('/admin/exams/add')}
        >
          <i className="ri-add-line"></i>
          New Exam
        </button>
      </div>

      <div className="divider"></div>

      <div style={{ marginTop: 20 }}>
        <Table
          columns={columns}
          dataSource={exams}
          rowKey="_id"
          pagination={{ pageSize: 10 }}
          locale={{
            emptyText: (
              <div style={{ padding: '48px 0', color: 'var(--text-muted)', textAlign: 'center' }}>
                <i className="ri-file-list-3-line" style={{ fontSize: 40, display: 'block', marginBottom: 10 }}></i>
                <p>No exams yet. Click "New Exam" to create one.</p>
              </div>
            )
          }}
        />
      </div>
    </div>
  )
}

export default ExamsPage