import React,{useState,useEffect} from 'react'
import PageTitle from '../../../components/PageTitle'
import {Table, message} from 'antd'
import { HideLoading, ShowLoading } from '../../../redux/loaderSlice'
import { useDispatch } from 'react-redux'
import { getAllAttempts, getAllAttemptsByUser } from '../../../apicalls/reports'
import moment from 'moment'
import { useNavigate } from 'react-router-dom'

function AdminReportsPage() {
  const [reportsData, setReportsData] = useState([])
  const [filters, setFilters] = useState({
    examName: "",
    userName: "",
  })
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
        <>{moment(record.createdAt).format("DD-MM-YYYY hh:mm:ss")}</>
       
    },
    {
        title: "User",
        dataIndex: "user",
        render: (text,record) => 
         <>{record.user ? record.user.name : "Deleted User"}</>
        
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
      render: (text,record) => (
        <div className="flex gap-2">
          <button 
            className="primary-outlined-btn" 
            onClick={() => navigate('/user/review-exam', { state: { report: record } })}
            style={{ padding: '4px 10px', fontSize: '13px' }}
          >
            Review
          </button>
        </div>
      )
    }
  ]
  const getData = async(tempFilters) => {
     try{
       dispatch(ShowLoading())
       const response = await getAllAttempts(tempFilters)
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
   getData(filters)
  },[])
  return (
    <div>
      <PageTitle title="Reports"/>
      <div className='divider'></div>
      <div className='flex gap-2 mt-2'>
        <input type="text" placeholder='Exam' value={filters.examName} onChange={(e)=>setFilters({...filters, examName: e.target.value})}/>
        <input type="text" placeholder='User' value={filters.userName} onChange={(e)=>setFilters({...filters, userName: e.target.value})}/>
        <button className='primary-outlined-btn' onClick={()=>{
            setFilters({
                userName: "",
                examName: "",
            })
            getData({
                userName: "",
                examName: "",
            })
        }}>
            Clear
        </button>
        <button className='primary-contained-btn' onClick={()=>getData(filters)}>
            Search
        </button>
      </div>
      <Table columns={columns} className="mt-2" dataSource={reportsData}/>
    </div>
  )
}

export default AdminReportsPage