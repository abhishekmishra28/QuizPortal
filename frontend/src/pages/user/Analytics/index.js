import React, { useState, useEffect } from 'react'
import PageTitle from '../../../components/PageTitle'
import { message } from 'antd'
import { useDispatch } from 'react-redux'
import { ShowLoading, HideLoading } from '../../../redux/loaderSlice'
import { getUserAnalytics } from '../../../apicalls/reports'

function UserAnalytics() {
  const [data, setData] = useState({
    totalAttempts: 0,
    passCount: 0,
    failCount: 0,
    totalMarksObtained: 0,
  })
  const dispatch = useDispatch()

  const getData = async () => {
    try {
      dispatch(ShowLoading())
      const response = await getUserAnalytics()
      dispatch(HideLoading())
      if (response.success) {
        setData(response.data)
      } else {
        message.error(response.message)
      }
    } catch (error) {
      dispatch(HideLoading())
      message.error(error.message)
    }
  }

  useEffect(() => {
    getData()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return (
    <div>
      <PageTitle title="My Analytics" />
      <div className="divider"></div>
      
      <div style={{ display: 'flex', gap: '20px', flexWrap: 'wrap', marginTop: '20px' }}>
        <div className="card" style={{ flex: 1, minWidth: '250px', padding: '30px', textAlign: 'center', background: 'linear-gradient(135deg, var(--primary), var(--primary-dark))', color: 'white' }}>
            <i className="ri-bar-chart-2-line" style={{ fontSize: '40px' }}></i>
            <h2 style={{ fontSize: '32px', margin: '10px 0', color: 'white' }}>{data.totalAttempts}</h2>
            <div style={{ fontSize: '16px' }}>Total Attempts</div>
        </div>

        <div className="card" style={{ flex: 1, minWidth: '250px', padding: '30px', textAlign: 'center', background: 'linear-gradient(135deg, var(--success), #059669)', color: 'white' }}>
            <i className="ri-check-double-line" style={{ fontSize: '40px' }}></i>
            <h2 style={{ fontSize: '32px', margin: '10px 0', color: 'white' }}>{data.passCount}</h2>
            <div style={{ fontSize: '16px' }}>Passed Exams</div>
        </div>

        <div className="card" style={{ flex: 1, minWidth: '250px', padding: '30px', textAlign: 'center', background: 'linear-gradient(135deg, var(--danger), #be123c)', color: 'white' }}>
            <i className="ri-close-circle-line" style={{ fontSize: '40px' }}></i>
            <h2 style={{ fontSize: '32px', margin: '10px 0', color: 'white' }}>{data.failCount}</h2>
            <div style={{ fontSize: '16px' }}>Failed Exams</div>
        </div>
        
        <div className="card" style={{ flex: 1, minWidth: '250px', padding: '30px', textAlign: 'center', background: 'linear-gradient(135deg, var(--warning), #d97706)', color: 'white' }}>
            <i className="ri-star-line" style={{ fontSize: '40px' }}></i>
            <h2 style={{ fontSize: '32px', margin: '10px 0', color: 'white' }}>{data.totalMarksObtained}</h2>
            <div style={{ fontSize: '16px' }}>Total Correct Answers</div>
        </div>
      </div>
    </div>
  )
}

export default UserAnalytics
