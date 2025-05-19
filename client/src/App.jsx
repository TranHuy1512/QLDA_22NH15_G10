import styled from "@emotion/styled"
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Register from './components/Register';
import Home from './components/Home';
import VerifyEmail from './components/VerifyEmail';

function App() {
    const GlobalStyle = styled.div`
        box-sizing: border-box;
        background-color: #0A0E14;
        height: 100vh;
    `
    return (
        <Router>
            <GlobalStyle>
                <Routes>
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
