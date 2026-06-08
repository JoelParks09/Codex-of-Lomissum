import NavigationBar from '../components/NavigationBar';
import { useNavigate } from 'react-router-dom';
import { players } from '../data/players';

function HeroesPage() {
  const navigate = useNavigate();

  return (
    <main className="app-shell heroes-shell">
      <NavigationBar />

      <header className="heroes-header">
        <h1>Heroes of the Spheres</h1>
      </header>

      <section className="hero-table-panel" aria-label="Heroes of the Spheres roster">
        <div className="table-scroll">
          <table>
            <thead>
              <tr>
                <th scope="col">Hero Name</th>
                <th scope="col">Race</th>
                <th scope="col">Class</th>
                <th scope="col">Subclass</th>
                <th scope="col">Level</th>
              </tr>
            </thead>
            <tbody>
              {players.map((hero) => (
                <tr
                  className="hero-table-row"
                  key={hero.name}
                  role="link"
                  tabIndex={0}
                  onClick={() => navigate(`/heroes/${hero.slug}`)}
                  onKeyDown={(event) => {
                    if (event.key === 'Enter' || event.key === ' ') {
                      event.preventDefault();
                      navigate(`/heroes/${hero.slug}`);
                    }
                  }}
                >
                  <th scope="row">{hero.name}</th>
                  <td>{hero.race}</td>
                  <td>{hero.class}</td>
                  <td>{hero.subclass}</td>
                  <td>{hero.level}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </main>
  );
}

export default HeroesPage;
