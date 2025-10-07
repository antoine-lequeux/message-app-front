import React, { createContext, useState, useEffect } from 'react';

export const ThemeContext = createContext();

// Composant qui permet de gérer le thème de l'application (clair ou sombre).
export const ThemeProvider = ({ children }) => {

    // État initial : on lit localStorage.
    const [dark, setDark] = useState(() => localStorage.getItem('theme') === 'dark');

    // À chaque changement, on applique la classe et on met à jour le localStorage.
    useEffect(() => {
        const body = document.body;
        if (dark) body.classList.add('dark-mode');
        else      body.classList.remove('dark-mode');
        localStorage.setItem('theme', dark ? 'dark' : 'light');
    }, [dark]);

    // Enveloppe le contenu dans le ThemeProvider et expose la closure 'toggle' qui peut être invoquée dans d'autres composants.
    return (
        <ThemeContext.Provider value={{ dark, toggle: () => setDark(d => !d) }}>
            {children}
        </ThemeContext.Provider>
    );
};