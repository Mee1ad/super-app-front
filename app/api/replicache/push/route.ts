import { NextRequest, NextResponse } from 'next/server';

// Helper: Validate the push request schema
function validatePushSchema(body: any) {
  if (
    typeof body !== 'object' ||
    typeof body.clientID !== 'string' ||
    typeof body.cookie !== 'string' ||
    !Array.isArray(body.mutations)
  ) {
    return false;
  }
  for (const mutation of body.mutations) {
    if (typeof mutation !== 'object' || typeof mutation.timestamp !== 'number') {
      return false;
    }
  }
  return true;
}

export async function POST(req: NextRequest) {
  try {
    // TODO: Re-enable authentication when user is logged in
    // const authHeader = req.headers.get('authorization');
    // const authCookie = req.cookies.get('auth_token')?.value;
    // const token = authHeader?.replace('Bearer ', '') || authCookie;
    // 
    // if (!token) {
    //   return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    // }

    const body = await req.json();
    console.log('[Replicache /push] Received body:', JSON.stringify({ ...body, mutations: body.mutations ? `[${body.mutations.length} mutations]` : undefined }));

    // Enforce best practice schema
    if (!validatePushSchema(body)) {
      return NextResponse.json({ error: 'Invalid push schema' }, { status: 400 });
    }

    const { mutations, clientID, cookie } = body;
    console.log(`[Replicache /push] clientID: ${clientID}, mutations: ${mutations.length}`);
    console.log('Push request - clientID:', clientID, 'cookie:', cookie, 'with', mutations.length, 'mutations');

    // Route mutations by their names since we can't rely on cookies
    for (const mutation of mutations) {
      const { name, args, timestamp } = mutation;
      if (typeof timestamp !== 'number') {
        console.warn('Mutation missing valid timestamp:', mutation);
        continue;
      }
      console.log(`Processing mutation: ${name} with args:`, args, 'timestamp:', timestamp);
      // Route by mutation name to identify data type
      switch (name) {
        // Food mutations
        case 'createEntry':
        case 'updateEntry':
        case 'deleteEntry':
          console.log(`Processing food mutation: ${name}`);
          // await process_food_mutation(mutation, user_id);
          break;
        // Todo mutations  
        case 'createItem':
        case 'updateItem':
        case 'deleteItem':
        case 'createList':
        case 'updateList':
        case 'deleteList':
        case 'createTask':
        case 'updateTask':
        case 'deleteTask':
        case 'reorderTasks':
        case 'reorderItems':
          console.log(`Processing todo mutation: ${name}`);
          // await process_todo_mutation(mutation, user_id);
          break;
        // Ideas mutations
        case 'createIdea':
        case 'updateIdea':
        case 'deleteIdea':
          console.log(`Processing ideas mutation: ${name}`);
          // await process_ideas_mutation(mutation, user_id);
          break;
        default:
          console.warn(`Unknown mutation: ${name}`);
      }
    }

    // For now, just acknowledge the mutations
    // In a real implementation, this would process mutations and sync with your backend
    const response = {
      lastMutationID: mutations.length > 0 ? mutations[mutations.length - 1].id : 0
    };
    console.log('[Replicache /push] Responding with lastMutationID:', response.lastMutationID);
    return NextResponse.json(response);
  } catch (error) {
    console.error('Replicache push error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}