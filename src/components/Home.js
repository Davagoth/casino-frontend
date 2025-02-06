import React from 'react';
import { useNavigate } from 'react-router-dom';
import './Home.css';

const Home = () => {
    const navigate = useNavigate();

    const handleStartPlaying = () => {
        navigate('/games');
    };

    return (
        <div className="home">
            <div className="content">
                <h1>Welcome to the Casino!</h1>
                <p>Play exciting games and win big!</p>
                <button className="cta-button" onClick={handleStartPlaying}>
                    Start Playing
                </button>
            </div>
        </div>
    );
};

export default Home;
