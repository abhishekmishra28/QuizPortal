import './App.css';
import './stylesheets/alignments.css'
import './stylesheets/textelements.css'
import './stylesheets/theme.css'
import './stylesheets/custom-components.css'
import './stylesheets/form-elements.css'
import './stylesheets/layout.css'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import LoginPage from './pages/common/Login';
import RegisterPage from './pages/common/Register';
import HomePage from './pages/common/Home';
import ProtectedRoute from './components/ProtectedRoute';
import PublicRoute from './components/PublicRoute';
import ReportsPage from './pages/user/Reports';
import ProfilePage from './pages/user/Profile';
import ExamsPage from './pages/admin/Exams';
import AddEditExam from './pages/admin/Exams/AddEditExam';
import Loader from './components/Loader';
import { useSelector } from 'react-redux';
import WriteExam from './pages/user/WriteExam';
import AdminReportsPage from './pages/admin/Reports';
import AdminAnalytics from './pages/admin/Analytics';
import UserAnalytics from './pages/user/Analytics';
import UsersPage from './pages/admin/Users';
import ReviewExam from './pages/user/ReviewExam';
import AdminExamResults from './pages/admin/Exams/AdminExamResults';

function App() {
  const {loading} = useSelector(state=>state.loaders)
  return (
    <>
      {loading&&<Loader/>}
      <Router>
      <Routes>
        <Route path="/login" element={<PublicRoute><LoginPage/></PublicRoute>}/>
        <Route path="/register" element={<PublicRoute><RegisterPage/></PublicRoute>}/>
        <Route path="/" element={<ProtectedRoute><HomePage/></ProtectedRoute>}/>
        <Route path="/admin/exams" element={<ProtectedRoute><ExamsPage/></ProtectedRoute>}/>
        <Route path="/admin/exams/add" element={<ProtectedRoute><AddEditExam/></ProtectedRoute>}/>
        <Route path="/admin/exams/edit/:id" element={<ProtectedRoute><AddEditExam/></ProtectedRoute>}/>
        <Route path="/admin/exams/results/:id" element={<ProtectedRoute><AdminExamResults/></ProtectedRoute>}/>
        <Route path="/user/reports" element={<ProtectedRoute><ReportsPage/></ProtectedRoute>}/>
        <Route path="/admin/reports" element={<ProtectedRoute><AdminReportsPage/></ProtectedRoute>}/>
        <Route path="/profile" element={<ProtectedRoute><ProfilePage/></ProtectedRoute>}/>
        <Route path="/user/write-exam/:id" element={<ProtectedRoute><WriteExam/></ProtectedRoute>}/>
        <Route path="/user/review-exam" element={<ProtectedRoute><ReviewExam/></ProtectedRoute>}/>
        <Route path="/admin/analytics" element={<ProtectedRoute><AdminAnalytics/></ProtectedRoute>}/>
        <Route path="/user/analytics" element={<ProtectedRoute><UserAnalytics/></ProtectedRoute>}/>
        <Route path="/admin/users" element={<ProtectedRoute><UsersPage/></ProtectedRoute>}/>
      </Routes>
    </Router>
    </>
  );
}

export default App;
