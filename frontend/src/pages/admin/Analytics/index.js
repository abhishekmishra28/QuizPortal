import React, { useState, useEffect } from 'react'
import PageTitle from '../../../components/PageTitle'
import { message } from 'antd'
import { useDispatch } from 'react-redux'
import { ShowLoading, HideLoading } from '../../../redux/loaderSlice'
import { getAdminAnalytics } from '../../../apicalls/reports'

function AdminAnalytics() {
  const [data, setData] = useState({
    examsCount: 0,
    usersCount: 0,
    reportsCount: 0,
  })
  const dispatch = useDispatch()

  const getData = async () => {
    try {
      dispatch(ShowLoading())
      const response = await getAdminAnalytics()
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
      <PageTitle title="Admin Analytics" />
      <div className="divider"></div>
      
      <div style={{ display: 'flex', gap: '20px', flexWrap: 'wrap', marginTop: '20px' }}>
        <div className="card" style={{ flex: 1, minWidth: '250px', padding: '30px', textAlign: 'center', background: 'linear-gradient(135deg, var(--primary), var(--primary-dark))', color: 'white' }}>
            <i className="ri-file-list-3-line" style={{ fontSize: '40px' }}></i>
            <h2 style={{ fontSize: '32px', margin: '10px 0', color: 'white' }}>{data.examsCount}</h2>
            <div style={{ fontSize: '16px' }}>Total Exams</div>
        </div>

        <div className="card" style={{ flex: 1, minWidth: '250px', padding: '30px', textAlign: 'center', background: 'linear-gradient(135deg, var(--success), #059669)', color: 'white' }}>
            <i className="ri-user-3-line" style={{ fontSize: '40px' }}></i>
            <h2 style={{ fontSize: '32px', margin: '10px 0', color: 'white' }}>{data.usersCount}</h2>
            <div style={{ fontSize: '16px' }}>Total Users</div>
        </div>

        <div className="card" style={{ flex: 1, minWidth: '250px', padding: '30px', textAlign: 'center', background: 'linear-gradient(135deg, var(--secondary), #7e22ce)', color: 'white' }}>
            <i className="ri-bar-chart-2-line" style={{ fontSize: '40px' }}></i>
            <h2 style={{ fontSize: '32px', margin: '10px 0', color: 'white' }}>{data.reportsCount}</h2>
            <div style={{ fontSize: '16px' }}>Total Attempts</div>
        </div>
      </div>
    </div>
  )
}

export default AdminAnalytics
