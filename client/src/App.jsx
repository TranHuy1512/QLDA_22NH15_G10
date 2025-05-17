import styled from "@emotion/styled"
import {Route, Routes, Navigate} from "react-router-dom";

function App() {
    const GlobalStyle = styled.div`
        box-sizing: border-box;
        background-color: #0A0E14;
        height: 100vh;
    `
    return (
        <>
            <GlobalStyle>
                <Routes>
                    {/*<Route path="/" element={<Navigate to="/home" replace/>}/>*/}
                </Routes>
            </GlobalStyle>
        </>
    )
}

export default App
