import React, { useState, useEffect } from 'react';
import UserItem from "./user_item";
import axios from 'axios';

// Ce composant créer un formulaire d'ajout d'utilisateur, avec suggestion au fur et à mesure de la saisie
function UserSearch({ onSelectUser }) {

    const [query, setQuery] = useState('');
    const [results, setResults] = useState([]);
    const [showSuggestions, setShowSuggestions] = useState(false);

    // requête de recherche vers l'API
    useEffect(() => {
        // on ne fait la requet que pour une saisie de 2 caractères ou plus
        if (!query || query.length < 2) {
            setResults([]);
            return;
        }

        // requete de recherche avec délai
        const delayDebounceFn = setTimeout(() => {
            axios.get(`http://localhost:8080/api/users/search?query=${encodeURIComponent(query)}`, {
                withCredentials: true
            })
                .then(res => setResults(res.data))
                .catch(err => {
                    console.error('Erreur de recherche utilisateur :', err);
                    setResults([]);
                });
        }, 300); // délai de 300ms.

        return () => clearTimeout(delayDebounceFn); // Nettoie le timer si query change rapidement.
    }, [query]);

    const handleSelect = (user) => {
        setQuery('');
        setShowSuggestions(false);
        onSelectUser(user); // Remonte la sélection au composant parent.
    };

    return (
        <div className="form-group autocomplete">
            <h5>Ajouter un membre :</h5>
            <input
                type="text"
                value={query}
                onChange={(e) => {
                    setQuery(e.target.value);
                    setShowSuggestions(true);
                }}
                placeholder="Rechercher..."
            />

            {/*Affichage des utilisateurs suggérés*/}
            {showSuggestions && results.length > 0 && (
                <div
                    className="user-feed"
                    style={{
                        maxHeight: '187px',
                        overflowY: 'auto',
                        paddingRight: '8px',
                        marginBottom: '1rem',
                    }}
                >
                    <ul className="suggestions" style={{ listStyle: 'none', paddingLeft: 0, lineHeight: 1.6 }}>
                        {results.map((user) => (
                            <UserItem
                                key={user.id}
                                user={user}
                                onClick={() => handleSelect(user)}
                            />
                        ))}
                    </ul>
                </div>
            )}
        </div>
    );
}

export default UserSearch;
