import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import BlurOverlay from '../components/BlurOverlay.jsx';
import {
  ErrorMessage,
  FormContainer,
  FormWrapper,
  Input,
  Label,
  Title,
  Button,
  StyledLink
} from '../components/FormComponents';

// Hardcode API URL for now since environment variable is not working
const API_URL = 'http://localhost:5000';

const Register = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: ''
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const validateForm = () => {
    if (!formData.name || !formData.email || !formData.password || !formData.confirmPassword) {
      setError('All fields are required');
      return false;
    }

    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      return false;
    }

    if (formData.password.length < 8) {
      setError('Password must be at least 8 characters long');
      return false;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      setError('Please enter a valid email address');
      return false;
    }

    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    
    if (!validateForm()) {
      return;
    }

    setLoading(true);
    try {
      console.log('Sending request to:', `${API_URL}/api/register`);
      console.log('Request data:', {
        name: formData.name,
        email: formData.email,
        password: formData.password
      });

      const response = await axios.post(`${API_URL}/api/register`, {
        name: formData.name,
        email: formData.email,
        password: formData.password
      });

      console.log('Response:', response);
      
      if (response.status === 201) {
        
        alert('Registration successful! Please check your email to verify your account.');
        navigate('/login');
      }
    } catch (error) {
      console.error('Registration error:', error);
      if (error.response) {
        console.error('Error response:', error.response.data);
        if (error.response.data.errors && Array.isArray(error.response.data.errors)) {
          // Join all error messages with newlines
          setError(error.response.data.errors.join('\n'));
        } else {
          setError(error.response.data.message || 'Registration failed. Please try again.');
        }
      } else if (error.request) {
        // The request was made but no response was received
        console.error('No response received:', error.request);
        setError('No response from server. Please check your connection.');
      } else {
        // Something happened in setting up the request that triggered an Error
        console.error('Error setting up request:', error.message);
        setError('An error occurred. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <BlurOverlay>
      <FormContainer style={{ fontWeight: 200 }}>
        <FormWrapper>
          <form onSubmit={handleSubmit}>
            <Title style={{ fontWeight: 200 }}>REGISTER</Title>

            <Label>Name</Label>
            <Input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              placeholder="Enter your name"
            />

            <Label>Email</Label>
            <Input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="Enter your email"
            />

            <Label>Password</Label>
            <Input
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              placeholder="Enter your password"
            />

            <Label>Confirm Password</Label>
            <Input
              type="password"
              name="confirmPassword"
              value={formData.confirmPassword}
              onChange={handleChange}
              placeholder="Confirm your password"
            />

            {error && <ErrorMessage>{error}</ErrorMessage>}

            <Button type="submit" style={{ fontWeight: 200 }} disabled={loading}>
              {loading ? 'Registering...' : 'Register'}
            </Button>

            <StyledLink>
              Already have an account? <Link to="/login">Login here</Link>
            </StyledLink>
          </form>
        </FormWrapper>
      </FormContainer>
    </BlurOverlay>
  );
};

export default Register;
