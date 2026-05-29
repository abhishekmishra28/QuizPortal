import React,{useState,useEffect} from 'react'
import PageTitle from '../../../components/PageTitle'
import {Table, message} from 'antd'
import { HideLoading, ShowLoading } from '../../../redux/loaderSlice'
import { useDispatch } from 'react-redux'
import { getAllAttemptsByUser } from '../../../apicalls/reports'
import { useNavigate } from 'react-router-dom'

function ReportsPage() {
  const [reportsData, setReportsData] = useState([])
  const dispatch = useDispatch()
  const navigate = useNavigate()
  const columns = [
    {
       title: "Exam Name",
       dataIndex: "examName",
       render: (text,record) => 
        <>{record.exam ? record.exam.name : "Deleted Exam"}</>
    },
    {
       title: "Date",
       dataIndex: "date",
       render: (text,record) => 
        <>{record.createdAt ? new Date(record.createdAt).toLocaleString() : "N/A"}</>
       
    },
    {
      title: "Total Marks",
      dataIndex: "totalMarks",
      render: (text,record) => 
        <>{record.exam ? record.exam.totalMarks : "N/A"}</>
       
    },
    {
      title: "Passing Marks",
      dataIndex: "passingMarks",
      render: (text,record) => 
        <>{record.exam ? record.exam.passingMarks : "N/A"}</>
       
    },
    {
      title: "Obtained Marks",
      dataIndex: "obtainedMarks",
      render: (text,record) => 
        <>{record.result.correctAnswers.length}</>
       
    },
    {
      title: "Verdict",
      dataIndex: "verdict",
      render: (text,record) => 
        <>{record.result.verdict}</>
    },
    {
      title: "Action",
      dataIndex: "action",
      render: (text,record) => {
        return (
        <div className="flex gap-2">
          <button 
            className="primary-outlined-btn" 
            onClick={() => navigate('/user/review-exam', { state: { report: record } })}
            style={{ padding: '4px 10px', fontSize: '13px' }}
          >
            Review
          </button>
        </div>
      )}
    }
  ]
  const getData = async() => {
     try{
       dispatch(ShowLoading())
       const response = await getAllAttemptsByUser()
       dispatch(HideLoading())
       if(response.success){
        setReportsData(response.data)
        message.success(response.message)
        console.log(reportsData)
       }
       else{
        message.error(response.message)
       }
     }
     catch(error){
      dispatch(HideLoading())
      message.error(error.message)
     }
  }
  useEffect(()=>{
   getData()
  },[])
  return (
    <div>
      <PageTitle title="Reports"/>
      <div className='divider'></div>
      <Table columns={columns} className="mt-2" dataSource={reportsData}/>
    </div>
  )
}

export default ReportsPage