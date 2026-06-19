import { Link } from 'react-router-dom';
import NavigationBar from '../components/NavigationBar';
import worldsIcon from '../assets/icons/worlds_icon.png';
import heroesIcon from '../assets/icons/heroes_icon.png';
import campaignsIcon from '../assets/icons/campaigns_icon.png';
import foundryIcon from '../assets/icons/foundry_icon.png';

type HomeCard = {
  title: string;
  path: string;
  image: string;
};

const cards: HomeCard[] = [
  {
    title: 'Worlds',
    path: '/worlds',
    image: worldsIcon,
  },
  {
    title: 'Heroes',
    path: '/heroes',
    image: heroesIcon,
  },
  {
    title: 'Campaigns',
    path: '/campaigns',
    image: campaignsIcon,
  },
  {
    title: 'Foundry',
    path: '/foundry',
    image: foundryIcon,
  },
];

function HomePage() {
  return (
    <main className="app-shell home-shell">
      <NavigationBar showBackHome={false} />

      <header className="home-header">
        <h1>Codex of Lomissum</h1>
      </header>

      <section className="card-grid" aria-label="Codex sections">
        {cards.map((card) => (
          <Link
            className="route-card"
            to={card.path}
            key={card.title}
            aria-label={card.title}
          >
            <img src={card.image} alt="" aria-hidden="true" />
          </Link>
        ))}
      </section>
    </main>
  );
}

export default HomePage;
