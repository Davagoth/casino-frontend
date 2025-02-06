import React, { useState, useEffect } from "react";
import "./Roulette.css";
import axios from "axios";
import confetti from "canvas-confetti";
import BACKEND_URL from '../../config';

const Roulette = ({ user, setIsGameActive }) => {
    const [balance, setBalance] = useState(null);
    const [bet, setBet] = useState(0);
    const [betType, setBetType] = useState("color");
    const [betValue, setBetValue] = useState("red");
    const [message, setMessage] = useState("");
    const [messageClass, setMessageClass] = useState("");
    const [gameActive, setGameActive] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const [spinStarted, setSpinStarted] = useState(false);
    const [lastResult, setLastResult] = useState(null);
    const [lastRotation, setLastRotation] = useState(0);

    const audioSpin = new Audio("/roulette-audio.mp3");
    const audioWin = new Audio("/win-sound.mp3");
    const audioLose = new Audio("/lose-sound.mp3");

    const fetchUserProfile = async () => {
        setIsLoading(true);
        try {
            const response = await axios.get(
                `${BACKEND_URL}/auth/profile?login=${user.login}`
            );
            const { balance } = response.data;
            setBalance(balance);
        } catch (error) {
            console.error("Error fetching user profile:", error);
        } finally {
            setIsLoading(false);
        }
    };

    const startGame = async () => {
        setGameActive(true);
        setMessage("");
        setMessageClass("");
        setBalance(null);

        await fetchUserProfile();
    };

    const spinWheel = async () => {
        // Pobierz wynik z backendu
        try {
            const response = await axios.post(
                `${BACKEND_URL}/games/roulette`,
                {
                    login: user.login,
                    bet_type: betType,
                    bet_value: betValue,
                    bet_amount: bet,
                },
                {
                    headers: {
                        "Content-Type": "application/json",
                    },
                }
            );

            setMessage("");
            setMessageClass("");
            setIsGameActive(true);
            setSpinStarted(true);
            audioSpin.play();

            const spinAnimation = document.querySelector(".wheel");

            const { result, color, payout } = response.data;

            // Oblicz kąt zatrzymania: 3 pełne obroty (1080 stopni) + numer (result)
            const anglePerNumber = 360 / 37; // Jeden numer to 360/37 stopni
            const threeFullRotations = 3 * 360; // 3 pełne obroty (1080 stopni)

            let currentRotation = 0;

            // Jeśli to pierwszy obrót, zaczynamy od kąta 0
            if (lastResult === null) {
                currentRotation = threeFullRotations + result * anglePerNumber;
            } else {
                // Oblicz różnicę kątów między poprzednim numerem a nowym
                const angleDifference = (result - lastResult) * anglePerNumber;
                currentRotation = lastRotation + threeFullRotations + angleDifference;
            }

            // Przywrócenie animacji do kolejnych obrotów
            spinAnimation.style.transition = "transform 4s ease-out"; // Płynna animacja 4 sekundy
            spinAnimation.style.transform = `rotate(-${currentRotation}deg)`; // Obrót koła w lewo o zadany kąt

            // Po zakończeniu animacji (po 4 sekundach)
            setTimeout(() => {
                // Po zakończeniu animacji ustawimy transformację bez przejścia, żeby nie było dalszego ruchu
                spinAnimation.style.transition = "none"; // Wyłączamy animację
                spinAnimation.style.transform = `rotate(-${currentRotation}deg)`; // Koło zatrzymuje się w odpowiednim miejscu

                let winnings = payout;
                if (winnings > 0) {
                    setBalance((prevBalance) => prevBalance + winnings);
                    setMessage(`You won $${winnings}! The ball landed on ${color} ${result}.`);
                    setMessageClass('won');  // Add class for winning message
                    audioWin.play();
                    confetti({
                        particleCount: 200,
                        spread: 70,
                        origin: { y: 0.6 },
                    });
                } else {
                    setMessage(`You lost! The ball landed on ${color} ${result}.`);
                    setMessageClass('lost');  // Add class for losing message
                    audioLose.play();
                }

                // Zapisz ostatni wynik
                setLastResult(result);
                setLastRotation(currentRotation);

                fetchUserProfile(); // Zaktualizuj saldo
                setSpinStarted(false); // Kończymy obrót
                setIsGameActive(false);
            }, 4000); // Czas animacji = 4 sekundy (3 pełne obroty + zatrzymanie na numerze)
        } catch (error) {
            console.error("Spin failed:", error.response?.data?.detail || error.message);
            setSpinStarted(false);
            setIsGameActive(false);

            if (error.response && error.response.data && error.response.data.detail) {
                let errorMessage = error.response.data.detail;

                if (Array.isArray(errorMessage)) {
                    errorMessage = errorMessage.map(err => err.msg).join(" | ");
                } else if (typeof errorMessage === 'object' && errorMessage !== null) {
                    errorMessage = Object.values(errorMessage).join(" | ");
                }

                setMessage(errorMessage);
                setMessageClass("warning");

            } else {
                setMessage("Failed to process the spin, please try again.");
                setMessageClass("warning");
            }
        }
    };

    const getWheelNumbers = () => {
        const numbers = [];
        const totalNumbers = 37; // 37 numerów w kole ruletki (0-36)
        const radius = 155; // Promień koła
        const centerX = 170; // Środek koła (w poziomie)
        const centerY = 170; // Środek koła (w pionie)
        const colors = [
            "green", // 0
            "red", "black", "red", "black", "red", "black", "red", "black", "red", "black",
            "red", "black", "red", "black", "red", "black", "red", "black", "red", "black",
            "red", "black", "red", "black", "red", "black", "red", "black", "red", "black",
            "red", "black", "red", "black", "red", "black", "red", "black", "red", "black"
        ];

        for (let i = 0; i < totalNumbers; i++) {
            const angle = (i * 360) / totalNumbers - 90; // Ustawienie 0 na górze
            const x = centerX + radius * Math.cos((angle * Math.PI) / 180);
            const y = centerY + radius * Math.sin((angle * Math.PI) / 180);
            const color = colors[i];
            numbers.push({ number: i, x, y, color });
        }

        return numbers;
    };

    useEffect(() => {
        fetchUserProfile();
    }, [user.login]);

    return (
        <div className="roulette">
            <h1>Roulette</h1>
            <p>Place your bets on numbers, colors, or ranges and spin the wheel! Will luck be on your side?</p>
            {!gameActive ? (
                <button onClick={startGame}>Play Game</button>
            ) : (
                <>
                    {isLoading ? (
                        <p>Loading...</p>
                    ) : (
                        <p>Balance: ${balance}</p>
                    )}
                    <div className="bet-section">
                        <label>
                            Bet Amount:
                            <input
                                type="number"
                                value={bet}
                                onChange={(e) => {
                                    const value = Number(e.target.value);
                                    setBet(value);
                                    setMessage("");
                                }}
                                disabled={spinStarted}
                            />
                        </label>
                        <label>
                            Bet Type:
                            <select
                                value={betType}
                                onChange={e => {
                                    setBetType(e.target.value);
                                    setBetValue(
                                        e.target.value === "color"
                                            ? "red"
                                            : e.target.value === "range"
                                                ? "1-18"
                                                : ""
                                    );
                                }}
                            >
                                <option value="color">Color</option>
                                <option value="number">Number</option>
                                <option value="range">Range</option>
                            </select>
                        </label>
                        {betType === "color" && (
                            <label>
                                Color:
                                <select value={betValue} onChange={(e) => setBetValue(e.target.value)}>
                                    <option value="red">Red</option>
                                    <option value="black">Black</option>
                                    <option value="green">Green</option>
                                </select>
                            </label>
                        )}
                        {betType === "number" && (
                            <label>
                                Number:
                                <input
                                    type="number"
                                    min="0"
                                    max="36"
                                    value={betValue}
                                    onChange={(e) => setBetValue(e.target.value)}
                                    disabled={spinStarted}
                                />
                            </label>
                        )}
                        {betType === "range" && (
                            <label>
                                Range:
                                <select value={betValue} onChange={(e) => setBetValue(e.target.value)}>
                                    <option value="1-18">1-18</option>
                                    <option value="19-36">19-36</option>
                                </select>
                            </label>
                        )}
                        <button onClick={spinWheel} disabled={spinStarted}
                                className={spinStarted ? 'disabled' : ''}>Spin
                        </button>
                    </div>

                    <div className="wheel-container">
                        <div className="wheel-pointer">
                            {/* Wskaźnik */}
                        </div>
                        <div className="wheel">
                            {getWheelNumbers().map((num, index) => (
                                <div
                                    key={index}
                                    className={`wheel-number ${num.color}`} // Kolor numeru
                                    style={{
                                        left: `${num.x}px`,
                                        top: `${num.y}px`,
                                        transform: `translate(-50%, -50%)`
                                    }}
                                >
                                    {num.number}
                                </div>
                            ))}
                        </div>
                    </div>

                    {message && (
                        <p className={`message ${messageClass}`}>{message}</p>
                    )}
                </>
            )}
        </div>
    );
};

export default Roulette;