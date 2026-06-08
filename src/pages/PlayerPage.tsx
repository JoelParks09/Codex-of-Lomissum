import { Navigate, useParams } from 'react-router-dom';
import NavigationBar from '../components/NavigationBar';
import { players } from '../data/players';

const abilityLabels = [
  ['strength', 'Strength'],
  ['dexterity', 'Dexterity'],
  ['constitution', 'Constitution'],
  ['intelligence', 'Intelligence'],
  ['wisdom', 'Wisdom'],
  ['charisma', 'Charisma'],
] as const;

function PlayerPage() {
  const { heroSlug } = useParams();
  const player = players.find((candidate) => candidate.slug === heroSlug);

  if (!player) {
    return <Navigate to="/heroes" replace />;
  }

  return (
    <main className="app-shell player-shell">
      <NavigationBar />

      <section className="player-profile" aria-labelledby="player-name">
        <article className="player-main">
          <header className="player-header">
            <h1 id="player-name">{player.name}</h1>
            <p>
              Level {player.level} {player.class}
            </p>
          </header>

          <section className="player-lore" aria-label={`${player.name} character information`}>
            <h2>Character Info</h2>
            <p>{player.characterInfo}</p>
          </section>
        </article>

        <aside className="player-info-panel" aria-label={`${player.name} character sheet`}>
          <div className="player-portrait-frame">
            <img src={player.portraitSrc} alt={`${player.name} portrait`} />
          </div>

          <dl className="player-facts">
            <div>
              <dt>Race</dt>
              <dd>{player.race}</dd>
            </div>
            <div>
              <dt>Class</dt>
              <dd>{player.class}</dd>
            </div>
            <div>
              <dt>Subclass</dt>
              <dd>{player.subclass}</dd>
            </div>
            <div>
              <dt>Level</dt>
              <dd>{player.level}</dd>
            </div>
          </dl>

          <section className="ability-grid" aria-label={`${player.name} ability scores`}>
            {abilityLabels.map(([abilityKey, label]) => (
              <div className="ability-card" key={abilityKey}>
                <span>{label}</span>
                <strong>{player.abilityScores[abilityKey]}</strong>
              </div>
            ))}
          </section>
        </aside>
      </section>
    </main>
  );
}

export default PlayerPage;
