import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import App from './App';
import './styles.css';
import './styles/layout.css';
import './styles/navigation.css';
import './styles/page.css';
import './styles/home.css';
import './styles/worlds.css';
import './styles/heroes.css';
import './styles/player.css';
import './styles/foundry.css';
import './styles/markdown.css';
import './styles/responsive.css';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </StrictMode>,
);
