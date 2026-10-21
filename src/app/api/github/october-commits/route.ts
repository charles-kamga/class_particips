import { NextRequest, NextResponse } from 'next/server';

interface CachedCommits {
  timestamp: number;
  data: {
    username: string;
    name: string | null;
    avatar_url: string;
    commits: number;
    year: number;
    month: string;
  };
}

const commitCache = new Map<string, CachedCommits>();
const CACHE_TTL_MS = 2 * 60 * 1000; // 2 minutes

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const username = searchParams.get('username')?.trim();
  const currentYear = new Date().getFullYear();
  const yearParam = searchParams.get('year');
  const year = yearParam ? parseInt(yearParam, 10) || currentYear : currentYear;

  if (!username) {
    return NextResponse.json({ error: 'Le paramètre username est requis.' }, { status: 400 });
  }

  const cacheKey = `${username.toLowerCase()}-${year}`;
  const cached = commitCache.get(cacheKey);
  if (cached && Date.now() - cached.timestamp < CACHE_TTL_MS) {
    return NextResponse.json({ ...cached.data, cached: true });
  }

  try {
    const headers: Record<string, string> = {
      Accept: 'application/vnd.github.cloak-preview+json, application/vnd.github.v3+json',
      'User-Agent': 'Hackathon-Team-Balancer',
    };

    if (process.env.GITHUB_TOKEN) {
      headers.Authorization = `Bearer ${process.env.GITHUB_TOKEN}`;
    }

    // 1. Récupération des commits d'octobre via l'API Search Commits
    // Plage stricte : du 1er octobre au 31 octobre de l'année sélectionnée
    const dateRange = `${year}-10-01..${year}-10-31`;
    const searchUrl = `https://api.github.com/search/commits?q=author:${encodeURIComponent(
      username
    )}+author-date:${dateRange}`;

    const [commitsRes, userProfileRes] = await Promise.all([
      fetch(searchUrl, { headers, next: { revalidate: 60 } }),
      fetch(`https://api.github.com/users/${encodeURIComponent(username)}`, {
        headers,
        next: { revalidate: 120 },
      }),
    ]);

    // Gestion du rate-limiting
    if (commitsRes.status === 403 || commitsRes.status === 429) {
      return NextResponse.json(
        {
          username,
          commits: null,
          rateLimited: true,
          message:
            'Limite de requêtes GitHub atteinte. Vous pouvez saisir les commits manuellement.',
        },
        { status: 200 }
      );
    }

    let commitsCount = 0;
    if (commitsRes.ok) {
      const commitData = await commitsRes.json();
      commitsCount = typeof commitData.total_count === 'number' ? commitData.total_count : 0;
    }

    let displayName: string | null = null;
    let avatarUrl = `https://github.com/${username}.png`;

    if (userProfileRes.ok) {
      const userData = await userProfileRes.json();
      displayName = userData.name || userData.login || null;
      if (userData.avatar_url) {
        avatarUrl = userData.avatar_url;
      }
    }

    const payload = {
      username,
      name: displayName,
      avatar_url: avatarUrl,
      commits: commitsCount,
      year,
      month: 'octobre',
    };

    commitCache.set(cacheKey, { timestamp: Date.now(), data: payload });

    return NextResponse.json(payload);
  } catch (error) {
    console.error('Erreur lors du calcul des commits d\'octobre :', error);
    return NextResponse.json(
      {
        username,
        commits: null,
        error: 'Erreur réseau lors de la récupération des commits GitHub.',
      },
      { status: 500 }
    );
  }
}
