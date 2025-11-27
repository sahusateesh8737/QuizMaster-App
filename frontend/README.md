# 🎯 QuizMaster Frontend

A professional-grade, feature-rich quiz application frontend built with React, Vite, and modern web technologies.

## ✨ Features

### User-Facing Features
- **Authentication**: Sign up, login, password reset, email verification
- **Quiz Discovery**: Browse quizzes with filters, search, and categories
- **Quiz Experience**: Timed quizzes, progress tracking, multiple question types
- **Results & Analytics**: Instant results, answer review, score breakdown
- **Leaderboards**: Global rankings, category-specific leaderboards
- **User Profile**: Personal dashboard, statistics, badges, performance metrics
- **Gamification**: Badges, points, streaks, achievements
- **Social Sharing**: Share quiz results on social media

### Technical Features
- ⚡ **Vite**: Lightning-fast build tool and dev server
- 🎨 **Tailwind CSS**: Utility-first CSS framework with custom animations
- 🎭 **Framer Motion**: Smooth animations and transitions
- 🔄 **Zustand**: Lightweight state management
- 📡 **Axios**: HTTP client with interceptors for JWT auth
- 🔐 **JWT Authentication**: Secure token-based authentication
- 📱 **Responsive Design**: Works beautifully on all devices
- ✅ **React Router v6**: Modern routing with nested routes

## 🚀 Getting Started

### Prerequisites
- Node.js 16+ and npm/yarn
- Backend running on `localhost:8000`

### Installation

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview

# Lint code
npm run lint

# Format code
npm run format
```

The app will be available at `http://localhost:3001` (or next available port)

## 📁 Project Structure

```
frontend/
├── src/
│   ├── components/
│   │   ├── ui/                 # Reusable UI components
│   │   │   ├── Button.jsx
│   │   │   ├── Input.jsx
│   │   │   ├── Card.jsx
│   │   │   ├── Badge.jsx
│   │   │   ├── LoadingSpinner.jsx
│   │   │   ├── Alert.jsx
│   │   │   └── index.js
│   │   └── layout/             # Layout components
│   │       ├── Navbar.jsx
│   │       ├── Footer.jsx
│   │       └── index.js
│   ├── pages/
│   │   ├── HomePage.jsx        # Landing page with featured quizzes
│   │   ├── LeaderboardPage.jsx # Global leaderboards
│   │   ├── auth/
│   │   │   ├── LoginPage.jsx
│   │   │   └── SignupPage.jsx
│   │   ├── quiz/
│   │   │   ├── QuizzesPage.jsx       # Quiz listing with filters
│   │   │   ├── QuizDetailPage.jsx    # Quiz details and start
│   │   │   └── QuizAttemptPage.jsx   # Quiz taking interface
│   │   ├── results/
│   │   │   └── ResultsPage.jsx       # Results with answer review
│   │   └── profile/
│   │       └── ProfilePage.jsx       # User profile and stats
│   ├── services/
│   │   ├── api.js              # Axios instance with interceptors
│   │   ├── auth.js             # Auth endpoints
│   │   ├── quiz.js             # Quiz endpoints
│   │   └── results.js          # Results endpoints
│   ├── store/
│   │   └── slices/
│   │       ├── authStore.js    # Zustand auth store
│   │       ├── quizStore.js    # Zustand quiz store
│   │       ├── resultsStore.js # Zustand results store
│   │       └── index.js
│   ├── App.jsx                 # Main app component
│   ├── App.css                 # Global styles
│   └── main.jsx                # Entry point
├── index.html                  # HTML template
├── vite.config.js              # Vite configuration
├── tailwind.config.js          # Tailwind CSS configuration
├── postcss.config.js           # PostCSS configuration
├── .env                        # Environment variables
└── package.json                # Dependencies and scripts
```

## 🎨 Design & Styling

- **Color Scheme**: Dark theme with purple & blue gradients
  - Primary: `#a78bfa` (Purple)
  - Secondary: `#60a5fa` (Blue)
  - Background: Slate 900 → Purple 900 → Slate 900 gradient
  
- **Typography**: Clean, modern sans-serif (system font stack)
- **Components**: Rounded corners, subtle shadows, smooth transitions
- **Animations**: 
  - Fade-in on load
  - Slide-up on interaction
  - Pulse effects on hover
  - Shimmer loading states
  - Spring animations for buttons

## 🔐 Authentication

### JWT Token Flow
1. User signs up/logs in
2. Backend returns `access_token` and `refresh_token`
3. Tokens stored in localStorage
4. Access token sent in Authorization header for API requests
5. On 401 response, refresh token used to get new access token
6. If refresh fails, redirect to login

### Protected Routes
Implement route protection using Zustand store:

```javascript
import { useAuthStore } from './store/slices/authStore'

function ProtectedRoute({ element }) {
  const { token } = useAuthStore()
  return token ? element : <Navigate to="/auth/login" />
}
```

## 📊 API Integration

All API calls go through `/src/services/` files:

- **API Base**: `http://localhost:8000/api`
- **Auth Endpoints**: `/users/register`, `/token`, `/users/me`
- **Quiz Endpoints**: `/quizzes`, `/quizzes/{id}`, `/quizzes/{id}/attempts`
- **Results Endpoints**: `/results`, `/results/leaderboard`

## 🎯 State Management with Zustand

Three main stores:

### Auth Store
```javascript
const { user, token, login, signup, logout } = useAuthStore()
```

### Quiz Store
```javascript
const { quizzes, currentQuiz, getQuizzes, startAttempt } = useQuizStore()
```

### Results Store
```javascript
const { leaderboard, statistics, getLeaderboard } = useResultsStore()
```

## 🚢 Deployment

### Build for Production
```bash
npm run build
```

### Environment Variables
Create `.env.production`:
```
VITE_API_URL=https://quiz-master-app-swart.vercel.app/api
```

### Hosting Options
- **Vercel**: `vercel deploy`
- **Netlify**: `netlify deploy --prod --dir=dist`
- **AWS S3 + CloudFront**: Upload `dist/` folder to S3
- **Docker**: See Dockerfile in root

## 📝 Form Handling

All forms use React state with validation:

```javascript
const [formData, setFormData] = useState({})
const [errors, setErrors] = useState({})
const [loading, setLoading] = useState(false)

const handleSubmit = async (e) => {
  e.preventDefault()
  // Validate
  // Call API
  // Handle response
}
```

## 🎪 Toast Notifications

Using React Hot Toast:

```javascript
import toast from 'react-hot-toast'

toast.success('Quiz completed!')
toast.error('Failed to submit answer')
toast.loading('Loading...')
```

## 🐛 Debugging

Enable debug mode in Zustand stores:

```javascript
import { devtools } from 'zustand/middleware'

export const useAuthStore = create(
  devtools((set) => ({ /* store */ }))
)
```

## 📱 Responsive Breakpoints

- **Mobile**: < 640px (sm)
- **Tablet**: 640px - 1024px (md)
- **Desktop**: > 1024px (lg)

Use Tailwind classes: `md:grid-cols-2 lg:grid-cols-3`

## ✅ Best Practices

1. **Keep components small and focused**
2. **Use custom hooks for shared logic**
3. **Lazy load components for code splitting**
4. **Optimize images and assets**
5. **Use React.memo for expensive components**
6. **Test API integration thoroughly**
7. **Monitor performance with DevTools**

## 🔗 Links

- [Backend API Documentation](http://localhost:8000/api/schema/swagger/)
- [Admin Panel](http://localhost:8000/admin/)
- [React Documentation](https://react.dev)
- [Tailwind CSS](https://tailwindcss.com)
- [Framer Motion](https://www.framer.com/motion)
- [Zustand](https://github.com/pmndrs/zustand)

## 📄 License

MIT License - feel free to use this project for learning and commercial purposes.

## 🤝 Contributing

Contributions are welcome! Please follow these steps:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit changes (`git commit -m 'Add amazing feature'`)
4. Push to branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📧 Support

For issues and questions, please open an issue on GitHub or contact support@quizmaster.com

---

**Made with ❤️ for learners everywhere**
