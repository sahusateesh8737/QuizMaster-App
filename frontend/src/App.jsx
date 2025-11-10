import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'
import Navbar from './components/layout/Navbar'
import Footer from './components/layout/Footer'
import HomePage from './pages/HomePage'
import LoginPage from './pages/auth/LoginPage'
import SignupPage from './pages/auth/SignupPage'
import VerifyEmailPage from './pages/auth/VerifyEmailPage'
import ResendVerificationPage from './pages/auth/ResendVerificationPage'
import ForgotPasswordPage from './pages/auth/ForgotPasswordPage'
import ResetPasswordPage from './pages/auth/ResetPasswordPage'
import QuizzesPage from './pages/quiz/QuizzesPage'
import QuizDetailPage from './pages/quiz/QuizDetailPage'
import QuizAttemptPage from './pages/quiz/QuizAttemptPage'
import CreateQuizPage from './pages/quiz/CreateQuizPage'
import EditQuizPage from './pages/quiz/EditQuizPage'
import ManageQuizzesPage from './pages/quiz/ManageQuizzesPage'
import ResultsPage from './pages/results/ResultsPage'
import ProfilePage from './pages/profile/ProfilePage'
import LeaderboardPage from './pages/LeaderboardPage'
// Live Quiz imports
import TeacherDashboard from './pages/teacher/TeacherDashboard'
import CreateLiveSession from './pages/teacher/CreateLiveSession'
import LiveQuizControl from './pages/teacher/LiveQuizControl'
import JoinQuizPage from './pages/live/JoinQuizPage'
import WaitingRoom from './pages/live/WaitingRoom'
import LiveQuizPlay from './pages/live/LiveQuizPlay'
import LiveQuizResults from './pages/live/LiveQuizResults'
import './App.css'

function App() {
  return (
    <Router>
      <Toaster position="top-right" reverseOrder={false} />
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex flex-col">
        <Navbar />
        <main className="flex-grow">
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/auth/login" element={<LoginPage />} />
            <Route path="/auth/signup" element={<SignupPage />} />
            <Route path="/auth/verify-email" element={<VerifyEmailPage />} />
            <Route path="/auth/resend-verification" element={<ResendVerificationPage />} />
            <Route path="/auth/forgot-password" element={<ForgotPasswordPage />} />
            <Route path="/auth/reset-password" element={<ResetPasswordPage />} />
            <Route path="/quizzes" element={<QuizzesPage />} />
            <Route path="/quizzes/create" element={<CreateQuizPage />} />
            <Route path="/quizzes/manage" element={<ManageQuizzesPage />} />
            <Route path="/quizzes/:id" element={<QuizDetailPage />} />
            <Route path="/quizzes/:id/edit" element={<EditQuizPage />} />
            <Route path="/quizzes/:id/attempt" element={<QuizAttemptPage />} />
            <Route path="/results/:id" element={<ResultsPage />} />
            <Route path="/profile" element={<ProfilePage />} />
            <Route path="/leaderboard" element={<LeaderboardPage />} />
            
            {/* Live Quiz Routes */}
            <Route path="/teacher/dashboard" element={<TeacherDashboard />} />
            <Route path="/teacher/create-session" element={<CreateLiveSession />} />
            <Route path="/teacher/live/:sessionId" element={<LiveQuizControl />} />
            <Route path="/join" element={<JoinQuizPage />} />
            <Route path="/live/waiting/:sessionId" element={<WaitingRoom />} />
            <Route path="/live/play/:sessionId" element={<LiveQuizPlay />} />
            <Route path="/live/results/:sessionId" element={<LiveQuizResults />} />
            
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </main>
        <Footer />
      </div>
    </Router>
  )
}

export default App
