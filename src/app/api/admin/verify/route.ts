import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { password } = body;

    const expectedPassword = process.env.ADMIN_PASSWORD || 'hackathon2026';

    if (!password || typeof password !== 'string') {
      return NextResponse.json(
        { success: false, error: 'Veuillez saisir un mot de passe valide.' },
        { status: 400 }
      );
    }

    if (password.trim() === expectedPassword.trim()) {
      // Génère une signature de session simple valide pour la session du navigateur
      const sessionToken = Buffer.from(`admin:${Date.now()}:${Math.random().toString(36).substring(2)}`).toString('base64');
      return NextResponse.json({
        success: true,
        message: 'Accès organisateur validé.',
        token: sessionToken,
      });
    }

    return NextResponse.json(
      { success: false, error: 'Mot de passe organisateur incorrect.' },
      { status: 401 }
    );
  } catch (error) {
    console.error('Erreur vérification mot de passe admin :', error);
    return NextResponse.json(
      { success: false, error: 'Erreur lors de la vérification.' },
      { status: 500 }
    );
  }
}
