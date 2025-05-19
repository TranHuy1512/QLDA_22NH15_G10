import styled from "@emotion/styled"
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Register from './pages/Register';
import Home from './components/Home';
import VerifyEmail from './components/VerifyEmail';
import Login from "./pages/Login.jsx"
import backgroundImage from "./assets/background.jpg"
function App() {
    const GlobalStyle = styled.div`
        box-sizing: border-box;
        background-image: url(${backgroundImage});
        background-size: cover;
        height: 100vh;
    `
    return (
        <Router>
            <GlobalStyle>
                <Routes>
                    <Route path="/login" element={<Login/>}/>
                    <Route path="/" element={<Home />} />
                    <Route path="/register" element={<Register />} />
                    <Route path="/verify-email" element={<VerifyEmail />} />
                    {/* Add other routes here */}
                </Routes>
            </GlobalStyle>
        </Router>
    )
}

export default App
