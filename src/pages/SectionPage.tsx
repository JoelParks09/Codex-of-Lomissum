import NavigationBar from '../components/NavigationBar';

type SectionPageProps = {
  title: string;
};

function SectionPage({ title }: SectionPageProps) {
  return (
    <main className="app-shell page-shell">
      <NavigationBar />
      <section className="page-panel" aria-labelledby="section-title">
        <h1 id="section-title">{title}</h1>
        <p>This page is ready for your {title.toLowerCase()} content.</p>
      </section>
    </main>
  );
}

export default SectionPage;
