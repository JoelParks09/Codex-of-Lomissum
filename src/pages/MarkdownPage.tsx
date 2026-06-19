import { useEffect, useState } from 'react';
import { Navigate, useParams } from 'react-router-dom';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import ImageModal from '../components/ImageModal';
import MarkdownSideNav from '../components/MarkdownSideNav';
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
          <ImageModal
            alt={`${page.title} map enlarged preview`}
            ariaLabel={`${page.title} map preview`}
            src={page.mapImageSrc}
            onClose={() => setIsMapModalOpen(false)}
          />
        )}

        <MarkdownSideNav
          childPages={childPages}
          childPanelTitle={childPanelTitle}
          pageTitle={page.title}
          sectionHeadings={sectionHeadings}
        />
      </div>
    </main>
  );
}

export default MarkdownPage;
