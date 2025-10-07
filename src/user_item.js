import React from 'react';

// Ce composant permet d'afficher une boîte avec les infos d'un utilisateur.
function UserItem({ user, onClick }) {

    return (
        <div className="user-item" onClick={onClick}>
            <img src={`data:image/jpeg;base64,${user.avatar || user.avatarBase64}`}
                 alt="Avatar"
                 className="user-avatar"
            />
            <div className="user-info">
                <span className="user-name">{user.firstName} {user.lastName}</span>
                <span className="user-mail">{user.mail}</span>
            </div>
        </div>
    );
}

export default UserItem;
