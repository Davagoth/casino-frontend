import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './Login.css';
import axios from 'axios';
import Profile from './Profile';
import BACKEND_URL from '../config';

const Login = ({ login, setWelcomeMessage }) => {  // Dodajemy funkcję setWelcomeMessage
    const [credentials, setCredentials] = useState({ username: "", password: "" });
    const [errorMessage, setErrorMessage] = useState("");
    const navigate = useNavigate();

    const handleLogin = async () => {
        const { username, password } = credentials;

        try {
            // Wysyłanie POST do backendu z loginem i hasłem
            const response = await axios.post(`${BACKEND_URL}/auth/login`, {
                login: username,
                password: password,
            }, {
                headers: {
                    'Content-Type': 'application/json',
                },
            });

            // Wyciągnięcie danych użytkownika z odpowiedzi backendu
            const { user, message } = response.data;

            // Ustawienie komunikatu powitalnego
            setWelcomeMessage(`Login successful. Welcome ${user.login}`);  // Dodajemy komunikat

            // Zapisz dane użytkownika w stanie aplikacji
            login(user);

            // Przekierowanie na stronę gier
            navigate('/games');
        } catch (error) {
            setErrorMessage(error.response?.data?.detail || "Login failed, please try again.");
            console.error('Login failed:', error.response?.data?.detail || error.message);
        }
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setCredentials((prev) => ({ ...prev, [name]: value }));
    };

    return (
        <div className="login-container">
            <div className="login-form">
                <h1>Log In</h1>
                {errorMessage && (
                    <div className="error-message">
                        {errorMessage}
                    </div>
                )}
                <input
                    type="text"
                    name="username"
                    value={credentials.username}
                    onChange={handleChange}
                    placeholder="Enter your username"
                    required
                />
                <input
                    type="password"
                    name="password"
                    value={credentials.password}
                    onChange={handleChange}
                    placeholder="Enter your password"
                    required
                />
                <button className="login-btn" onClick={handleLogin}>Log In</button>
                <h2>Don't have an account? <a href="/register">Register</a></h2>
            </div>
        </div>
    );
};

export default Login;