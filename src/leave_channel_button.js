import React from 'react';
import axios from 'axios';

// Composant qui affiche un bouton permettant de quitter le canal.
// Il ne s'affiche pas pour le créateur du canal.
function LeaveChannelButton({ userID, channelID, onLeave }) {
    const handleLeave = () => {
        const confirmed = window.confirm("Êtes-vous sûr de vouloir quitter ce canal ?");

        if (!confirmed) return;

        // Gère la suppression du membre via l'API.
        axios.delete('http://localhost:8080/api/channels/members', {
            data: {
                userID: userID,
                channelID: channelID
            },
            withCredentials: true,
            headers: { 'Content-Type': 'application/json' }
        })
            .then(() => {
                alert("Vous avez quitté le canal.");
                onLeave?.();
            })
            .catch(err => {
                console.error("Erreur lors de la sortie du canal :", err);
                alert("Erreur lors de la sortie du canal.");
            });
    };

    return (
        <button onClick={handleLeave} className="danger" style={{ marginTop: '1rem' }}>
            Quitter le canal
        </button>
    );
}

export default LeaveChannelButton;
