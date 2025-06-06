import styled from "@emotion/styled"
import {BrowserRouter as Router, Routes, Route, Navigate} from 'react-router-dom';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import { Toaster } from 'react-hot-toast';
import Register from './pages/Register';
import VerifyEmail from './components/VerifyEmail';
import Login from "./pages/Login"
import Dashboard from "./pages/Dashboard"
import AuthProvider from "./context/authContext";
import backgroundImage from "./assets/background.jpg"
import ForgotPassword from './pages/ForgotPassword';
import ResetPassword from './pages/ResetPassword';

// Create a theme instance
const theme = createTheme({
  palette: {
    primary: {
      main: '#1976d2',
    },
    secondary: {
      main: '#dc004e',
    },
  },
});

function App() {
    const GlobalStyle = styled.div`
        box-sizing: border-box;
        background-image: url(${backgroundImage});
        background-size: cover;
        height: 100vh;
    `
    return (
        <ThemeProvider theme={theme}>
            <CssBaseline />
            <Toaster position="top-right" />
            <Router>
                <AuthProvider>
                    <GlobalStyle>
                        <Routes>
                            <Route path="/" element={<Navigate to="/dashboard" replace/>}/>
                            <Route path="/login" element={<Login/>}/>
                            <Route path="/register" element={<Register />} />
                            <Route path="/verify-email" element={<VerifyEmail />} />
                            <Route path="/forgot-password" element={<ForgotPassword />} />
                            <Route path="/reset-password" element={<ResetPassword />} />
                            <Route path="/dashboard" element={<Dashboard />} />
                            <Route path="/board" element={<Dashboard />} />
                            <Route path="/teams" element={<Dashboard />} />
                            <Route path="/teams/:teamId" element={<Dashboard />} />
                            <Route path="/settings" element={<Dashboard />} />
                            <Route path="/profile" element={<Dashboard />} />
                            <Route path="/gantt" element={<Dashboard />} />
                            {/* Add more routes as needed */}
                        </Routes>
                    </GlobalStyle>
                </AuthProvider>
            </Router>
        </ThemeProvider>
    )
}

export default App
