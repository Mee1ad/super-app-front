# Replicache Cookie/LastMutationID Synchronization Issue

## Error Description
We're getting this error in our frontend:
```
Error: name=todo-replicache-flat "pull" "requestID=r0a7kv2t8r1adkrhra-dd162a22-0" "handlePullResponse: cookie null did not change, but lastMutationIDChanges is not empty"
```

## Root Cause
The backend pull endpoint is returning `cookie: null` while also returning `lastMutationID` values. This violates Replicache's expectation that when the cookie doesn't change, there should be no `lastMutationIDChanges` in the response.

## Required Fix
The backend pull endpoint needs to:

1. **Return a proper cookie** instead of `null` - the cookie should contain state information like:
   ```json
   {
     "lastMutationID": 123,
     "timestamp": 1703123456789,
     "userId": "user123",
     "clientGroupID": "todo-replicache-flat"
   }
   ```

2. **Ensure cookie consistency** - the cookie should reflect the current state and change when the state changes

3. **Handle cookie parsing** in the push endpoint to understand the current state

## Expected Response Format
```json
{
  "lastMutationID": 123,
  "cookie": "{\"lastMutationID\":123,\"timestamp\":1703123456789,\"userId\":\"user123\",\"clientGroupID\":\"todo-replicache-flat\"}",
  "patch": []
}
```

## Current Issue
- Backend returns `cookie: null` 
- But also returns `lastMutationID: 123`
- Replicache expects: if cookie doesn't change, then lastMutationID should not change either

## Action Required
Please update the backend pull endpoint to return a proper cookie that reflects the current state, and ensure the push endpoint can parse and handle this cookie properly. 