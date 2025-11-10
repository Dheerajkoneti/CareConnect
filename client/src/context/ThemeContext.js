import React, { createContext, useState, useContext } from 'react';

// Create the Context object
export const ThemeContext = createContext();

// Theme Provider Component
export const ThemeProvider = ({ children }) => {
    // State to hold the current theme: 'light' or 'dark'
    const [theme, setTheme] = useState('light');

    // Function to toggle the theme
    const toggleTheme = () => {
        setTheme((prevTheme) => (prevTheme === 'light' ? 'dark' : 'light'));
    };

    // The styles object for dynamic colors
    const themeStyles = {
        dark: {
            sidebarBg: '#2C3E50', // Dark Navy/Slate
            sidebarColor: '#F0F3F7',
            mainBg: '#1E2833', // Deep Gray background
            cardBg: '#34495E', // Dark Card Surface
            textColor: '#F0F3F7',
            secondaryText: '#BDC3C7',
            borderColor: '#546E7A',
        },
        light: {
            sidebarBg: '#34495E', // Default Sidebar color
            sidebarColor: 'white',
            mainBg: '#F7F9FC', // Light Background
            cardBg: 'white',
            textColor: '#34495E',
            secondaryText: '#7F8C8D',
            borderColor: '#EAECEF',
        },
    };

    // The value provided to consumers
    const value = {
        theme,
        toggleTheme,
        currentStyles: themeStyles[theme],
    };

    return (
        <ThemeContext.Provider value={value}>
            {children}
        </ThemeContext.Provider>
    );
};

// Custom hook to use the theme context easily
export const useTheme = () => useContext(ThemeContext);