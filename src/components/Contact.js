import React, { useState } from "react";
import "./Contact.css";

const Contact = () => {
    const [formData, setFormData] = useState({
        name: "",
        email: "",
        subject: "",
        message: "",
    });

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData((prevData) => ({
            ...prevData,
            [name]: value,
        }));
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        alert(`Thank you for contacting us, ${formData.name}!`);
        // Optionally, send the form data to a backend server.
        setFormData({ name: "", email: "", subject: "", message: "" });
    };

    return (
        <div className="contact">
            <h1>Contact Us</h1>
            <p>We’d love to hear from you. Please fill out the form below:</p>
            <form onSubmit={handleSubmit}>
                <label>Name:</label>
                <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    placeholder="Your name"
                    required
                />

                <label>Email:</label>
                <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    placeholder="Your email"
                    required
                />

                <label>Subject:</label>
                <select
                    name="subject"
                    value={formData.subject}
                    onChange={handleChange}
                    required
                >
                    <option value="">Choose a subject</option>
                    <option value="General Inquiry">General Inquiry</option>
                    <option value="Support">Support</option>
                    <option value="Feedback">Feedback</option>
                </select>

                <label>Message:</label>
                <textarea
                    name="message"
                    value={formData.message}
                    onChange={handleChange}
                    placeholder="Your message"
                    rows="5"
                    required
                ></textarea>

                <button type="submit">Submit</button>
            </form>
        </div>
    );
};

export default Contact;
