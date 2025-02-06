import React, { useState, useEffect } from 'react';
import './Profile.css';
import { useNavigate } from "react-router-dom";
import axios from 'axios';
import BACKEND_URL from '../config';

const Profile = ({ user, updateBalance, payBackFunds }) => {
    const [addAmount, setAddAmount] = useState("");
    const [payBackAmount, setPayBackAmount] = useState("");
    const [balance, setBalance] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [gameHistory, setGameHistory] = useState({
        Slots: [],
        Blackjack: [],
        Roulette: [],
    });
    const [expandedGame, setExpandedGame] = useState(null); // Przechowywanie rozwiniętej gry
    const [historyLimit, setHistoryLimit] = useState(20); // Początkowa liczba gier do załadowania
    const [showLoadMore, setShowLoadMore] = useState(false); // Kontrolowanie widoczności przycisku "Load More"
    const navigate = useNavigate();

    const handleLogin = () => {
        navigate('/login');
    };

    const fetchUserProfile = async () => {
        try {
            const response = await axios.get(`${BACKEND_URL}/auth/profile?login=${user.login}`);
            const { balance, email, login } = response.data;
            setBalance(balance);
        } catch (error) {
            console.error('Error fetching user profile:', error);
        } finally {
            setIsLoading(false);
        }
    };

    // Funkcje pobierające historię dla każdej gry
    const fetchSlotsHistory = async () => {
        try {
            const response = await axios.get(`${BACKEND_URL}/user/game-history/slots/${user.login}`);
            setGameHistory(prevState => ({ ...prevState, Slots: response.data }));
        } catch (error) {
            console.error('Error fetching Slots history:', error);
        }
    };

    const fetchBlackjackHistory = async () => {
        try {
            const response = await axios.get(`${BACKEND_URL}/user/game-history/blackjack/${user.login}`);
            setGameHistory(prevState => ({ ...prevState, Blackjack: response.data }));
        } catch (error) {
            console.error('Error fetching Blackjack history:', error);
        }
    };

    const fetchRouletteHistory = async () => {
        try {
            const response = await axios.get(`${BACKEND_URL}/user/game-history/roulette/${user.login}`);
            setGameHistory(prevState => ({ ...prevState, Roulette: response.data }));
        } catch (error) {
            console.error('Error fetching Roulette history:', error);
        }
    };

    const handleAddFunds = async () => {
        const amountToAdd = parseInt(addAmount, 10); // Parse as an integer
        if (!isNaN(amountToAdd) && amountToAdd > 0) {
            try {
                const response = await axios.post(`${BACKEND_URL}/auth/balance/add`, {
                    login: user.login,
                    amount: amountToAdd,
                }, {
                    headers: {
                        'Content-Type': 'application/json',
                    },
                });
                const { login, new_balance } = response.data;
                setBalance(new_balance);
                setAddAmount("");
            } catch (error) {
                alert(error.response?.data?.detail || "Failed to add funds, please try again.");
                console.error('Add funds failed:', error.response?.data?.detail || error.message);
            }
        } else {
            alert("Please enter a valid integer amount.");
        }
    };


    const handlePayBackFunds = async () => {
        const amountToPayBack = parseInt(payBackAmount, 10); // Parse as an integer

        if (isNaN(amountToPayBack) || amountToPayBack <= 0) {
            alert("Please enter a valid integer amount.");
            return;
        }

        if (amountToPayBack > balance) {
            alert("You cannot pay back more than your current balance.");
            return;
        }

        try {
            const response = await axios.post(`${BACKEND_URL}/auth/balance/remove`, {
                login: user.login,
                amount: amountToPayBack,
            }, {
                headers: {
                    'Content-Type': 'application/json',
                },
            });

            const { login, new_balance } = response.data;
            setBalance(new_balance);
            setPayBackAmount("");
        } catch (error) {
            alert(error.response?.data?.detail || "Failed to pay back funds, please try again.");
            console.error('Pay back funds failed:', error.response?.data?.detail || error.message);
        }
    };


    // Funkcja do rozwinięcia historii dla danej gry
    const toggleGameHistory = (gameName) => {
        if (expandedGame === gameName) {
            setExpandedGame(null);
        } else {
            setExpandedGame(gameName);
        }
    };

    const loadMoreHistory = () => {
        setHistoryLimit(prevLimit => prevLimit + 20); // Ładujemy kolejne 20 gier
    };

    // Funkcja, która sprawdza, czy przycisk "Load More" powinien być widoczny
    const checkShowLoadMore = () => {
        // Sprawdzamy, czy jakaś historia jest rozwinięta, oraz czy jest więcej niż 20 gier do załadowania
        const historyData = gameHistory[expandedGame];
        if (expandedGame && historyData?.length > historyLimit) {
            setShowLoadMore(true);
        } else {
            setShowLoadMore(false);
        }
    };

    // Sprawdzamy, czy każda gra ma historię
    const isHistoryEmpty = (gameName) => {
        return gameHistory[gameName]?.length === 0;
    };

    useEffect(() => {
        if (user && user.login) {
            fetchUserProfile();
            fetchSlotsHistory();
            fetchBlackjackHistory();
            fetchRouletteHistory();
        }
    }, [user]);

    useEffect(() => {
        checkShowLoadMore(); // Po każdej zmianie limitu gier sprawdzamy widoczność przycisku
    }, [historyLimit, gameHistory, expandedGame]); // Dodajemy `expandedGame` do zależności

    if (!user) {
        return (
            <div className="games">
                <h1>Profile</h1>
                <div className="login-message">
                    <p>You are not logged in. Please log in to see profile info.</p>
                    <button className="cta-button" onClick={handleLogin}>
                        Login
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="profile">
            <h1>Your Profile</h1>
            <div className="profile-details">
                <p><strong>Username:</strong> {user.login}</p>
                <p><strong>Email:</strong> {user.email}</p>

                {isLoading ? (
                    <p>Loading...</p>
                ) : (
                    <p><strong>Balance:</strong> ${balance.toFixed(2)}</p>
                )}
            </div>

            <div className="add-funds">
                <h3>Add Funds:</h3>
                <div className="funds-input">
                    <input
                        type="number"
                        value={addAmount}
                        onChange={(e) => setAddAmount(e.target.value)}
                        placeholder="Enter amount"
                        min="1"
                    />
                    <button onClick={handleAddFunds}>Add Funds</button>
                </div>
            </div>

            <div className="pay-back-funds">
                <h3>Pay Back Funds:</h3>
                <div className="funds-input">
                    <input
                        type="number"
                        value={payBackAmount}
                        onChange={(e) => setPayBackAmount(e.target.value)}
                        placeholder="Enter amount"
                        min="1"
                    />
                    <button onClick={handlePayBackFunds}>Pay Back Funds</button>
                </div>
            </div>

            <div className="game-history">
                <h3>Game History:</h3>
                <div className="game-categories">
                    <button onClick={() => toggleGameHistory("Slots")}>
                        {expandedGame === "Slots" ? "Hide" : "Show"} Slots History
                    </button>
                    <button onClick={() => toggleGameHistory("Blackjack")}>
                        {expandedGame === "Blackjack" ? "Hide" : "Show"} Blackjack History
                    </button>
                    <button onClick={() => toggleGameHistory("Roulette")}>
                        {expandedGame === "Roulette" ? "Hide" : "Show"} Roulette History
                    </button>
                </div>

                {/* Historia gier dla Slotów */}
                {expandedGame === "Slots" && (
                    <div className="game-history-list">
                        {isHistoryEmpty("Slots") ? (
                            <p>No history available for Slots.</p>
                        ) : (
                            gameHistory["Slots"].slice(0, historyLimit).map((game, idx) => (
                                <div key={idx} className="game-history-item">
                                    <strong>{game.result}</strong> - Bet: ${game.bet_amount}, Payout: ${game.payout}
                                    <br/>
                                    Played at: {new Date(game.timestamp).toLocaleString()}
                                </div>
                            ))
                        )}
                    </div>
                )}

                {/* Historia gier dla Blackjacka */}
                {expandedGame === "Blackjack" && (
                    <div className="game-history-list">
                        {isHistoryEmpty("Blackjack") ? (
                            <p>No history available for Blackjack.</p>
                        ) : (
                            gameHistory["Blackjack"].slice(0, historyLimit).map((game, idx) => (
                                <div key={idx} className="game-history-item">
                                    <strong>{game.result}</strong> - Bet: ${game.bet_amount}, Payout: ${game.payout}
                                    <br/>
                                    Played at: {new Date(game.timestamp).toLocaleString()}
                                </div>
                            ))
                        )}
                    </div>
                )}

                {/* Historia gier dla Ruletki */}
                {expandedGame === "Roulette" && (
                    <div className="game-history-list">
                        {isHistoryEmpty("Roulette") ? (
                            <p>No history available for Roulette.</p>
                        ) : (
                            gameHistory["Roulette"].slice(0, historyLimit).map((game, idx) => (
                                <div key={idx} className="game-history-item">
                                    <strong>{game.result}</strong> - Bet: ${game.bet_amount}, Payout: ${game.payout}
                                    <br/>
                                    Played at: {new Date(game.timestamp).toLocaleString()}
                                </div>
                            ))
                        )}
                    </div>
                )}

                {/* Przyciski "Load More" */}
                {showLoadMore && (
                    <button onClick={loadMoreHistory}>Load More</button>
                )}
            </div>
        </div>
    );
};

export default Profile;