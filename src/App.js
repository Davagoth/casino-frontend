import React, { useState } from "react";
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import { Navigate } from "react-router-dom";
import Contact from "./components/Contact";
import Games from "./components/Games";
import Home from "./components/Home";
import Navbar from "./components/Navbar";
import Blackjack from "./components/games/Blackjack";
import Roulette from "./components/games/Roulette";
import Slots from "./components/games/Slots";
import Profile from "./components/Profile";
import Login from "./components/Login";
import Register from "./components/Register";

const App = () => {
    const [user, setUser] = useState(null);
    const [welcomeMessage, setWelcomeMessage] = useState("");
    const [isGameActive, setIsGameActive] = useState(false);

    const login = (userData) => {
        setUser({ ...userData });
    };

    const register = (username) => {
        setUser({ username, balance: 0 });
    };

    const logout = () => {
        setUser(null);
        setWelcomeMessage("");
    };

    const updateBalance = (amount) => {
        if (user) {
            setUser((prevUser) => ({
                ...prevUser,
                balance: prevUser.balance + amount,
            }));
        }
    };

    const payBackFunds = (amount) => {
        if (user) {
            setUser((prevUser) => {
                const newBalance = prevUser.balance - amount;
                return {
                    ...prevUser,
                    balance: newBalance >= 0 ? newBalance : 0,
                };
            });
        }
    };

    return (
        <Router>
            <Navbar user={user} logout={logout} isDisabled={isGameActive} />
            <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/contact" element={<Contact />} />
                <Route path="/profile" element={<Profile user={user} updateBalance={updateBalance} payBackFunds={payBackFunds} />} />
                <Route path="/games" element={<Games user={user} welcomeMessage={welcomeMessage} />} />
                <Route path="/games/blackjack" element={user ? <Blackjack user={user} setIsGameActive={setIsGameActive} /> : <Navigate to="/games" />} />
                <Route path="/games/roulette" element={user ? <Roulette user={user} setIsGameActive={setIsGameActive} /> : <Navigate to="/games" />} />
                <Route path="/games/slots" element={user ? <Slots user={user} setIsGameActive={setIsGameActive} /> : <Navigate to="/games" />} />
                <Route path="/login" element={<Login login={login} setWelcomeMessage={setWelcomeMessage} />} />
                <Route path="/register" element={<Register register={register} />} />
            </Routes>
        </Router>
    );
};

export default App;