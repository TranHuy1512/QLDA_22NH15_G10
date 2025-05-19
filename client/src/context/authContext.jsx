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
    const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:5000';

    const verifyUser = useCallback(async () => {
        // if (!token) {
        //     setLoading(false);
        //     return;
        // }
        //
        // try {
        //     const response = await axios.get(`${BACKEND_URL}/api/profile`, {
        //         headers: {
        //             Authorization: `Bearer ${token}`,
        //         },
        //     });
        //     setUser(response.data);
        //     setError(null);
        // } catch (err) {
        //     console.error('Verify user error:', err);
        //     setError(err.response?.data?.message || 'Phiên đăng nhập hết hạn. Vui lòng đăng nhập lại.');
        //     logout();
        // } finally {
        //     setLoading(false);
        // }
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
            const message = err.response?.data?.message || 'Đăng nhập thất bại. Vui lòng thử lại.';
            setError(message);
            throw err;
        }
    };

    // Hàm đăng xuất
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
        loading,
        login,
        logout,
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