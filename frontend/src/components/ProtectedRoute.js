import React, { useEffect, useState } from 'react'
import { getUserInfo } from '../apicalls/users'
import { message } from 'antd'
import { useDispatch } from 'react-redux'
import { SetUser } from '../redux/usersSlice'
import { useSelector } from 'react-redux'
import { useNavigate } from 'react-router-dom'
import { HideLoading, ShowLoading } from '../redux/loaderSlice'

function ProtectedRoute({ children }) {
  const dispatch = useDispatch()
  const navigate = useNavigate()
  const user = useSelector(state => state.users.user)
  const [menu, setMenu] = useState([])
  const [collapsed, setCollapsed] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)

  const userMenu = [
    {
      title: "Home",
      paths: ["/", "/user/write-exam/:id"],
      icon: <i className="ri-home-5-line"></i>,
      onClick: () => navigate("/")
    },
    {
      title: "Reports",
      paths: ["/user/reports"],
      icon: <i className="ri-bar-chart-2-line"></i>,
      onClick: () => navigate("/user/reports")
    },
    {
      title: "Analytics",
      paths: ["/user/analytics"],
      icon: <i className="ri-pie-chart-line"></i>,
      onClick: () => navigate("/user/analytics")
    },
    {
      title: "Logout",
      paths: ["/logout"],
      icon: <i className='ri-logout-box-r-line'></i>,
      onClick: () => {
        localStorage.removeItem("token")
        navigate("/login")
      }
    }
  ]

  const adminMenu = [
    {
      title: "Dashboard",
      paths: ["/"],
      icon: <i className="ri-dashboard-3-line"></i>,
      onClick: () => navigate("/")
    },
    {
      title: "Exams",
      paths: ["/admin/exams", "/admin/exams/add", "/admin/exams/edit/:id"],
      icon: <i className='ri-file-list-3-line'></i>,
      onClick: () => navigate("/admin/exams")
    },
    {
      title: "Reports",
      paths: ["/admin/reports"],
      icon: <i className="ri-bar-chart-2-line"></i>,
      onClick: () => navigate("/admin/reports")
    },
    {
      title: "Analytics",
      paths: ["/admin/analytics"],
      icon: <i className="ri-pie-chart-line"></i>,
      onClick: () => navigate("/admin/analytics")
    },
    {
      title: "Users",
      paths: ["/admin/users"],
      icon: <i className="ri-group-line"></i>,
      onClick: () => navigate("/admin/users")
    },
    {
      title: "Logout",
      paths: ["/logout"],
      icon: <i className='ri-logout-box-r-line'></i>,
      onClick: () => {
        localStorage.removeItem("token")
        navigate("/login")
      }
    }
  ]

  const getUserData = async () => {
    try {
      dispatch(ShowLoading())
      const response = await getUserInfo()
      dispatch(HideLoading())
      if (response.success) {
        dispatch(SetUser(response.data))
        setMenu(response.data.isAdmin ? adminMenu : userMenu)
      } else {
        message.error(response.message)
        navigate("/login")
      }
    }
    catch (error) {
      dispatch(HideLoading())
      message.error(error.message)
      navigate("/login")
    }
  }

  useEffect(() => {
    if (localStorage.getItem('token')) {
      if (!user) {
        getUserData()
      } else {
        setMenu(user.isAdmin ? adminMenu : userMenu)
      }
    } else {
      navigate('/login')
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const activeRoute = window.location.pathname

  const getIsActive = (paths) => {
    if (paths.includes(activeRoute)) return true
    if (activeRoute.includes("/admin/exams/edit") && paths.includes("/admin/exams")) return true
    if (activeRoute.includes("/user/write-exam") && paths.includes("/user/write-exam/:id")) return true
    return false
  }

  return (
    user && (
      <div className="layout">
        <div className="main-flex">
          {/* Mobile Overlay */}
          <div
            className={`sidebar-overlay ${mobileOpen ? 'active' : ''}`}
            onClick={() => setMobileOpen(false)}
          />

          {/* Sidebar */}
          <div className={`sidebar ${collapsed ? 'collapsed' : ''} ${mobileOpen ? 'mobile-open' : ''}`}>
            <div className="sidebar-logo">
              <div className="sidebar-logo-icon">
                <i className="ri-quill-pen-fill" style={{ color: 'white', fontSize: '16px' }}></i>
              </div>
              {!collapsed && <span className="sidebar-logo-text">QuizPortal</span>}
            </div>
            <div className="sidebar-menu">
              {menu.map((item, index) => (
                <div
                  key={index}
                  className={`menu-item ${getIsActive(item.paths) ? 'active-menu-item' : ''}`}
                  onClick={item.onClick}
                  title={collapsed ? item.title : ''}
                >
                  {item.icon}
                  {!collapsed && <span>{item.title}</span>}
                </div>
              ))}
            </div>
          </div>

          {/* Main body */}
          <div className="body">
            {/* Header */}
            <div className="header">
              <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                <span
                  className="header-toggle"
                  onClick={() => {
                    if (window.innerWidth <= 768) {
                      setMobileOpen(prev => !prev);
                    } else {
                      setCollapsed(prev => !prev);
                    }
                  }}
                >
                  {(collapsed || mobileOpen)
                    ? <i className="ri-menu-2-line"></i>
                    : <i className="ri-menu-fold-line"></i>
                  }
                </span>
                <span className="header-title">Quiz Portal</span>
              </div>

              <div className="header-user">
                <i className="ri-user-3-line"></i>
                <div>
                  <div className="header-user-name">{user?.name}</div>
                  <div className="header-user-role">{user?.isAdmin ? 'Administrator' : 'Student'}</div>
                </div>
              </div>
            </div>

            {/* Content */}
            <div className="content">
              {children}
            </div>
          </div>
        </div>
      </div>
    )
  )
}

export default ProtectedRoute