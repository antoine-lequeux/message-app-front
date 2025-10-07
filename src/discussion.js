import React, { useEffect, useState, useRef, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import feather from 'feather-icons';
import ThemeToggle from './theme_toggle';
import UserItem from './user_item';
import LeaveChannelButton from './leave_channel_button';
import DeleteChannelButton from './delete_channel_button';
import AddMember from "./add_member";

// Ce composant permet d'afficher la page de discussion liée à un canal.
export default function Discussion() {

    const navigate = useNavigate();
    const { channelId } = useParams();
    const user = JSON.parse(localStorage.getItem('user'));
    const userID = user?.usersID;

    const [channel, setChannel] = useState(null);
    const [members, setMembers] = useState([]);
    const [memberSinceBegin, setMemberSinceBegin] = useState([]);
    const [messages, setMessages] = useState([]);
    const [newMsg, setNewMsg] = useState('');
    const bottomRef = useRef(null);
    const prevMessageCount = useRef(0);

    const [isCreatorOfChannel, setIsCreatorOfChannel] = useState(false);
    const wsRef = useRef(null);

    // Connexion WebSocket pour recevoir les nouveaux messages en temps réel.
    useEffect(() => {
        const ws = new WebSocket(`ws://localhost:8080/message/${channelId}?userId=${userID}`)
        wsRef.current = ws;

        ws.onopen = () => console.log("WebSocket connecté");

        ws.onmessage = (event) => {
            try {
                const data = JSON.parse(event.data);
                fetchMembers();
                setMessages(prev => [...prev, {
                    senderId: data.userID,
                    content: data.message,
                    timestamp: getLocalDateTime(),
                }]);
            } catch (e) {
                console.error("Erreur parsing WebSocket message:", e);
            }
        };

        ws.onclose = () => console.log("WebSocket déconnecté");
        ws.onerror = (err) => console.error("WebSocket erreur", err);

        return () => ws.close();
    }, [channelId, userID]);

    // Récupère les membres du salon.
    const fetchMembers = async () => {
        try {
            const res = await axios.get('http://localhost:8080/api/channels/members', {
                params: { idChannel: channelId },
                withCredentials: true,
            });
            setMembers(res.data);
            return res.data;
        } catch (err) {
            console.error('Erreur fetch members:', err);
            return null;
        }
    };

    // Récupère les infos du channel
    const fetchChannels = async () => {
        try {
            const res = await axios.get(`http://localhost:8080/api/channels/${channelId}`, {
                withCredentials: true
            });
            setChannel(res.data);
            return res.data;
        } catch (err) {
            if (err.response?.status === 404) {
                console.warn('Canal introuvable (404)');
            } else {
                console.error('Erreur fetch channels:', err);
            }
            return null;
        }
    };

    // Gestion de la déconnexion de l'utilisateur, s'il est sur le channel et qu'il se fait retirer par le créateur
    useEffect(() => {
        if (members.length > 0 && userID && !members.some(member => member.usersID === userID)) {
            alert("Vous avez été retiré du canal, retour à la page d'accueil.");
            navigate('/home');
        }
    }, [members, userID, navigate]);

    // Gestion des membres connectés depuis le début du canal, permet de garder les infos pour l'affichage des messages
    // même après que l'envoyeur ait quitté le canal
    useEffect(() => {
        // Ajout des nouveaux membres, jamais passés par le canal
        if (members.length === 0) return;

        setMemberSinceBegin(prev => {
            const newMembers = members.filter(
                m => !prev.some(existing => existing.usersID === m.usersID)
            );

            if (newMembers.length === 0) return prev;

            return [...prev, ...newMembers];
        });
    }, [members]);

    // Mise à jour des membres
    useEffect(() => {
        fetchMembers();
    }, [channelId]);

    // Icones
    useEffect(() => {
        feather.replace();
    }, []);

    // Récupère les infos du salon.
    useEffect(() => {
        fetchChannels();
    }, [channelId]);

    // Map des ID utilisateurs vers leurs infos (nom complet, avatar).
    const userMap = useMemo(() => {
        const map = {};
        memberSinceBegin.forEach(u => {
            map[u.usersID] = {
                fullName: `${u.firstName} ${u.lastName}`,
                avatar: u.avatar,
            };
        });
        return map;
    }, [memberSinceBegin]);

    // Date et heure dans le fuseau horaire local.
    function getLocalDateTime() {
        const date = new Date();
        const offset = date.getTimezoneOffset();
        const localDate = new Date(date.getTime() - offset * 60000);
        return localDate.toISOString().slice(0, 16);
    }

    // Envoie un message via WebSocket.
    const sendMessage = async () => {
        if (!newMsg.trim()) return;

        // vérification que le channel existe toujours
        const updateChannel = await fetchChannels();
        if (!updateChannel || Object.keys(updateChannel).length === 0) {
            alert("Le canal a été supprimé ou est inaccessible.");
            navigate('/home');
            return;
        }

        // vérification que l'user est toujours bien dans le canal
        const updatedMembers = await fetchMembers();
        if (!updatedMembers) {
            console.warn("Impossible de vérifier les membres.");
            return;
        }

        // on empêche l'envoi du message si plus membre
        const stillMember = updatedMembers.some(m => m.usersID === userID);
        if (!stillMember) {
            return;
        }

        const payload = {
            userID,
            message: newMsg,
        };

        // Envoi du message
        if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
            wsRef.current.send(JSON.stringify(payload));
            setNewMsg('');
        } else {
            console.warn("WebSocket non connecté, message non envoyé.");
        }
    };

    // Retire un membre (disponible uniquement pour le créateur du salon).
    const handleRemoveMember = (member) => {

        // Empêche le créateur de se supprimer lui-même du canal.
        if (member.usersID === userID) {
            alert("Vous ne pouvez pas vous retirer vous-même du canal.");
            return;
        }

        const confirmed = window.confirm(`Retirer ${member.firstName} ${member.lastName} du salon ?`);
        if (!confirmed ||!isCreatorOfChannel) return;

        console.log("trying to remove user: " + member.usersID);

        // Supprime le membre via l'API.
        axios.delete('http://localhost:8080/api/channels/members', {
            data: { userID: member.usersID, channelID: Number(channelId) },
            withCredentials: true,
            headers: { 'Content-Type': 'application/json' }
        })
            .then(() => fetchMembers())
            .catch(err => {
                console.error("Erreur suppression membre :", err);
                alert("Erreur lors de la suppression du membre.");
            });
    };

    // Vérifie si l'utilisateur est le créateur du salon.
    useEffect(() => {
        if (!userID || !channelId) return;

        axios.get('http://localhost:8080/api/channels/is-creator', {
            params: { userID, channelID: channelId },
            withCredentials: true
        })
            .then(res => setIsCreatorOfChannel(res.data === true))
            .catch(err => {
                console.error("Erreur vérif créateur :", err);
                setIsCreatorOfChannel(false);
            });
    }, [userID, channelId]);

    // Scroll automatique vers le bas quand un nouveau message est ajouté.
    useEffect(() => {
        const currentCount = messages.length;
        const previousCount = prevMessageCount.current;

        if (currentCount > previousCount) {
            bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
        }

        prevMessageCount.current = currentCount;
    }, [messages]);

    // Affichage de la page :
    return (
        <div className="centered-layout">
            <ThemeToggle />
            <div className="card" style={{ maxWidth: '1200px', minWidth: '800px', width: '100%' }}>
                {/* Header avec titre du canal */}
                <div className="header-bar">
                    <h2>{channel ? channel.title : `Channel #${channelId}`}</h2>
                    <button
                        className="return-icon back-icon"
                        title="Retour"
                        onClick={() => navigate('/home')}
                    >
                        <i data-feather="arrow-right" />
                    </button>
                </div>
                {channel && (
                    <p style={{ color: 'var(--fg-text-sub)', marginTop: '-12px' }}>
                        {channel.description}
                    </p>
                )}

                {/* Contenu principal : messages + sidebar */}
                <div className="chat-wrapper">

                    {/* Messages */}
                    <div className="chat-messages">
                        <div className="chat-feed" style={{
                            maxHeight: '500px',
                            overflowY: 'auto',
                            paddingRight: '8px',
                            marginBottom: '1rem',
                        }}>
                            {messages.map((m, i) => {
                                const isMe = m.senderId === userID;
                                const time = new Date(m.timestamp).toLocaleTimeString([], {
                                    hour: '2-digit',
                                    minute: '2-digit'
                                });
                                const sender = userMap[m.senderId];

                                return (
                                    <div key={i} className="chat-message">
                                        {sender?.avatar && (
                                            <img
                                                src={`data:image/jpeg;base64,${sender.avatar}`}
                                                alt="Avatar"
                                                className="message-avatar"
                                            />
                                        )}
                                        <strong className={isMe ? 'chat-me' : ''}>
                                            {"  " + (sender?.fullName || `[removed]`)}
                                        </strong><br />
                                        <span className="chat-bubble">{m.content}</span><br />
                                        <small className="chat-time">[{time}]</small>
                                    </div>
                                );
                            })}
                            <div ref={bottomRef} />
                        </div>

                        {/* Champ de saisie */}
                        <div className="chat-input-row">
                            <input
                                type="text"
                                value={newMsg}
                                placeholder="Écrire un message…"
                                onChange={e => setNewMsg(e.target.value)}
                                onKeyDown={e => e.key === 'Enter' && sendMessage()}
                            />
                            <button
                                className="primary"
                                onClick={sendMessage}
                                disabled={!newMsg.trim()}
                            >
                                Envoyer
                            </button>
                        </div>
                    </div>

                    {/* Sidebar : membres + actions */}
                    <aside className="chat-sidebar">
                        <h3 style={{ marginBottom: 12 }}>Membres</h3>
                        <div className="user-feed" style={{
                            maxHeight: '1807px',
                            overflowY: 'auto',
                            paddingRight: '8px',
                            marginBottom: '1rem',
                        }}>
                            <ul style={{ listStyle: 'none', paddingLeft: 0, lineHeight: 1.6 }}>
                                {members.map(u => (
                                    <UserItem
                                        key={u.usersID}
                                        user={u}
                                        onClick={
                                            isCreatorOfChannel && !u.creator
                                                ? () => handleRemoveMember(u)
                                                : undefined
                                        }
                                    />
                                ))}
                            </ul>
                        </div>

                        {/* Ajout de membres */}
                        <div style={{ display: 'flex', justifyContent: 'center' }}>
                            <AddMember channelId={channelId} onMembersAdded={fetchMembers} />
                        </div>

                        {/* Quitter ou supprimer le canal */}
                        <div style={{ display: 'flex', justifyContent: 'center', marginTop: '1rem' }}>
                            <LeaveChannelButton
                                userID={userID}
                                channelID={channelId}
                                onLeave={() => navigate('/home')}
                            />
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'center', marginTop: '1rem' }}>
                            {isCreatorOfChannel &&
                                <DeleteChannelButton
                                    channelID={channelId}
                                    onDelete={() => navigate('/home')}
                                />
                            }
                        </div>
                    </aside>
                </div>
            </div>
        </div>
    );
}
