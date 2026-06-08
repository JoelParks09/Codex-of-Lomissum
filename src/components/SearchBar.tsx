import { FormEvent, useMemo, useState } from 'react';
import { Search } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { searchablePages } from '../data/sitePages';

function SearchBar() {
  const [query, setQuery] = useState('');
  const [isFocused, setIsFocused] = useState(false);
  const navigate = useNavigate();

  const matches = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();

    if (!normalizedQuery) {
      return [];
    }

    return searchablePages
      .filter((page) => page.title.toLowerCase().includes(normalizedQuery))
      .slice(0, 8);
  }, [query]);

  function goToPage(path: string) {
    setQuery('');
    setIsFocused(false);
    navigate(path);
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (matches[0]) {
      goToPage(matches[0].path);
    }
  }

  return (
    <form className="search-bar" role="search" onSubmit={handleSubmit}>
      <label className="search-input-wrap">
        <span className="sr-only">Search pages</span>
        <Search size={18} strokeWidth={2.2} aria-hidden="true" />
        <input
          type="search"
          value={query}
          placeholder="Search pages"
          onBlur={() => window.setTimeout(() => setIsFocused(false), 120)}
          onChange={(event) => setQuery(event.target.value)}
          onFocus={() => setIsFocused(true)}
        />
      </label>

      {isFocused && query.trim() && (
        <div className="search-results" role="listbox">
          {matches.length > 0 ? (
            matches.map((match) => (
              <button
                type="button"
                role="option"
                className="search-result"
                key={match.path}
                onMouseDown={(event) => event.preventDefault()}
                onClick={() => goToPage(match.path)}
              >
                <span>{match.title}</span>
                <small>{match.category}</small>
              </button>
            ))
          ) : (
            <p>No matching pages</p>
          )}
        </div>
      )}
    </form>
  );
}

export default SearchBar;
