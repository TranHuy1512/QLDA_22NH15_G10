import styled from "@emotion/styled"
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import Register from './pages/Register';
import Home from './components/Home';
import VerifyEmail from './components/VerifyEmail';
import Login from "./pages/Login.jsx"
import Dashboard from "./pages/Dashboard.jsx"
import AuthProvider from "./context/authContext.jsx";
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
        <Router>
            <AuthProvider>
                <GlobalStyle>
                    <Routes>
                        <Route path="/login" element={<Login/>}/>
                        <Route path="/" element={<Home />} />
                        <Route path="/register" element={<Register />} />
                        <Route path="/verify-email" element={<VerifyEmail />} />
                            <Route path="/forgot-password" element={<ForgotPassword />} />
                            <Route path="/reset-password" element={<ResetPassword />} />
                            <Route path="/dashboard" element={<Dashboard />} />
                    </Routes>
                </GlobalStyle>
            </AuthProvider>
        </Router>
        </ThemeProvider>
    )
}

export default App
