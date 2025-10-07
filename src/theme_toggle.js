import React, { useContext, useEffect } from 'react';
import { ThemeContext } from './theme_provider';
import feather from 'feather-icons';

// Ce composant permet d'afficher un bouton de bascule entre les thèmes clair et sombre.
export default function ThemeToggle() {

    const { toggle, dark } = useContext(ThemeContext);

    // Met à jour l'icône feather quand le thème change.
    useEffect(() => {
        feather.replace();
    }, [dark]);

    // Quand le bouton est cliqué, la closure 'toggle' est invoquée.
    return (
        <button
            className="theme-toggle"
            aria-label="Basculer thème"
            onClick={toggle}
        >
            <i data-feather="sun"  className="toggle-icon icon-sun" />
            <i data-feather="moon" className="toggle-icon icon-moon" />
        </button>
    );
}
