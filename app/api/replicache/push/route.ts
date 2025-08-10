import { NextRequest, NextResponse } from 'next/server';
import { getLastMutationID, setLastMutationID } from '../state';

// Helper: Validate the push request schema
function validatePushSchema(body: any) {
  if (
    typeof body !== 'object' ||
    typeof body.clientID !== 'string' ||
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

    const { mutations, clientID, clientGroupID, profileID, cookie } = body;
    console.log(`[Replicache /push] clientID: ${clientID}, clientGroupID: ${clientGroupID}, profileID: ${profileID}, mutations: ${mutations.length}`);
    console.log('Push request - clientID:', clientID, 'clientGroupID:', clientGroupID, 'profileID:', profileID, 'cookie:', cookie, 'with', mutations.length, 'mutations');

    // Parse cookie to get current state info
    let currentCookieInfo = null;
    if (cookie) {
      try {
        currentCookieInfo = JSON.parse(cookie);
        console.log('Current cookie info:', currentCookieInfo);
      } catch (error) {
        console.warn('Could not parse cookie:', error);
      }
    }

    // Per Replicache spec, lastMutationID is per-client (clientID), not per profile/group
    const trackingKey = clientID as string;
    const currentLastMutationID = getLastMutationID(trackingKey);
    let newLastMutationID = currentLastMutationID;

    // Route mutations by clientGroupID instead of mutation names
    for (const mutation of mutations) {
      const { name, timestamp, id } = mutation;
      // Normalize args.variant to lowercase strings expected by backend
      const rawArgs = (mutation as any).args;
      let args = rawArgs;
      if (rawArgs && typeof rawArgs === 'object') {
        args = { ...rawArgs };
        if ('variant' in args && typeof args.variant === 'string') {
          const v = args.variant.toLowerCase();
          if (v === 'default' || v === 'outlined' || v === 'filled') {
            args.variant = v;
          }
        }
      }
      if (typeof timestamp !== 'number') {
        console.warn('Mutation missing valid timestamp:', mutation);
        continue;
      }
      console.log(`Processing mutation: ${name} with args:`, args, 'timestamp:', timestamp, 'id:', id);
      
      // Route by clientGroupID to identify data type
      if (clientGroupID === 'todo-replicache-flat') {
        console.log(`Processing todo mutation: ${name}`);
        // await process_todo_mutation(mutation, user_id);
      } else if (clientGroupID === 'food-tracker-replicache') {
        console.log(`Processing food mutation: ${name}`);
        // await process_food_mutation(mutation, user_id);
      } else if (clientGroupID === 'diary-replicache') {
        console.log(`Processing diary mutation: ${name}`);
        // await process_diary_mutation(mutation, user_id);
      } else if (clientGroupID === 'ideas-replicache') {
        console.log(`Processing ideas mutation: ${name}`);
        // await process_ideas_mutation(mutation, user_id);
      } else {
        console.warn(`Unknown clientGroupID: ${clientGroupID}`);
      }
      
      // Update the last mutation ID to the highest one we've seen
      if (id && typeof id === 'number' && id > newLastMutationID) {
        newLastMutationID = id;
      }
    }

    // Update the tracking
    setLastMutationID(trackingKey, newLastMutationID);
    console.log(`Updated lastMutationID from ${currentLastMutationID} to ${newLastMutationID} for client group: ${clientGroupID}`);

    // Return the last mutation ID we processed
    const response = {
      lastMutationID: newLastMutationID
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