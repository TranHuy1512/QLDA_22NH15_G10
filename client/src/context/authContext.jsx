import { useContext, createContext, useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const AuthContext = createContext();

const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [token, setToken] = useState(localStorage.getItem('site') || '');
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const navigate = useNavigate();
    const BACKEND_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

    const verifyUser = useCallback(async () => {
        if (!token) {
            setLoading(false);
            return;
        }
        
        try {
            const response = await axios.get(`${BACKEND_URL}/api/profile`, {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });
            setUser(response.data);
            setError(null);
        } catch (err) {
            console.error('Verify user error:', err);
            setError(err.response?.data?.message || 'Session expired. Please login again!');
            logout();
        } finally {
            setLoading(false);
        }
    }, [token]);

    useEffect(() => {
        verifyUser();
    }, [verifyUser]);

    const login = async (data) => {
        try {
            const response = await axios.post(`${BACKEND_URL}/api/login`, data, {
                headers: {
                    'Content-Type': 'application/json',
                },
            });
            const { token, user } = response.data; // Phù hợp với authController.js
            setUser(user); // { id, name, email }
            setToken(token);
            setError(null);
            localStorage.setItem('site', token);
            navigate('/');
        } catch (err) {
            console.error('Login error:', err);
            const message = err.response?.data?.message || 'Login failed. Please try again!';
            setError(message);
            throw err;
        }
    };

    const logout = useCallback(() => {
        setUser(null);
        setToken('');
        setError(null);
        localStorage.removeItem('site');
        navigate('/login');
    }, [navigate]);

    // Giá trị cung cấp cho context
    const value = {
        user,
        token,
        error,
        setError,
        loading,
        login,
        logout,
        setUser, // Expose setUser to the context
    };

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export default AuthProvider;
export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};