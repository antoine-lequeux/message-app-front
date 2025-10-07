import React from 'react';

// Composant qui permet de créer un bouton pour accéder à un canal.
// Le bouton affiche le nom du canal et sa description.
function ChannelButton({ name, desc, onClick }) {
    return (
        <button
            onClick={onClick}
            className="w-full text-left p-4 rounded-xl shadow hover:bg-gray-100 transition-all primary"
        >
            {/* Affichage du nom et de la description */}
            <div className="font-semibold text-lg text-gray-900">{name}</div>
            <div className="text-sm text-gray-500 truncate">{desc}</div>
        </button>
    );
}

export default ChannelButton;