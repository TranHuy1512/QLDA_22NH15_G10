import {useState, useEffect} from "react";
import {useNavigate, useLocation} from "react-router-dom";
import axios from "axios";
import BlurOverlay from "../components/BlurOverlay.jsx";
import {ErrorMessage, FormContainer, FormWrapper, Input, Label, Title, Button, StyledLink} from "../components/FormComponents.jsx";
import {Link} from "react-router-dom";
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';
function ResetPassword() {
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [message, setMessage] = useState('');
    const [error, setError] = useState('');
    const navigate = useNavigate();
    const location = useLocation();
    const token = new URLSearchParams(location.search).get('token');

    useEffect(() => {
        if (!token) {
            setError('Invalid or missing reset token');
            setTimeout(() => {
                navigate('/login');
            }, 2000);
        }
    }, [token, navigate]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!token) {
            setError('Invalid or missing reset token');
            return;
        }
        if (password !== confirmPassword) {
            setError('Passwords do not match');
            return;
        }
        if (password.length < 6) {
            setError('Password must be at least 6 characters long');
            return;
        }
        try {
            const response = await axios.post(API_URL + '/api/reset-password', {
                token,
                password
            });
            setMessage(response.data.message);
            setError('');
            // Redirect to login after 2 seconds
            setTimeout(() => {
                navigate('/login');
            }, 2000);
        } catch (err) {
            console.error('Reset password error:', err);
            setError(err.response?.data?.message || 'An error occurred');
            setMessage('');
        }
    };

    if (!token) {
        return (
            <BlurOverlay>
                <FormContainer style={{fontWeight: 200}}>
                    <FormWrapper>
                        <Title style={{fontWeight: 200}}>INVALID TOKEN</Title>
                        <ErrorMessage>Invalid or missing reset token. Redirecting to login...</ErrorMessage>
                        <StyledLink>
                            <Link to="/login">Back to Login</Link>
                        </StyledLink>
                    </FormWrapper>
                </FormContainer>
            </BlurOverlay>
        );
    }

    return (
        <BlurOverlay>
            <FormContainer style={{fontWeight: 200}}>
                <FormWrapper>
                    <form onSubmit={handleSubmit}>
                        <Title style={{fontWeight: 200}}>RESET PASSWORD</Title>
                        <Label>New Password</Label>
                        <Input 
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            placeholder="Enter new password"
                            required
                            minLength={6}
                        />
                        <Label>Confirm Password</Label>
                        <Input 
                            type="password"
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                            placeholder="Confirm new password"
                            required
                            minLength={6}
                        />
                        {message && (
                            <ErrorMessage style={{color: 'green'}}>{message}</ErrorMessage>
                        )}
                        {error && (
                            <ErrorMessage>{error}</ErrorMessage>
                        )}
                        <Button type="submit" style={{fontWeight: 200}}>Reset Password</Button>
                        <StyledLink>
                            <Link to="/login">Back to Login</Link>
                        </StyledLink>
                    </form>
                </FormWrapper>
            </FormContainer>
        </BlurOverlay>
    );
}

export default ResetPassword; 