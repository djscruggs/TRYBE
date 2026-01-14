import { type ActionFunctionArgs } from 'react-router';
import { requireCurrentUser } from '~/models/auth.server';
import { prisma } from '~/models/prisma.server';

export async function action(args: ActionFunctionArgs): Promise<Response> {
  // Require authentication
  const currentUser = await requireCurrentUser(args);

  if (!currentUser) {
    return Response.json(
      { error: 'Unauthorized', message: 'User not authenticated' },
      { status: 401 }
    );
  }

  // Parse request body
  let body: { token?: string };
  try {
    const text = await args.request.text();
    body = JSON.parse(text);
  } catch (error) {
    return Response.json(
      { error: 'Bad Request', message: 'Invalid JSON in request body' },
      { status: 400 }
    );
  }

  const { token } = body;

  // Validate token format
  if (!token || !token.startsWith('ExponentPushToken[')) {
    return Response.json(
      { error: 'Bad Request', message: 'Invalid push token format' },
      { status: 400 }
    );
  }

  try {
    // Upsert token to database
    await prisma.pushToken.upsert({
      where: { token },
      create: {
        userId: currentUser.id,
        token,
        lastUsedAt: new Date()
      },
      update: {
        lastUsedAt: new Date(),
        updatedAt: new Date()
      }
    });

    return Response.json({ success: true }, { status: 200 });
  } catch (error) {
    console.error('Error storing push token:', error);
    return Response.json(
      { error: 'Internal Server Error', message: 'Failed to store push token' },
      { status: 500 }
    );
  }
}
