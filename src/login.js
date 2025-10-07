import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import ThemeToggle from './theme_toggle';

// Composant qui affiche la page de connexion à l'application.
function Login() {
    const [form, setForm] = useState({ mail: '', password: '' });
    const [error, setError] = useState(false);
    const navigate = useNavigate();

    // Envoi du formulaire
    const handleSubmit = (e) => {
        e.preventDefault();

        // Envoie le formulaire de connexion à l'API pour vérification.
        axios.post('http://localhost:8080/api/users/login', {
            mail: form.mail,
            password: form.password
        }, {
            withCredentials: true,
            headers: { 'Content-Type': 'application/json' }
        })
            .then(response => {
                if (response.data) {
                    // Stocker les infos utilisateur en local après login.
                    localStorage.setItem('user', JSON.stringify(response.data));
                    navigate('/home');
                } else {
                    // Email ou mot de passe incorrect.
                    setError(true);
                }
            })
            .catch(error => {
                console.error('Erreur de connexion :', error);
            });
    };

    return (
        <div className="centered-layout">
            <ThemeToggle />

            <div className="card card--narrow">
                <div className="header-bar">
                    <h2>Connexion</h2>
                </div>

                {/*Formulaire de login*/}
                <form onSubmit={handleSubmit} className="user-form">
                    {/*Message d'erreur optionnel*/}
                    {error && (
                        <div className="form-error">
                            <p style={{ color: 'red' }}>
                                Email ou mot de passe invalide.
                            </p>
                        </div>
                    )}

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
                            onChange={(e) => setForm({ ...form, password: e.target.value })}
                        />
                    </div>

                    <button type="submit" className="primary">Connexion</button>

                    {/*Proposition de création de compte*/}
                    <div className="register-link">
                        <p>
                            Vous n’avez pas encore de compte ?{' '}
                            <a href="/signup">Créer un compte</a>
                        </p>
                    </div>
                </form>
            </div>
        </div>
    );
}

export default Login;
