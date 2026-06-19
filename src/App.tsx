import { Route, Routes } from 'react-router-dom';
import HomePage from './pages/HomePage';
import WorldsPage from './pages/WorldsPage';
import HeroesPage from './pages/HeroesPage';
import PlayerPage from './pages/PlayerPage';
import SectionPage from './pages/SectionPage';
import FoundryPage from './pages/FoundryPage';
import MarkdownPage from './pages/MarkdownPage';
import NotFoundPage from './pages/NotFoundPage';

function App() {
  return (
    <Routes>
      <Route path="/" element={<HomePage />} />
      <Route path="/worlds" element={<WorldsPage />} />
      <Route path="/worlds/*" element={<MarkdownPage />} />
      <Route path="/heroes" element={<HeroesPage />} />
      <Route path="/heroes/:heroSlug" element={<PlayerPage />} />
      <Route path="/campaigns" element={<SectionPage title="Campaigns" />} />
      <Route path="/foundry" element={<FoundryPage />} />
      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  );
}

export default App;
