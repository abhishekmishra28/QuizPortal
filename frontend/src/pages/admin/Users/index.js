import React, { useState, useEffect } from 'react'
import PageTitle from '../../../components/PageTitle'
import { Table, message, Popconfirm } from 'antd'
import { useDispatch } from 'react-redux'
import { ShowLoading, HideLoading } from '../../../redux/loaderSlice'
import { getAllUsers, deleteUser } from '../../../apicalls/users'
import moment from 'moment'

function UsersPage() {
  const [users, setUsers] = useState([])
  const dispatch = useDispatch()

  const getData = async () => {
    try {
      dispatch(ShowLoading())
      const response = await getAllUsers()
      dispatch(HideLoading())
      if (response.success) {
        setUsers(response.data)
      } else {
        message.error(response.message)
      }
    } catch (error) {
      dispatch(HideLoading())
      message.error(error.message)
    }
  }

  const handleDeleteUser = async (userId) => {
    try {
      dispatch(ShowLoading())
      const response = await deleteUser({ userIdToDelete: userId })
      dispatch(HideLoading())
      if (response.success) {
        message.success(response.message)
        getData()
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

  const columns = [
    {
      title: "Name",
      dataIndex: "name",
    },
    {
      title: "Email",
      dataIndex: "email",
    },
    {
      title: "Role",
      dataIndex: "isAdmin",
      render: (isAdmin) => isAdmin ? "Admin" : "Student"
    },
    {
      title: "Joined At",
      dataIndex: "createdAt",
      render: (text) => moment(text).format("DD-MM-YYYY hh:mm:ss")
    },
    {
      title: "Action",
      dataIndex: "action",
      render: (text, record) => (
        <Popconfirm
          title="Delete User"
          description="Are you sure to delete this user? Their reports will also be deleted."
          onConfirm={() => handleDeleteUser(record._id)}
          okText="Yes"
          cancelText="No"
        >
          <i className="ri-delete-bin-line" style={{ color: 'var(--danger)', cursor: 'pointer', fontSize: 18 }}></i>
        </Popconfirm>
      )
    }
  ]

  return (
    <div>
      <PageTitle title="User Management" />
      <div className="divider"></div>
      <Table columns={columns} dataSource={users} rowKey="_id" className="mt-2" />
    </div>
  )
}

export default UsersPage
