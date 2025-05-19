import {useState} from "react";
import {useNavigate} from "react-router-dom";
import axios from "axios";
import BlurOverlay from "../components/BlurOverlay.jsx";
import {ErrorMessage, FormContainer, FormWrapper, Input, Label, Title, Button, StyledLink} from "../components/FormComponents";
import {Link} from "react-router-dom";

function ForgotPassword() {
    const [email, setEmail] = useState('');
    const [message, setMessage] = useState('');
    const [error, setError] = useState('');
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const response = await axios.post('http://localhost:5000/api/forgot-password', { email });
            setMessage(response.data.message);
            setError('');
        } catch (err) {
            console.error('Forgot password error:', err);
            setError(err.response?.data?.message || 'An error occurred');
            setMessage('');
        }
    };

    return (
        <BlurOverlay>
            <FormContainer style={{fontWeight: 200}}>
                <FormWrapper>
                    <form onSubmit={handleSubmit}>
                        <Title style={{fontWeight: 200}}>FORGOT PASSWORD</Title>
                        <Label>Email</Label>
                        <Input 
                            type="text"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            placeholder="Enter your email"
                        />
                        {message && (
                            <ErrorMessage style={{color: 'green'}}>{message}</ErrorMessage>
                        )}
                        {error && (
                            <ErrorMessage>{error}</ErrorMessage>
                        )}
                        <Button type="submit" style={{fontWeight: 200}}>Send Reset Link</Button>
                        <StyledLink>
                            <Link to="/login">Back to Login</Link>
                        </StyledLink>
                    </form>
                </FormWrapper>
            </FormContainer>
        </BlurOverlay>
    );
}

export default ForgotPassword; 