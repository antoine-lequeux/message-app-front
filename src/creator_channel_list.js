import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import ChannelButton from './channel_btn';

// Ce composant permet d'afficher les canaux dont l'utilisateur est le créateur.
function CreatorChannelList() {
    const navigate = useNavigate();
    const [channels, setChannels] = useState([]);

    // vérification de l'existence de l'utilisateur (il peut être supprimé par l'admin)
    // retour sur la page de login inexistant ou erreur de vérification
    const verifyUser = async () => {
        const user = JSON.parse(localStorage.getItem('user'));
        const userID = user?.usersID;
        try {
            await axios.get(`http://localhost:8080/api/users/${userID}`, {
                withCredentials: true
            });
            // on tombe en erreur si l'utilisateur n'existe pas
        } catch (err) {
            if (err.response?.status === 404) {
                console.warn('Utilisateur introuvable');
                alert("Votre compte à été supprimé, veuillez en créer un nouveau.");
            }else{
                alert("Erreur de vérification de votre compte, veuillez vous reconnecter.")
            }

            navigate('/login');
        }
    };


    // Récupération de la liste de channel dont l'user est le créateur
    useEffect(() => {
        const user = JSON.parse(localStorage.getItem('user'));
        const userId = user?.id || user?.usersID;

        // Vérification que l'user existe
        verifyUser();

        // Récupère la liste des channels dont l'user est le créateur
        axios.get(`http://localhost:8080/api/users/channels/ownership`, {
            params: { userId },
            withCredentials: true
        })
            .then(response => {
                setChannels(response.data);
            })
            .catch(error => {
                console.error('Erreur lors de la récupération des salons :', error);
            });
    }, []);

    return (
        <div className="channel-list" style={{ maxHeight: '200px', overflowY: 'auto', marginBottom: '1rem' }}>
            {/*Liste des channels sous forme de ChannelBouton*/}
            {channels.map(channel => (
                <ChannelButton
                    key={channel.channelId}
                    name={`# ${channel.title}`}
                    desc={channel.description || ""}
                    onClick={() => navigate(`/home/channel/${channel.channelId}`)}
                />
            ))}
        </div>
    );
}

export default CreatorChannelList;
