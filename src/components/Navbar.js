import React from 'react';
import { Link } from 'react-router-dom';
import './Navbar.css';

const Navbar = ({ user, logout, isDisabled }) => {
    return (
        <nav className={`navbar ${isDisabled ? "disabled" : ""}`}>
            <h1>Casino</h1>
            <ul className="nav-links">
                <li>
                    <Link to="/" className={isDisabled ? "disabled-link" : "nav-link"}>
                        Home
                    </Link>
                </li>
                <li>
                    <Link to="/games" className={isDisabled ? "disabled-link" : "nav-link"}>
                        Games
                    </Link>
                </li>
                <li>
                    <Link to="/profile" className={isDisabled ? "disabled-link" : "nav-link"}>
                        Profile
                    </Link>
                </li>
                <li>
                    <Link to="/contact" className={isDisabled ? "disabled-link" : "nav-link"}>
                        Contact
                    </Link>
                </li>
                {user ? (
                    <li>
                        <button className="logout-btn" onClick={logout}>Log Out</button>
                    </li>
                ) : (
                    <li>
                        <Link to="/login" className="nav-link login-btn">Log In</Link>
                    </li>
                )}
            </ul>
        </nav>
    );
};

export default Navbar;