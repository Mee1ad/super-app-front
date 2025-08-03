# Backend Replicache Handler Update

## Current Issue
Frontend Replicache instances are using client names for routing, but backend is using mutation name prefixes. This causes "Invalid puller result" errors.

## Required Changes

### 1. Update Push Handler

**Current (mutation prefixes):**
```python
async def replicache_push(request: Request) -> Dict[str, Any]:
    mutations = body.get('mutations', [])
    
    for mutation in mutations:
        mutation_name = mutation.get('name', '')
        
        # Route to appropriate context handler
        if mutation_name.startswith('todo-'):
            await process_todo_mutation(mutation, user_id)
        elif mutation_name.startswith('food-'):
            await process_food_mutation(mutation, user_id)
        elif mutation_name.startswith('diary-'):
            await process_diary_mutation(mutation, user_id)
        elif mutation_name.startswith('ideas-'):
            await process_ideas_mutation(mutation, user_id)
```

**New (clientGroupID routing):**
```python
async def replicache_push(request: Request) -> Dict[str, Any]:
    body = await request.json()
    mutations = body.get('mutations', [])
    client_group_id = body.get('clientGroupID', '')
    profile_id = body.get('profileID', '')
    
    print(f"Push request - profileID: {profile_id}, clientGroupID: {client_group_id}")
    
    for mutation in mutations:
        mutation_name = mutation.get('name', '')
        
        # Route by clientGroupID instead of mutation prefix
        if client_group_id == 'todo-replicache-flat':
            await process_todo_mutation(mutation, user_id)
        elif client_group_id == 'food-tracker-replicache':
            await process_food_mutation(mutation, user_id)
        elif client_group_id == 'diary-replicache':
            await process_diary_mutation(mutation, user_id)
        elif client_group_id == 'ideas-replicache':
            await process_ideas_mutation(mutation, user_id)
        else:
            logger.warning(f"Unknown clientGroupID: {client_group_id}")
```

### 2. Update Pull Handler

**Current:**
```python
async def replicache_pull(request: Request) -> Dict[str, Any]:
    # Generic response for all clients
    return {
        "lastMutationID": 0,
        "cookie": None,
        "patch": []
    }
```

**New:**
```python
async def replicache_pull(request: Request) -> Dict[str, Any]:
    body = await request.json()
    client_group_id = body.get('clientGroupID', '')
    profile_id = body.get('profileID', '')
    
    print(f"Pull request - profileID: {profile_id}, clientGroupID: {client_group_id}")
    
    # Route data based on clientGroupID
    if client_group_id == 'todo-replicache-flat':
        patch = await get_todo_patch(user_id)
    elif client_group_id == 'food-tracker-replicache':
        patch = await get_food_patch(user_id)
    elif client_group_id == 'diary-replicache':
        patch = await get_diary_patch(user_id)
    elif client_group_id == 'ideas-replicache':
        patch = await get_ideas_patch(user_id)
    else:
        logger.warning(f"Unknown clientGroupID: {client_group_id}")
        patch = []
    
    return {
        "lastMutationID": 0,
        "cookie": None,
        "patch": patch
    }
```

## Frontend Client Names (clientGroupID values)

These are the exact clientGroupID values used by frontend:

- `todo-replicache-flat` - Todo items
- `food-tracker-replicache` - Food entries  
- `diary-replicache` - Diary entries
- `ideas-replicache` - Ideas

## Mutation Names by Client

### Todo Client (`todo-replicache-flat`)
- `createItem`
- `updateItem` 
- `deleteItem`

### Food Client (`food-tracker-replicache`)
- `createEntry`
- `updateEntry`
- `deleteEntry`

### Diary Client (`diary-replicache`)
- `createEntry`
- `updateEntry`
- `deleteEntry`

### Ideas Client (`ideas-replicache`)
- `createIdea`
- `updateIdea`
- `deleteIdea`

## Replicache Request Structure

Replicache sends these fields in requests:
- `profileID`: User profile identifier
- `clientGroupID`: The Replicache instance name (e.g., 'food-tracker-replicache')
- `mutations`: Array of mutations (for push requests)
- `lastPulledVersion`: Version number (for pull requests)

## Benefits of This Change

1. **Follows Replicache Best Practices** - Uses correct request fields
2. **Cleaner Code** - All mutations for a data type grouped together
3. **Better Error Handling** - Clear unknown client detection
4. **Easier Maintenance** - Add new data types by adding one case
5. **Fixes Current Errors** - Resolves "Invalid puller result" errors

## Testing

After implementing, test each client:
1. Create/update/delete todo items
2. Create/update/delete food entries
3. Create/update/delete diary entries  
4. Create/update/delete ideas

All should work without "Invalid puller result" errors. 