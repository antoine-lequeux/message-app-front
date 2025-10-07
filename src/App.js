import './App.css';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Signup from "./signup.js";
import Login from "./login.js";
import Home from "./home.js";
import ChannelCreation from "./channel_creation";
import Discussion from "./discussion";
import {ThemeProvider} from "./theme_provider";

// Routage des pages dans l'application.
function App() {

    return (
        <ThemeProvider>
            <BrowserRouter>
                <Routes>
                    <Route path="/" element={<Login />} />
                    <Route path="/login" element={<Login />} />
                    <Route path="/signup" element={<Signup />} />
                    <Route path="/home" element={<Home />} />
                    <Route path="/channel_creation" element={<ChannelCreation />} />
                    <Route path="/home/channel/:channelId" element={<Discussion />} />
                </Routes>
            </BrowserRouter>
        </ThemeProvider>
    );
}

export default App;
