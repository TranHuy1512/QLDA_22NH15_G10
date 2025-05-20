import {useState} from "react";
import {useAuth} from '../context/authContext.jsx'
import BlurOverlay from "../components/BlurOverlay.jsx";
import {ErrorMessage, FormContainer, FormWrapper, Input, Label, Title, Button, StyledLink} from "../components/TaskComponents/FormComponents.jsx";
import {Link, useNavigate} from "react-router-dom";

function Login() {
    const [email, setEmail] = useState("")
    const [password, setPassword] = useState("")
    const {login, error} = useAuth()
    const navigate = useNavigate()

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            // Gọi hàm login và đợi kết quả
            await login({ email: email, password: password });

            // Chuyển hướng đến trang dashboard sau khi đăng nhập thành công
            navigate('/dashboard');
        } catch (err) {
            // Xử lý lỗi (nếu có)
            console.error("Login error", err);
        }
    };

    return (
        <BlurOverlay>
            <FormContainer style={{fontWeight: 200}}>
                <FormWrapper>
                    <form onSubmit={handleSubmit}>
                        <Title style={{fontWeight: 200}}>LOGIN</Title>
                        <Label>Email</Label>
                        <Input type="text"
                               value={email}
                               onChange={(e) => setEmail(e.target.value)}
                               placeholder="Enter your email"
                        />
                        <Label>Password</Label>
                        <Input
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            placeholder="Enter your password"
                        />
                        <ErrorMessage>{error}</ErrorMessage>
                        <Button type="submit" style={{fontWeight: 200}}>Login</Button>
                        <StyledLink>
                            Don&#39;t have an account? <Link to="/register">Register here</Link>
                        </StyledLink>
                        <StyledLink>
                            <Link to="/forgot-password">Forgot Password?</Link>
                        </StyledLink>
                    </form>
                </FormWrapper>
            </FormContainer>
        </BlurOverlay>
    );
}

export default Login;