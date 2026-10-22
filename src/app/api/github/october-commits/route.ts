import { NextRequest, NextResponse } from 'next/server';

interface CachedCommits {
  timestamp: number;
  data: {
    username: string;
    userExists: boolean;
    name: string | null;
    avatar_url: string | null;
    commits: number;
    year: number;
    month: string;
    message?: string;
  };
}

const commitCache = new Map<string, CachedCommits>();
const CACHE_TTL_MS = 5 * 60 * 1000; // 5 minutes en mémoire serveur

const CACHE_HEADERS = {
  'Cache-Control': 'public, max-age=60, s-maxage=300, stale-while-revalidate=86400',
  'CDN-Cache-Control': 'public, s-maxage=300, stale-while-revalidate=86400',
  'Vercel-CDN-Cache-Control': 'public, s-maxage=300, stale-while-revalidate=86400',
};

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const rawUsername = searchParams.get('username')?.trim();
  const currentYear = new Date().getFullYear();
  const yearParam = searchParams.get('year');
  const year = yearParam ? parseInt(yearParam, 10) || currentYear : currentYear;

  if (!rawUsername) {
    return NextResponse.json({ error: 'Le paramètre username est requis.' }, { status: 400 });
  }

  const username = rawUsername.replace(/^@/, '');
  const cacheKey = `${username.toLowerCase()}-${year}`;
  const cached = commitCache.get(cacheKey);
  if (cached && Date.now() - cached.timestamp < CACHE_TTL_MS) {
    return NextResponse.json({ ...cached.data, cached: true }, { headers: CACHE_HEADERS });
  }

  try {
    const headers: Record<string, string> = {
      Accept: 'application/vnd.github.cloak-preview+json, application/vnd.github.v3+json',
      'User-Agent': 'Hackathon-Team-Balancer',
    };

    if (process.env.GITHUB_TOKEN) {
      headers.Authorization = `Bearer ${process.env.GITHUB_TOKEN}`;
    }

    const dateRange = `${year}-10-01..${year}-10-31`;
    const searchUrl = `https://api.github.com/search/commits?q=author:${encodeURIComponent(
      username
    )}+author-date:${dateRange}`;
    const userUrl = `https://api.github.com/users/${encodeURIComponent(username)}`;

    // Requêtes parallèles simultanées : divise par 2 le temps d'attente réseau vers GitHub
    const [userProfileRes, commitsRes] = await Promise.all([
      fetch(userUrl, { headers, next: { revalidate: 180 } }),
      fetch(searchUrl, { headers, next: { revalidate: 180 } }),
    ]);

    // 1. Profil introuvable (404)
    if (userProfileRes.status === 404) {
      const notFoundPayload = {
        username,
        userExists: false,
        name: null,
        avatar_url: null,
        commits: 0,
        year,
        month: 'octobre',
        message: `Le profil GitHub "@${username}" est introuvable.`,
      };
      commitCache.set(cacheKey, { timestamp: Date.now(), data: notFoundPayload });
      return NextResponse.json(notFoundPayload, { headers: CACHE_HEADERS });
    }

    // Rate limit éventuel
    if (userProfileRes.status === 403 || userProfileRes.status === 429) {
      return NextResponse.json(
        {
          username,
          userExists: true,
          commits: null,
          rateLimited: true,
          message: 'Limite de requêtes GitHub atteinte. Vous pouvez saisir les commits manuellement.',
        },
        { status: 200 }
      );
    }

    const userData = await userProfileRes.json();
    const canonicalLogin: string = userData.login || username;
    const displayName: string | null = userData.name || userData.login || null;
    const avatarUrl: string = userData.avatar_url || `https://github.com/${canonicalLogin}.png`;

    if (commitsRes.status === 403 || commitsRes.status === 429) {
      return NextResponse.json(
        {
          username: canonicalLogin,
          userExists: true,
          name: displayName,
          avatar_url: avatarUrl,
          commits: null,
          rateLimited: true,
          message: 'Limite de requêtes GitHub atteinte. Vous pouvez saisir les commits manuellement.',
        },
        { status: 200 }
      );
    }

    let commitsCount = 0;
    if (commitsRes.ok) {
      const commitData = await commitsRes.json();
      const rawCount = typeof commitData.total_count === 'number' ? commitData.total_count : 0;
      const items: Array<{
        author?: { login?: string };
        committer?: { login?: string };
        commit?: { author?: { name?: string } };
      }> = commitData.items || [];

      // Détection anti-faux positifs :
      // GitHub Search API omet silencieusement le filtre author: si l'auteur n'a aucun commit répertorié
      // et renvoie tous les commits de la planète pour ce mois-là (> 500 millions !).
      if (items.length > 0) {
        const hasMatchingAuthor = items.some(
          (item) =>
            item.author?.login?.toLowerCase() === canonicalLogin.toLowerCase() ||
            item.committer?.login?.toLowerCase() === canonicalLogin.toLowerCase() ||
            (item.commit?.author?.name &&
              item.commit.author.name.toLowerCase().includes(canonicalLogin.toLowerCase()))
        );

        if (!hasMatchingAuthor) {
          commitsCount = 0;
        } else {
          commitsCount = rawCount;
        }
      } else {
        commitsCount = rawCount > 10000 ? 0 : rawCount;
      }
    }

    const payload = {
      username: canonicalLogin,
      userExists: true,
      name: displayName,
      avatar_url: avatarUrl,
      commits: commitsCount,
      year,
      month: 'octobre',
    };

    commitCache.set(cacheKey, { timestamp: Date.now(), data: payload });

    return NextResponse.json(payload, { headers: CACHE_HEADERS });
  } catch (error) {
    console.error('Erreur lors du calcul des commits d\'octobre :', error);
    return NextResponse.json(
      {
        username,
        userExists: true,
        commits: null,
        error: 'Erreur réseau lors de la récupération des commits GitHub.',
      },
      { status: 500 }
    );
  }
}
