import { NextRequest, NextResponse } from 'next/server';

interface CachedEntry {
  timestamp: number;
  data: GitHubUserSummary[];
}

export interface GitHubUserSummary {
  login: string;
  avatar_url: string;
  html_url: string;
}

const cache = new Map<string, CachedEntry>();
const CACHE_TTL_MS = 5 * 60 * 1000; // 5 minutes en mémoire serveur

const CACHE_HEADERS = {
  'Cache-Control': 'public, max-age=60, s-maxage=300, stale-while-revalidate=86400',
  'CDN-Cache-Control': 'public, s-maxage=300, stale-while-revalidate=86400',
  'Vercel-CDN-Cache-Control': 'public, s-maxage=300, stale-while-revalidate=86400',
};

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const q = searchParams.get('q')?.trim();

  if (!q || q.length < 2) {
    return NextResponse.json({ users: [] }, { headers: CACHE_HEADERS });
  }

  const cacheKey = q.toLowerCase();
  const cached = cache.get(cacheKey);
  if (cached && Date.now() - cached.timestamp < CACHE_TTL_MS) {
    return NextResponse.json({ users: cached.data, cached: true }, { headers: CACHE_HEADERS });
  }

  try {
    const headers: Record<string, string> = {
      Accept: 'application/vnd.github.v3+json',
      'User-Agent': 'Hackathon-Team-Balancer',
    };

    if (process.env.GITHUB_TOKEN) {
      headers.Authorization = `Bearer ${process.env.GITHUB_TOKEN}`;
    }

    const res = await fetch(
      `https://api.github.com/search/users?q=${encodeURIComponent(q)}+in:login&per_page=6`,
      { headers, next: { revalidate: 180 } }
    );

    if (res.status === 403 || res.status === 429) {
      return NextResponse.json(
        {
          users: [],
          rateLimited: true,
          message: 'Quota de requêtes GitHub atteint. Vous pouvez saisir le pseudo manuellement.',
        },
        { status: 200 }
      );
    }

    if (!res.ok) {
      return NextResponse.json(
        { users: [], error: `GitHub API error: ${res.status}` },
        { status: res.status }
      );
    }

    const data = await res.json();
    const users: GitHubUserSummary[] = (data.items || []).map((item: { login: string; avatar_url: string; html_url: string }) => ({
      login: item.login,
      avatar_url: item.avatar_url,
      html_url: item.html_url,
    }));

    cache.set(cacheKey, { timestamp: Date.now(), data: users });

    return NextResponse.json({ users }, { headers: CACHE_HEADERS });
  } catch (error) {
    console.error('Erreur recherche utilisateurs GitHub :', error);
    return NextResponse.json({ users: [], error: 'Erreur réseau interne' }, { status: 500 });
  }
}
