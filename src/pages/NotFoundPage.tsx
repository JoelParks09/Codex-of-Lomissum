import NavigationBar from '../components/NavigationBar';

function NotFoundPage() {
  return (
    <main className="app-shell page-shell">
      <NavigationBar />
      <section className="page-panel" aria-labelledby="not-found-title">
        <h1 id="not-found-title">Page Not Found</h1>
        <p>The page URL does not match any page in the Codex.</p>
      </section>
    </main>
  );
}

export default NotFoundPage;
