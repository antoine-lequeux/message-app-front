import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import ThemeToggle from './theme_toggle';
import feather from 'feather-icons';
import ChannelButton from './channel_btn';
import CreatorChannelList from './creator_channel_list';
import MemberChannelList from './member_channel_list';
import axios from "axios";

// Composant qui permet d'afficher la page avec les salons auxquels l'utilisateur participe.
function Home() {
    const navigate = useNavigate();

    // MAJ des icones
    useEffect(() => {
        feather.replace();
    }, []);


    return (
        <div className="centered-layout">
            <div className="home-container">
                <ThemeToggle />

                <div
                    className="card"
                    style={{
                        maxWidth: '1200px',
                        minWidth: '800px',
                        width: '100%',
                        maxHeight: '1200px',
                        minHeight: '800px',
                        height: '100%'
                    }}
                >
                    {/* Titre + bouton de création */}
                    <div className="header-bar">
                        <h2>Mes chats</h2>
                        <button
                            className="return-icon back-icon"
                            title="Retour"
                            onClick={() => navigate('/login')}
                        >
                            <i data-feather="arrow-right" />
                        </button>
                    </div>

                    <div className="channel-list">
                        <ChannelButton
                            name="Créer un canal"
                            desc="+"
                            onClick={()=>navigate('/channel_creation')}
                        />
                    </div>

                    {/* Liste des canaux que l'utilisateur a créés */}
                    <div className="channel-list-section">
                        <CreatorChannelList />
                    </div>

                    <div className="header-bar">
                        <h2>Mes invitations</h2>
                    </div>

                    {/* Liste des canaux dans lesquels l'utilisateur a été invité */}
                    <div className="channel-list-section">
                        <MemberChannelList />
                    </div>
                </div>
            </div>
        </div>
    );
}

export default Home;
