import { NextRequest, NextResponse } from 'next/server';

interface CachedEntry {
  timestamp: number;
  data: GitHubUserSummary[];
}

interface GitHubUserSummary {
  login: string;
  avatar_url: string;
  html_url: string;
}

const cache = new Map<string, CachedEntry>();
const CACHE_TTL_MS = 60 * 1000; // 60 secondes

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const q = searchParams.get('q')?.trim();

  if (!q || q.length < 2) {
    return NextResponse.json({ users: [] });
  }

  const cacheKey = q.toLowerCase();
  const cached = cache.get(cacheKey);
  if (cached && Date.now() - cached.timestamp < CACHE_TTL_MS) {
    return NextResponse.json({ users: cached.data, cached: true });
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
      { headers, next: { revalidate: 60 } }
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

    return NextResponse.json({ users });
  } catch (error) {
    console.error('Erreur recherche utilisateurs GitHub :', error);
    return NextResponse.json({ users: [], error: 'Erreur réseau interne' }, { status: 500 });
  }
}
