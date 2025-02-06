import React, { useState, useEffect } from "react";
import "./Slots.css";
import axios from "axios";
import confetti from "canvas-confetti";
import BACKEND_URL from '../../config';

const symbols = ["🍊", "🍒", "🍋", "🍉", "🍇", "🍓", "🍌", "⭐", "🍐", "🥕", "🍆", "🍍", "🍎", "🍑", "🥝", "🔔"];

const Slots = ({ user, setIsGameActive }) => {
    const [reels, setReels] = useState([["🍒", "🍒", "🍒"], ["🍒", "🍒", "🍒"], ["🍒", "🍒", "🍒"]]);
    const [message, setMessage] = useState("");
    const [messageClass, setMessageClass] = useState("");
    const [balance, setBalance] = useState(0);
    const [bet, setBet] = useState(0);
    const [gameActive, setGameActive] = useState(false);
    const [isLoading, setIsLoading] = useState(true);

    const audioSpin = new Audio("/roulette-audio.mp3");
    const audioWin = new Audio("/win-sound.mp3");
    const audioLose = new Audio("/lose-sound.mp3");
    const audioJackpot = new Audio("/jackpot-sound.mp3");

    // Fetch initial balance from the backend
    const fetchUserProfile = async () => {
        setIsLoading(true);
        try {
            const response = await axios.get(`${BACKEND_URL}/auth/profile?login=${user.login}`);
            setBalance(response.data.balance);
        } catch (error) {
            console.error("Error fetching balance:", error);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchUserProfile();
    }, [user.login]);

    const spinReels = async () => {
        try {
            // Send request to the backend
            const response = await axios.post(`${BACKEND_URL}/games/slots/spin`,
                {
                    login: user.login,
                    bet,
                },
                {
                    headers: {
                        "Content-Type": "application/json",
                    },
                }
            );
            setGameActive(true);
            setIsGameActive(true);
            setMessage("");
            setMessageClass("");
            audioSpin.play();

            const { reels, winnings, message, message_class } = response.data;

            // Display randomly changing symbols before stopping
            const animationInterval = setInterval(() => {
                setReels([
                    Array(3).fill(null).map(() => symbols[Math.floor(Math.random() * symbols.length)]),
                    Array(3).fill(null).map(() => symbols[Math.floor(Math.random() * symbols.length)]),
                    Array(3).fill(null).map(() => symbols[Math.floor(Math.random() * symbols.length)]),
                ]);
            }, 100);

            // Stop animation and set the result
            setTimeout(() => {
                clearInterval(animationInterval);
                setReels(reels);
                setMessage(message);
                setMessageClass(message_class);

                if (message_class === "jackpot") {
                    confetti({
                        particleCount: 200,
                        spread: 70,
                        origin: { y: 0.6 },
                    });
                    audioJackpot.play();
                }

                if (message_class === "win") {
                    audioWin.play();
                }

                if (message_class === "lose") {
                    audioLose.play();
                }
                fetchUserProfile();
                setIsGameActive(false);
                setGameActive(false);
            }, 5000); // 5 seconds animation
        } catch (error) {
            console.error("Error spinning slots:", error);
            if (error.response) {
                const errorDetails = error.response.data.detail;

                if (Array.isArray(errorDetails)) { // Check if it's an array
                    const errorMessages = errorDetails.map(err => err.msg).join(" | "); // Join errors
                    setMessage(errorMessages);
                } else if (typeof errorDetails === 'object' && errorDetails !== null) { // Check if it's an object (e.g., Pydantic ValidationError)
                    const errorMessages = Object.values(errorDetails).join(" | "); // Join error values
                    setMessage(errorMessages);
                } else {
                    setMessage(errorDetails); // If it's a single message (string), display it
                }
                setMessageClass("warning");
            } else {
                setMessage("An error occurred. Please try again.");
                setMessageClass("warning");
            }
        }
    };

    return (
        <div className="slots">
            <h1>Slots</h1>
            <p className="instruction">
                Spin the reels and match symbols to win big! Will you hit the jackpot?
            </p>
            {isLoading ? (
                <p>Loading...</p>
            ) : (
                <p className="balance">Balance: ${balance}</p>
            )}
            <div className="bet-section">
                Bet Amount:
                <input
                    type="number"
                    value={bet}
                    onChange={(e) => setBet(Number(e.target.value))}
                    disabled={gameActive}
                />
                <button onClick={spinReels} disabled={gameActive}>
                    {gameActive ? "Spinning..." : "Spin"}
                </button>
            </div>
            <div className={`reels ${gameActive ? "spinning" : ""}`}>
                {reels && reels.length > 0 ? (
                    reels.map((row, rowIndex) => (
                        <div key={rowIndex} className="reel-row">
                            {row && row.map((symbol, index) => (
                                <div key={index} className={`reel ${rowIndex === 1 ? "chosen" : "not-chosen"}`}>
                                    {symbol}
                                </div>
                            ))}
                        </div>
                    ))
                ) : (
                    <p className="error">Reels data is missing!</p>
                )}
            </div>
            {message && <p className={`message ${messageClass}`}>{message}</p>}
        </div>
    );
};

export default Slots;