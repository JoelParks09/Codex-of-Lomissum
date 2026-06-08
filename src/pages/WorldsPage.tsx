import { Link } from 'react-router-dom';
import NavigationBar from '../components/NavigationBar';
import propitiIcon from '../assets/icons/propiti_icon.png';
import spougigIcon from '../assets/icons/spougig_icon.png';
import spoudrakIcon from '../assets/icons/spoudrak_icon.png';

type World = {
  name: string;
  description: string;
  image: string;
  path: string;
};

const worlds: World[] = [
  {
    name: 'Propiti',
    image: propitiIcon,
    path: '/worlds/propiti',
    description:
      'Propiti is a world scarred by the Artificer’s War, a catastrophic conflict fueled by the rise of the Seong Company and their devastating arcane technologies. In the aftermath of the war, the continents of Kapia and Iucall fractured into rival kingdoms, uneasy alliances, and political turmoil as nations struggle to rebuild amidst lingering distrust and instability. Now, ancient magic, broken empires, and the remnants of wartime horrors threaten to shape the future of the world once again.',
  },
  {
    name: 'Spougig',
    image: spougigIcon,
    path: '/worlds/spougig',
    description:
      'In the colossal world of Spougig, giants are not myths - they are rulers, gods, and living forces of nature. Entire civilizations have been built in the shadows of titanic empires, where storm giants command the skies, mountain giants shape the earth itself, and wandering colossi leave destruction in their wake. Human kingdoms survive only through fragile alliances, hidden strongholds, and the courage of legendary heroes.',
  },
  {
    name: 'Spoudrak',
    image: spoudrakIcon,
    path: '/worlds/spoudrak',
    description:
      'Spoudrak is a realm forged in dragonfire, where ancient wyrms dominate the skies and their influence shapes every corner of civilization. Vast dragon-ruled territories stretch across volcanic mountains, ruined kingdoms, and towering black citadels, while mortals struggle to survive beneath the shadow of winged tyrants. Some dragons rule openly as living gods, while others manipulate the world from hidden lairs deep beneath the earth.',
  },
];

function WorldsPage() {
  return (
    <main className="app-shell worlds-shell">
      <NavigationBar />

      <header className="worlds-header">
        <h1>Spheres of Orion</h1>
      </header>

      <section className="world-list" aria-label="Spheres of Orion worlds">
        {worlds.map((world) => (
          <Link className="world-card" to={world.path} key={world.name}>
            <div className="world-icon-frame">
              <img src={world.image} alt="" aria-hidden="true" />
            </div>
            <div className="world-copy">
              <h2>{world.name}</h2>
              <p>{world.description}</p>
            </div>
          </Link>
        ))}
      </section>
    </main>
  );
}

export default WorldsPage;
