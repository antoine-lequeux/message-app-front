import React, { useState, useEffect } from 'react';
import feather from 'feather-icons';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import ThemeToggle from './theme_toggle';

// Composant qui permet d'afficher la page de création de compte.
function Signup() {
    const [form, setForm] = useState({
        firstName: '',
        lastName: '',
        mail: '',
        password: '',
        avatar: '',
        admin: 'false'
    });

    const [passwordConditions, setPasswordConditions] = useState({
        length: false,
        uppercase: false,
        digit: false,
        special: false,
    });

    const [passwordValid, setPasswordValid] = useState(false);
    const [rulesVisible, setRulesVisible] = useState(false);
    const [errorMessage, setErrorMessage] = useState('');

    const navigate = useNavigate();

    // Affiche les icônes feather.
    useEffect(() => {
        feather.replace();
    }, []);

    // Validation des critères de mots de passe
    const validatePassword = (password) => {
        const cond = {
            length: password.length >= 15,
            uppercase: /[A-Z]/.test(password),
            digit: (password.match(/[0-9]/g) || []).length >= 3,
            special: (password.match(/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/g) || []).length >= 2,
        };

        setPasswordValid(Object.values(cond).every(Boolean));
        setPasswordConditions(cond);
        setRulesVisible(password.length > 0);
    };


    const handleFileChange = (file) => {
        const reader = new FileReader();
        reader.onloadend = () => {
            const base64 = reader.result.split(',')[1]; // Retire le préfixe data:image/...
            setForm(prev => ({ ...prev, avatar: base64 }));
        };
        reader.readAsDataURL(file);
    };

    // Création de l'utilisateur
    const handleSubmit = (e) => {
        e.preventDefault();
        setErrorMessage('');

        const user = {
            firstName: form.firstName,
            lastName: form.lastName,
            mail: form.mail,
            password: form.password,
            admin: false,
            avatarBase64: form.avatar !== '' ? form.avatar : null
        };

        // Envoie le formulaire à l'API pour créer l'utilisateur.
        axios.post("http://localhost:8080/api/users/self-signup", user, {
            withCredentials: true,
            headers: { 'Content-Type': 'application/json' }
        })
            .then((response) => {
                const savedUser = response.data;
                // Ajoute les données de l'utilisateur au stockage du navigateur.
                localStorage.setItem('user', JSON.stringify(savedUser));
                navigate('/home');
            })
            .catch(error => {
                console.error('Erreur :', error);
                // On affiche le message d'erreur renvoyé par l'API.
                if (error.response?.data?.message) {
                    setErrorMessage(error.response.data.message);
                } else {
                    setErrorMessage("Une erreur est survenue. Veuillez réessayer.");
                }
            });
    };

    return (
        <div className="centered-layout">
            <ThemeToggle />

            <div className="card card--narrow">
                <div className="header-bar">
                    <h2>Créer un compte</h2>
                    <button
                        className="return-icon back-icon"
                        title="Retour"
                        onClick={() => navigate('/login')}
                    >
                        <i data-feather="arrow-right" />
                    </button>
                </div>

                {/*Formulaire de création*/}
                <form onSubmit={handleSubmit} className="user-form">
                    {/*Message d'erreur optionnel*/}
                    {errorMessage && (
                        <div className="form-error">
                            <p style={{ color: 'red' }}>{errorMessage}</p>
                        </div>
                    )}

                    <div className="form-group">
                        <label>Prénom :</label>
                        <input
                            type="text"
                            required
                            onChange={(e) => setForm({ ...form, firstName: e.target.value })}
                        />
                    </div>

                    <div className="form-group">
                        <label>Nom :</label>
                        <input
                            type="text"
                            required
                            onChange={(e) => setForm({ ...form, lastName: e.target.value })}
                        />
                    </div>

                    <div className="form-group">
                        <label>Email :</label>
                        <input
                            type="email"
                            required
                            onChange={(e) => setForm({ ...form, mail: e.target.value })}
                        />
                    </div>

                    <div className="form-group">
                        <label>Mot de passe :</label>
                        <input
                            type="password"
                            required
                            onChange={(e) => {
                                setForm({ ...form, password: e.target.value });
                                validatePassword(e.target.value);
                            }}
                        />
                    </div>

                    <div className="form-group">
                        <label>Avatar :</label>
                        <input
                            type="file"
                            accept="image/*"
                            onChange={(e) => handleFileChange(e.target.files[0])}
                        />
                    </div>

                    {/*Affichage des règles de mot de passe*/}
                    {rulesVisible && (
                        <ul className="password-rules">
                            {!passwordConditions.length && (
                                <li style={{ color: 'red' }}>15 caractères minimum</li>
                            )}
                            {!passwordConditions.uppercase && (
                                <li style={{ color: 'red' }}>1 majuscule minimum</li>
                            )}
                            {!passwordConditions.digit && (
                                <li style={{ color: 'red' }}>3 chiffres minimum</li>
                            )}
                            {!passwordConditions.special && (
                                <li style={{ color: 'red' }}>2 caractères spéciaux minimum</li>
                            )}
                        </ul>
                    )}

                    <button type="submit" className="primary" disabled={!passwordValid}>
                        Créer mon compte
                    </button>
                </form>
            </div>
        </div>
    );
}

export default Signup;
