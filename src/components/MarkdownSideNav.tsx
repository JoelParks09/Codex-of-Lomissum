import { Link } from 'react-router-dom';

type ChildPageLink = {
  routePath: string;
  title: string;
};

type SectionHeading = {
  id: string;
  title: string;
};

type MarkdownSideNavProps = {
  childPages: ChildPageLink[];
  childPanelTitle: string;
  pageTitle: string;
  sectionHeadings: SectionHeading[];
};

function MarkdownSideNav({
  childPages,
  childPanelTitle,
  pageTitle,
  sectionHeadings,
}: MarkdownSideNavProps) {
  if (childPages.length === 0 && sectionHeadings.length === 0) {
    return null;
  }

  return (
    <aside className="markdown-side-nav" aria-label={`${pageTitle} navigation`}>
      {childPages.length > 0 && (
        <section className="side-nav-panel" aria-label={`${pageTitle} child pages`}>
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
        <section className="side-nav-panel" aria-label={`${pageTitle} sections`}>
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
  );
}

export default MarkdownSideNav;
