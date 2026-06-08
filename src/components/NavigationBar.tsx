import { Link, useNavigate } from 'react-router-dom';
import SearchBar from './SearchBar';

type NavigationBarProps = {
  showBackHome?: boolean;
};

function NavigationBar({ showBackHome = true }: NavigationBarProps) {
  const navigate = useNavigate();

  return (
    <header className="site-nav">
      <Link className="site-brand" to="/">
        Codex of Lomissum
      </Link>

      <div className="nav-actions">
        {showBackHome && (
          <>
            <button className="back-link" type="button" onClick={() => navigate(-1)}>
              Back
            </button>
            <Link className="back-link" to="/">
              Back Home
            </Link>
          </>
        )}
        <SearchBar />
      </div>
    </header>
  );
}

export default NavigationBar;
