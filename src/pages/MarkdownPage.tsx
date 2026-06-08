import { useEffect, useState } from 'react';
import { Link, Navigate, useParams } from 'react-router-dom';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { X } from 'lucide-react';
import NavigationBar from '../components/NavigationBar';
import { markdownPageRecords } from '../data/sitePages';

function getChildPages(currentPath: string) {
  const descendantPages = markdownPageRecords.filter((page) =>
    page.routePath.startsWith(`${currentPath}/`),
  );

  return descendantPages.filter((page) => {
    const ancestorPages = markdownPageRecords.filter(
      (candidate) =>
        candidate.routePath !== currentPath &&
        page.routePath.startsWith(`${candidate.routePath}/`) &&
        candidate.routePath.startsWith(`${currentPath}/`),
    );

    return ancestorPages.length === 0;
  });
}

function getChildPanelTitle(childPages: typeof markdownPageRecords) {
  const firstChildType = childPages[0]?.pageType;

  if (firstChildType === 'continent') {
    return 'Continents';
  }

  if (firstChildType === 'region') {
    return 'Regions';
  }

  if (firstChildType === 'city') {
    return 'Cities';
  }

  return 'Pages';
}

function getSectionHeadings(markdown: string) {
  return markdown
    .split('\n')
    .filter((line) => /^###\s+[^#]/.test(line.trim()))
    .map((line) => {
      const title = line.replace(/^###\s+/, '').trim();

      return {
        title,
        id: getHeadingId(title),
      };
    });
}

function getHeadingId(value: string) {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');
}

function MarkdownPage() {
  const [isMapModalOpen, setIsMapModalOpen] = useState(false);
  const params = useParams();
  const worldPath = (params['*'] ?? '').replace(/\/$/, '');
  const page = markdownPageRecords.find((record) => record.routePath === worldPath);

  useEffect(() => {
    if (!isMapModalOpen) {
      return;
    }

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape') {
        setIsMapModalOpen(false);
      }
    }

    window.addEventListener('keydown', handleKeyDown);

    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isMapModalOpen]);

  if ((params['*'] ?? '').endsWith('/')) {
    return <Navigate to={`/worlds/${worldPath}`} replace />;
  }

  if (!page) {
    return (
      <main className="app-shell markdown-shell">
        <NavigationBar />
        <article className="markdown-content">
          <h1>Page Not Found</h1>
          <p>The requested world page could not be found.</p>
        </article>
      </main>
    );
  }

  const childPages = getChildPages(page.routePath);
  const childPanelTitle = getChildPanelTitle(childPages);
  const sectionHeadings = getSectionHeadings(page.markdown);
  const hasSideNav = childPages.length > 0 || sectionHeadings.length > 0;

  return (
    <main className="app-shell markdown-shell">
      <NavigationBar />

      <div className="markdown-layout">
        <article className="markdown-content">
          <ReactMarkdown
            remarkPlugins={[remarkGfm]}
            components={{
              h1: ({ children }) => (
                <>
                  <h1>{children}</h1>
                  {page.mapImageSrc && (
                    <button
                      className="markdown-map-button"
                      type="button"
                      onClick={() => setIsMapModalOpen(true)}
                    >
                      <img
                        className="markdown-map-image"
                        src={page.mapImageSrc}
                        alt={`${page.title} map`}
                      />
                    </button>
                  )}
                </>
              ),
              h2: ({ children }) => (
                <h2 id={getHeadingId(String(children))}>{children}</h2>
              ),
              h3: ({ children }) => (
                <h3 id={getHeadingId(String(children))}>{children}</h3>
              ),
            }}
          >
            {page.markdown}
          </ReactMarkdown>
        </article>

        {isMapModalOpen && page.mapImageSrc && (
          <div
            className="image-modal"
            role="dialog"
            aria-modal="true"
            aria-label={`${page.title} map preview`}
            onClick={() => setIsMapModalOpen(false)}
          >
            <div className="image-modal-panel" onClick={(event) => event.stopPropagation()}>
              <button
                className="image-modal-close"
                type="button"
                aria-label="Close map preview"
                onClick={() => setIsMapModalOpen(false)}
              >
                <X size={24} strokeWidth={2.2} aria-hidden="true" />
              </button>
              <img src={page.mapImageSrc} alt={`${page.title} map enlarged preview`} />
            </div>
          </div>
        )}

        {hasSideNav && (
          <aside className="markdown-side-nav" aria-label={`${page.title} navigation`}>
            {childPages.length > 0 && (
              <section className="side-nav-panel" aria-label={`${page.title} child pages`}>
                <h2>{childPanelTitle}</h2>
                <nav>
                  {childPages.map((childPage) => (
                    <Link to={`/worlds/${childPage.routePath}`} key={childPage.routePath}>
                      {childPage.title}
                    </Link>
                  ))}
                </nav>
              </section>
            )}

            {sectionHeadings.length > 0 && (
              <section className="side-nav-panel" aria-label={`${page.title} sections`}>
                <h2>On This Page</h2>
                <nav>
                  {sectionHeadings.map((heading) => (
                    <a href={`#${heading.id}`} key={heading.id}>
                      {heading.title}
                    </a>
                  ))}
                </nav>
              </section>
            )}
          </aside>
        )}
      </div>
    </main>
  );
}

export default MarkdownPage;
