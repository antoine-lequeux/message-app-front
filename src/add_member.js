import React, { useState, useEffect } from 'react';
import axios from 'axios';
import UserSearch from "./user-suggestion";
import UserItem from "./user_item";

// Composant qui permet de gérer l'ajout de membres dans un canal.
function AddMember({ channelId, onMembersAdded }) {

    const [members, setMembers] = useState([]); // Liste des membres à envoyer à l'API.
    const [users, setUsers] = useState([]);     // Liste des objets User affichés.
    const [error, setError] = useState(false);

    const handleAddMember = (user) => {
        // Évite d'ajouter un utilisateur déjà présent.
        if (members.some(m => m.usersID === user.usersID)) return;

        const newMember = {
            userID: user.usersID,
            mail: user.mail,
            creator: false,
            joinDate: new Date().toISOString().slice(0, 10),
            channelID: channelId
        };

        setMembers([...members, newMember]);
        setUsers([...users, user]);
    };

    const handleDeleteUser = (user) => {
        // Supprime un utilisateur de la sélection.
        setMembers(prev => prev.filter(m => m.usersID !== user.usersID));
        setUsers(prev => prev.filter(m => m.usersID !== user.usersID));
    };

    useEffect(() => {
        // Affiche la mise à jour des utilisateurs en console.
        console.log('Users après mise à jour :', users);
        console.log(members);
    }, [users, members]);

    const handleSubmit = (e) => {
        e.preventDefault();

        // Ajout des membres via l'API.
        axios.post('http://localhost:8080/api/channels/members', members, {
            withCredentials: true,
            headers: { 'Content-Type': 'application/json' }
        })
            .then(() => {
                onMembersAdded?.();
                setMembers([]);
                setUsers([]);
            })
            .catch(() => {
                setError(true);
            });
    };

    return (
        <div className="card card--narrow">

            {/* Message d'erreur */}
            {error && (
                <div className="form-error">
                    <p style={{ color: 'red' }}>
                        Erreur lors de l'ajout des membres, veuillez réessayer.
                    </p>
                </div>
            )}

            <form onSubmit={handleSubmit} className="user-form">
                {/*Liste des utilisateur sélectionné dans le formulaire, en attente d'être ajouter via le bouton valider*/}
                {users.length > 0 && (
                    <div
                        className="user-feed"
                        style={{
                            maxHeight: '187px',
                            overflowY: 'auto',
                            paddingRight: '8px',
                            marginBottom: '1rem',
                        }}
                    >
                        Utilisateurs ajoutés :
                        <ul className="suggestions" style={{ listStyle: 'none', paddingLeft: 0, lineHeight: 1.6 }}>
                            {users.map((user) => (
                                <UserItem
                                    key={user.usersID}
                                    user={user}
                                    onClick={() => handleDeleteUser(user)}
                                />
                            ))}
                        </ul>
                    </div>
                )}

                {/*Forumlaire avec suggestion*/}
                <UserSearch onSelectUser={handleAddMember} />
                <button type="submit" className="primary">Valider</button>
            </form>
        </div>
    );
}

export default AddMember;
