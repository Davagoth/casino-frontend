import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import './Games.css';

const Games = ({ user, welcomeMessage }) => {
    const navigate = useNavigate();

    const handleLogin = () => {
        navigate('/login');
    };

    if (!user) {
        return (
            <div className="games">
                <h1>Games</h1>
                <div className="login-message">
                    <p>You are not logged in. Please log in to play.</p>
                    <button className="cta-button" onClick={handleLogin}>
                        Login
                    </button>
                </div>
                <div className="game-card locked">Blackjack (Locked)</div>
                <div className="game-card locked">Roulette (Locked)</div>
                <div className="game-card locked">Slots (Locked)</div>
            </div>
        );
    }

    return (
        <div className="games">
            <h1>Games</h1>
            {welcomeMessage && <div className="welcome-message">{welcomeMessage}</div>} {/* Wyświetlamy komunikat */}
            <div className="games-list">
                <Link to="/games/blackjack" className="game-card">
                    Blackjack
                </Link>
                <Link to="/games/roulette" className="game-card">
                    Roulette
                </Link>
                <Link to="/games/slots" className="game-card">
                    Slots
                </Link>
            </div>
        </div>
    );
};

export default Games;