import styled from "@emotion/styled"
import {Route, Routes, Navigate} from "react-router-dom";
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
        <>
            <GlobalStyle>
                <Routes>
                    <Route path="/" element={<Navigate to="/login" replace/>}/>
                    <Route path="/login" element={<Login/>}/>
                </Routes>
            </GlobalStyle>
        </>
    )
}

export default App
