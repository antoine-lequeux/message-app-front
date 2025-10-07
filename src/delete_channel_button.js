import React from 'react';
import axios from 'axios';

// Ce composant permet d'afficher un bouton de suppression du canal.
// Ce bouton est affiché uniquement pour le créateur, à la place du bouton pour quitter le canal.
function DeleteChannelButton({ channelID, onDelete }) {

    // Gestion de la suppression
    const handleLeave = () => {
        const confirmed = window.confirm("Êtes-vous sûr de vouloir supprimer ce canal ? Cette action est irréversible.");

        if (!confirmed) return;

        // Supprime le canal via l'API.
        axios.delete('http://localhost:8080/api/channels', {
            data: { channelID },
            withCredentials: true,
            headers: { 'Content-Type': 'application/json' }
        })
            .then(() => {
                alert("Vous avez supprimé le canal.");
                onDelete?.();
            })
            .catch(err => {
                console.error("Erreur lors de la suppression du canal :", err);
                alert("Erreur lors de la suppression du canal.");
            });
    };

    return (
        <button onClick={handleLeave} className="danger" style={{ marginTop: '1rem' }}>
            Supprimer le canal
        </button>
    );
}

export default DeleteChannelButton;
