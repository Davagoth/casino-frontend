import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import "./Register.css";
import BACKEND_URL from '../config';

const Register = () => {
    const [credentials, setCredentials] = useState({
        login: "",
        email: "",
        password: "",
    });
    const [message, setMessage] = useState("");
    const navigate = useNavigate();

    const handleRegister = async (e) => {
        e.preventDefault();
        try {
            const response = await axios.post(`${BACKEND_URL}/auth/register`, credentials);
            setMessage(response.data.message || "Registration successful!");
            navigate("/games");
        } catch (error) {
            if (error.response) {
                const details = error.response.data.detail;

                // Jeśli serwer zwrócił tablicę błędów, łączymy je w jedną wiadomość
                if (Array.isArray(details)) {
                    const errorMessages = details.map((err) => err.msg).join(" | ");
                    setMessage(errorMessages);
                } else {
                    setMessage(details || "Registration failed.");
                }
            } else {
                setMessage("An error occurred. Please try again.");
            }
        }
    };


    const handleChange = (e) => {
        const { name, value } = e.target;
        setCredentials((prev) => ({ ...prev, [name]: value }));
    };

    return (
        <div className="register">
            <h1>Create an Account</h1>
            <form onSubmit={handleRegister}>
                <input
                    type="text"
                    name="login"
                    value={credentials.login}
                    onChange={handleChange}
                    placeholder="Choose a username"
                    required
                />
                <input
                    type="email"
                    name="email"
                    value={credentials.email}
                    onChange={handleChange}
                    placeholder="Enter your email"
                    required
                />
                <input
                    type="password"
                    name="password"
                    value={credentials.password}
                    onChange={handleChange}
                    placeholder="Choose a password"
                    required
                />
                <button type="submit" className="register-btn">
                    Register
                </button>
            </form>
            {message && <p className="message">{message}</p>}
            <h2>
                Already have an account? <a href="/login">Log In</a>
            </h2>
        </div>
    );
};

export default Register;
