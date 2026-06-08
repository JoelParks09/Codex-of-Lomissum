import { players } from './players';

export type PageType = 'world' | 'continent' | 'region' | 'city' | 'page';

export type MarkdownPageRecord = {
  routePath: string;
  title: string;
  markdown: string;
  pageType: PageType;
  metadata: Record<string, string>;
  mapImageSrc?: string;
};

export type SearchPage = {
  title: string;
  path: string;
  category: string;
};

const markdownFiles = import.meta.glob('../worlds/**/*.md', {
  query: '?raw',
  import: 'default',
  eager: true,
}) as Record<string, string>;

const mapImages = import.meta.glob('../assets/maps/*', {
  eager: true,
  query: '?url',
  import: 'default',
}) as Record<string, string>;

export const markdownPageRecords: MarkdownPageRecord[] = Object.entries(markdownFiles)
  .map(([filePath, rawMarkdown]) => {
    const { metadata, markdown } = parseFrontmatter(rawMarkdown);
    const pageType =
      (filePath.match(/\/(world|continent|region|city)\.md$/)?.[1] as PageType) ??
      'page';
    const routePath = filePath
      .replace('../worlds/', '')
      .replace(/\/(world|continent|region|city)\.md$/, '');

    return {
      routePath,
      title: getTitle(markdown, routePath),
      markdown,
      pageType,
      metadata,
      mapImageSrc: getMapImageSrc(metadata.image),
    };
  })
  .sort((firstPage, secondPage) =>
    firstPage.title.localeCompare(secondPage.title),
  );

export const searchablePages: SearchPage[] = [
  {
    title: 'Codex of Lomissum',
    path: '/',
    category: 'Home',
  },
  {
    title: 'Spheres of Orion',
    path: '/worlds',
    category: 'Worlds',
  },
  {
    title: 'Heroes of the Spheres',
    path: '/heroes',
    category: 'Heroes',
  },
  {
    title: 'Campaigns',
    path: '/campaigns',
    category: 'Campaigns',
  },
  ...players.map((player) => ({
    title: player.name,
    path: `/heroes/${player.slug}`,
    category: 'Hero',
  })),
  ...markdownPageRecords.map((page) => ({
    title: page.title,
    path: `/worlds/${page.routePath}`,
    category: getPageTypeLabel(page.pageType),
  })),
];

function getTitle(markdown: string, routePath: string) {
  const heading = markdown
    .split('\n')
    .find((line) => line.trim().startsWith('# '))
    ?.replace(/^#\s+/, '')
    .trim();

  return heading ?? titleFromPath(routePath);
}

function parseFrontmatter(markdown: string) {
  if (!markdown.startsWith('---')) {
    return {
      metadata: {},
      markdown,
    };
  }

  const lines = markdown.split('\n');
  const closingIndex = lines.findIndex((line, index) => index > 0 && line.trim() === '---');

  if (closingIndex === -1) {
    return {
      metadata: {},
      markdown,
    };
  }

  const metadata = lines.slice(1, closingIndex).reduce<Record<string, string>>(
    (fields, line) => {
      const separatorIndex = line.indexOf(':');

      if (separatorIndex === -1) {
        return fields;
      }

      const key = line.slice(0, separatorIndex).trim();
      const value = line.slice(separatorIndex + 1).trim().replace(/^['"]|['"]$/g, '');

      if (key && value) {
        fields[key] = value;
      }

      return fields;
    },
    {},
  );

  return {
    metadata,
    markdown: lines.slice(closingIndex + 1).join('\n').trimStart(),
  };
}

function getMapImageSrc(imageName?: string) {
  if (!imageName) {
    return undefined;
  }

  const normalizedImageName = imageName.split('/').at(-1);

  return mapImages[`../assets/maps/${normalizedImageName}`];
}

function titleFromPath(path: string) {
  return path
    .split('/')
    .at(-1)!
    .split('-')
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
}

function getPageTypeLabel(pageType: PageType) {
  if (pageType === 'world') {
    return 'World';
  }

  if (pageType === 'continent') {
    return 'Continent';
  }

  if (pageType === 'region') {
    return 'Region';
  }

  if (pageType === 'city') {
    return 'City';
  }

  return 'Page';
}
