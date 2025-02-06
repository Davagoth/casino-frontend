import React, { useState, useEffect } from "react";
import "./Blackjack.css";
import axios from "axios";
import BACKEND_URL from '../../config';

const Blackjack = ({ user, setIsGameActive }) => {
    const [deck, setDeck] = useState([]);
    const [playerHand, setPlayerHand] = useState([]);
    const [dealerHand, setDealerHand] = useState([]);
    const [balance, setBalance] = useState(0);
    const [bet, setBet] = useState(0);
    const [message, setMessage] = useState("");
    const [gameActive, setGameActive] = useState(false);
    const [isAnimating, setIsAnimating] = useState(false);
    const [isLoading, setIsLoading] = useState(true);

    const audioWin = new Audio("/win-sound.mp3");
    const audioLose = new Audio("/lose-sound.mp3");

    // Fetch user balance on game start or when user changes
    const fetchUserProfile = async () => {
        setIsLoading(true);
        try {
            const response = await axios.get(
                `${BACKEND_URL}/auth/profile?login=${user.login}`
            );
            const { balance } = response.data;
            setBalance(balance); // Update balance based on the user's profile
        } catch (error) {
            console.error("Error fetching user profile:", error);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchUserProfile();
    }, [user.login]);

    const createDeck = () => {
        const suits = ["♠", "♥", "♦", "♣"];
        const values = ["2", "3", "4", "5", "6", "7", "8", "9", "10", "J", "Q", "K", "A"];
        const newDeck = [];
        suits.forEach(suit => {
            values.forEach(value => {
                newDeck.push({ suit, value });
            });
        });
        return newDeck;
    };

    const shuffleDeck = (deck) => {
        for (let i = deck.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [deck[i], deck[j]] = [deck[j], deck[i]];
        }
        return deck;
    };

    const calculateHandValue = (hand) => {
        let value = 0;
        let aces = 0;
        hand.forEach(card => {
            if (card.value === "A") {
                value += 11;
                aces += 1;
            } else if (["K", "Q", "J"].includes(card.value)) {
                value += 10;
            } else {
                value += parseInt(card.value);
            }
        });

        while (value > 21 && aces > 0) {
            value -= 10;
            aces -= 1;
        }
        return value;
    };

    const formatHand = (hand) => {
        return hand.map(card => {
            const [rank, suit] = card.split(" of ");
            const value = getCardValue(rank);  // Obliczamy wartość karty na podstawie rank
            return { rank, suit, value, animate: false };  // Dodajemy wartość karty
        });
    };

    const getCardValue = (rank) => {
        if (["J", "Q", "K"].includes(rank)) {
            return 10;
        } else if (rank === "A") {
            return 11; // Można później obsłużyć logikę z "A" jako 1, jeśli potrzebujesz
        } else {
            return parseInt(rank); // Konwersja numerów kart na liczbę
        }
    };


    const startGame = async () => {
        try {
            const response = await axios.post(`${BACKEND_URL}/games/blackjack/bet`, {
                login: user.login,
                bet_amount: bet
            });

            const { result, player_hand, player_score, dealer_hand, dealer_score } = response.data;

            const formattedPlayerHand = formatHand(player_hand);
            const formattedDealerHand = formatHand(dealer_hand);

            setPlayerHand([formattedPlayerHand[0]]);
            setDealerHand([formattedDealerHand[0]]); // Jedna karta dealera zakryta
            setMessage(result);  // Można dostosować komunikaty
            setBalance(balance - bet);
            setGameActive(true);
            setIsGameActive(true);

            // Opóźnienia na pokazanie kolejnych kart
            setTimeout(() => {
                setPlayerHand([formattedPlayerHand[0], formattedPlayerHand[1]]);
            }, 1000);  // Druga karta gracza po 1 sekundy

            setTimeout(() => {
                setDealerHand([formattedDealerHand[0], formattedDealerHand[1]]); // Druga karta dealera po 2 sekundy
            }, 2000);
        } catch (error) {
            console.error("Error starting game:", error);
            if (error.response && error.response.data && error.response.data.detail) {
                let errorMessage = error.response.data.detail;

                if (Array.isArray(errorMessage)) {
                    errorMessage = errorMessage.map(err => err.msg).join(" | ");
                } else if (typeof errorMessage === 'object' && errorMessage !== null) {
                    errorMessage = Object.values(errorMessage).join(" | ");
                }

                setMessage(errorMessage);

            } else {
                setMessage("Failed to start game. Please try again later.");
            }
        }
    };

    const hit = async () => {
        if (!gameActive) return;

        try {
            // Sprawdzamy, co dokładnie wysyłamy
            const playerHandObjects = playerHand.map(card => ({
                rank: card.rank,
                suit: card.suit,
                value: Number(card.rank)  // Dodajemy wartość karty
            }));

            const dealerHandObjects = dealerHand.map(card => ({
                rank: card.rank,
                suit: card.suit,
                value: Number(card.rank)  // Dodajemy wartość karty
            }));


            const response = await axios.post(`${BACKEND_URL}/games/blackjack/action`, {
                action: "hit",
                login: user.login,
                player_hand: playerHand.map(card => ({
                    rank: card.rank,
                    suit: card.suit,
                    value: Number(card.value)
                })),  // Wysyłamy pełne obiekty kart z wartością
                dealer_hand: dealerHand.map(card => ({
                    rank: card.rank,
                    suit: card.suit,
                    value: Number(card.value)
                })),
                bet_amount: bet
            });

            const { player_hand, player_score, result, result_message } = response.data;

            // Konwertowanie kart z powrotem do formatu do wyświetlenia
            setPlayerHand(formatHand(player_hand));
            setMessage(result_message);

            if (player_score > 21) {
                setGameActive(false); // Koniec gry
                setIsGameActive(false); // Odblokowuje pasek na górze
            }



        } catch (error) {
            console.error("Error hitting:", error);
            if (error.response && error.response.data && error.response.data.detail) {
                let errorMessage = error.response.data.detail;

                if (Array.isArray(errorMessage)) {
                    errorMessage = errorMessage.map(err => err.msg).join(" | ");
                } else if (typeof errorMessage === 'object' && errorMessage !== null) {
                    errorMessage = Object.values(errorMessage).join(" | ");
                }

                setMessage(errorMessage);

            } else {
                setMessage("Failed to hit. Please try again later.");
            }
        }
    };


    const stand = async () => {
        if (!gameActive) return;

        try {
            const response = await axios.post(`${BACKEND_URL}/games/blackjack/action`, {
                action: "stand",
                login: user.login,
                player_hand: playerHand,  // Wysyłamy pełne obiekty kart
                dealer_hand: dealerHand,
                bet_amount: bet
            });

            const { player_hand, dealer_hand, player_score, dealer_score, result, result_message } = response.data;

            // Konwertowanie kart z formatu string (np. "10 of ♠") na obiekt { rank, suit }
            setPlayerHand(formatHand(player_hand));
            setDealerHand(formatHand(dealer_hand));
            setMessage(result_message);

            if (result === "win") {
                setBalance(balance + bet * 2);
                audioWin.play();
            } else if (result === "bust" || result === "lose") {
                setBalance(balance - bet);
                audioLose.play();
            }

            if (result === "win" || result === "bust" || result === "lose") {
                setGameActive(false);
                setIsGameActive(false); // Odblokowuje pasek na górze
            }

        } catch (error) {
            console.error("Error standing:", error);
            if (error.response && error.response.data && error.response.data.detail) {
                let errorMessage = error.response.data.detail;

                if (Array.isArray(errorMessage)) {
                    errorMessage = errorMessage.map(err => err.msg).join(" | ");
                } else if (typeof errorMessage === 'object' && errorMessage !== null) {
                    errorMessage = Object.values(errorMessage).join(" | ");
                }

                setMessage(errorMessage);

            } else {
                setMessage("Failed to stand. Please try again later.");
            }
        }
    };

    return (
        <div className="blackjack">
            <h1>Blackjack</h1>
            <p>Try your luck in Blackjack! Aim for a hand value of 21 without going over. Can you beat the dealer?</p>
            {!gameActive && <button onClick={startGame}>Start New Game</button>}
            <div className="game-container">
                <div className="bet-section">
                    {isLoading ? (
                        <p>Loading...</p>
                    ) : (
                        <p>Balance: ${balance}</p>
                    )}
                    <label>
                        Bet Amount:
                        <input
                            type="number"
                            value={bet}
                            onChange={(e) => {
                                const value = Number(e.target.value);
                                setBet(value);
                                setMessage("");  // Clear any previous messages
                            }}
                            disabled={gameActive}
                        />
                    </label>
                </div>
                <div className="hand">
                    <h2>Dealer's Hand</h2>
                    <div className="cards">
                        {dealerHand.map((card, index) => (
                            <div
                                key={index}
                                className={`card ${card.animate ? "animate-card" : ""}`}
                            >
                            {index === 0 && gameActive ? "??" : `${card.rank} ${card.suit}`} {/* Pierwsza karta zasłonięta przez całą grę */}
                            </div>
                        ))}
                    </div>
                    {gameActive ? (
                        <p>Total: {calculateHandValue(dealerHand.slice(1))}
                            +{/* Suma tylko od drugiej karty */}
                        </p>
                    ) : (
                        <p>Total: {calculateHandValue(dealerHand)} {/* Suma wszystkich kart, po odkryciu karty dealera */}
                        </p>
                    )}
                </div>
                <div className="hand">
                    <h2>Your Hand</h2>
                    <div className="cards">
                        {playerHand.map((card, index) => (
                            <div
                                key={index}
                                className={`card ${card.animate ? "animate-card" : ""}`}
                            >
                                {card.rank} {card.suit} {/* Pokazujemy wszystkie karty gracza */}
                            </div>
                        ))}
                    </div>
                    <p>Total: {calculateHandValue(playerHand)}</p>
                </div>

            </div>
            {gameActive && (
                <div className="controls">
                    <button onClick={hit} disabled={isAnimating}>Hit</button>
                    <button onClick={stand} disabled={isAnimating}>Stand</button>
                </div>
            )}
            {!gameActive && message && (
                <p className={`message ${message.toLowerCase().replace(/\s/g, "-")}`}>
                    {message}
                </p>
            )}
        </div>
    );
};

export default Blackjack;
