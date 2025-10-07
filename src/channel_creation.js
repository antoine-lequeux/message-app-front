import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import feather from 'feather-icons';
import ThemeToggle from './theme_toggle';

// Ce composant permet d'afficher un formulaire de création de salon.
function ChannelCreation() {
    const [form, setForm] = useState({
        title: '',
        description: '',
        date: '',
        endOfValidity: ''
    });

    const [error, setError] = useState(false);
    const navigate = useNavigate();

    // icones
    useEffect(() => {
        feather.replace();
    }, []);

    // Création de salon
    const handleSubmit = (e) => {
        e.preventDefault();

        // Vérification de la bonne connexion du user
        const user = JSON.parse(localStorage.getItem('user'));
        const userID = user?.usersID;
        if (!userID) {
            setError(true);
            console.error("Utilisateur non connecté");
            return;
        }

        // Création du salon via l'API.
        axios.post(`http://localhost:8080/api/channels?idUser=${userID}`, form, {
            withCredentials: true,
            headers: { 'Content-Type': 'application/json' },
        })
            .then(response => {
                // Redirection vers l'accueil après succès.
                navigate('/home');
            })
            .catch(error => {
                console.error('Erreur lors de la création du canal', error);
                setError(true);
            });
    };

    return (
        <div className="centered-layout">
            <ThemeToggle />
            <div className="card card--narrow">
                <div className="header-bar">
                    <h2>Créer un canal</h2>
                    <button
                        className="return-icon back-icon"
                        title="Retour"
                        onClick={() => navigate('/home')}
                    >
                        <i data-feather="arrow-right" />
                    </button>
                </div>

                {/*Message d'erreur optionnel*/}
                {error && (
                    <div className="form-error">
                        <p style={{ color: 'red' }}>
                            Utilisateur déconnecté ou erreur de création de canal. Veuillez vous reconnecter.
                        </p>
                    </div>
                )}

                {/*Formulaire de création de channel*/}
                <form onSubmit={handleSubmit} className="user-form">
                    <div className="form-group">
                        <label>Titre :</label>
                        <input
                            type="text"
                            required
                            onChange={(e) => setForm({ ...form, title: e.target.value })}
                        />
                    </div>

                    <div className="form-group">
                        <label>Description :</label>
                        <textarea
                            required
                            onChange={(e) => setForm({ ...form, description: e.target.value })}
                        />
                    </div>

                    <div className="form-group">
                        <label>Date de démarrage :</label>
                        <input
                            type="datetime-local"
                            required
                            value={form.date}
                            onChange={(e) => setForm({ ...form, date: e.target.value })}
                        />
                    </div>

                    <div className="form-group">
                        <label>Date de fin de validité :</label>
                        <input
                            type="datetime-local"
                            required
                            value={form.endOfValidity}
                            onChange={(e) => setForm({ ...form, endOfValidity: e.target.value })}
                        />
                    </div>

                    <button type="submit" className="primary">Créer le canal</button>
                </form>
            </div>
        </div>
    );
}

export default ChannelCreation;
