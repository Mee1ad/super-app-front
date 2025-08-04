"use client";
import React, { createContext, useContext, useEffect, useRef, ReactNode } from "react";

interface SharedSSEManager {
  addListener: (callback: (event: string) => void) => () => void;
  isConnected: () => boolean;
}

const SharedSSEManagerContext = createContext<SharedSSEManager | null>(null);

export function SharedSSEManagerProvider({ children }: { children: ReactNode }) {
  const controllerRef = useRef<AbortController | null>(null);
  const listenersRef = useRef<Set<(event: string) => void>>(new Set());
  const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const isConnectingRef = useRef(false);
  const lastSyncTimeRef = useRef(0);

  const setupSSE = () => {
    if (typeof window === 'undefined') return;
    
    // Prevent multiple simultaneous connections
    if (isConnectingRef.current) {
      console.log('[SharedSSE] Connection already in progress, skipping');
      return;
    }
    
    isConnectingRef.current = true;

    // Get user ID from auth system or fallback to anonymous
    let userId = 'anonymous';
    const userStr = localStorage.getItem('auth_user');
    if (userStr) {
      try {
        const user = JSON.parse(userStr);
        userId = user.id || user.user_id || 'anonymous';
        console.log('[SharedSSE] Using authenticated user ID:', userId);
      } catch (error) {
        console.log('[SharedSSE] Could not parse auth user, using anonymous');
      }
    }

    const backendUrl = process.env.NEXT_PUBLIC_BASE_API_URL;
    if (!backendUrl) {
      console.error('[SharedSSE] No backend URL configured');
      isConnectingRef.current = false;
      return;
    }

    // Close existing connection if any
    if (controllerRef.current) {
      console.log('[SharedSSE] Closing existing connection');
      controllerRef.current.abort();
    }

    // Get auth token for authorization header
    const authToken = localStorage.getItem('auth_access_token');
    const headers: HeadersInit = {
      'Accept': 'text/event-stream',
      'Cache-Control': 'no-cache',
    };
    
    if (authToken) {
      headers['Authorization'] = `Bearer ${authToken}`;
    }

    console.log('[SharedSSE] Setting up new SSE connection for user:', userId);
    
    // Use fetch with streaming instead of EventSource to support custom headers
    const controller = new AbortController();
    controllerRef.current = controller;
    
    fetch(`${backendUrl}/replicache/stream?userId=${userId}`, {
      method: 'GET',
      headers,
      signal: controller.signal,
    }).then(response => {
      if (!response.ok) {
        throw new Error(`SSE connection failed: ${response.status}`);
      }
      
      console.log('[SharedSSE] Connection opened for user:', userId);
      isConnectingRef.current = false;
      
      const reader = response.body?.getReader();
      const decoder = new TextDecoder();
      
      if (!reader) {
        throw new Error('No response body');
      }
      
      const processStream = () => {
        reader.read().then(({ done, value }) => {
          if (done) {
            console.log('[SharedSSE] Stream ended');
            isConnectingRef.current = false;
            return;
          }
          
          const chunk = decoder.decode(value, { stream: true });
          const lines = chunk.split('\n');
          
          for (const line of lines) {
            if (line.startsWith('data: ')) {
              const data = line.slice(6); // Remove 'data: ' prefix
              console.log('[SharedSSE] Message received:', data);
              
              // Debounce sync messages to prevent excessive pulls
              if (data === 'sync') {
                const now = Date.now();
                if (now - lastSyncTimeRef.current > 1000) { // Only allow sync every 1 second
                  lastSyncTimeRef.current = now;
                  console.log('[SharedSSE] Debounced sync message, notifying listeners');
                  
                  // Notify all listeners
                  listenersRef.current.forEach(callback => {
                    try {
                      callback(data);
                    } catch (error) {
                      console.error('[SharedSSE] Error in listener callback:', error);
                    }
                  });
                } else {
                  console.log('[SharedSSE] Sync message ignored (too frequent)');
                }
              } else {
                // For non-sync messages, notify immediately
                listenersRef.current.forEach(callback => {
                  try {
                    callback(data);
                  } catch (error) {
                    console.error('[SharedSSE] Error in listener callback:', error);
                  }
                });
              }
            }
          }
          
          // Continue reading
          processStream();
        }).catch(error => {
          console.error('[SharedSSE] Stream error:', error);
          isConnectingRef.current = false;
        });
      };
      
      processStream();
      
    }).catch(error => {
      console.error('[SharedSSE] Connection error:', error);
      isConnectingRef.current = false;
      
      // Only attempt to reconnect if we're not already trying to connect
      if (!isConnectingRef.current && reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current);
      }
      reconnectTimeoutRef.current = setTimeout(() => {
        console.log('[SharedSSE] Attempting to reconnect...');
        setupSSE();
      }, 5000);
    });
  };

  const addListener = (callback: (event: string) => void) => {
    listenersRef.current.add(callback);
    
    // Return cleanup function
    return () => {
      listenersRef.current.delete(callback);
    };
  };

  const isConnected = () => {
    return controllerRef.current ? !controllerRef.current.signal.aborted : false;
  };

  // Initial setup
  useEffect(() => {
    setupSSE();

    // Listen for auth data updates
    const handleAuthDataUpdate = () => {
      console.log('[SharedSSE] Auth data updated, reconnecting with new user ID');
      setupSSE();
    };
    
    window.addEventListener('authDataUpdated', handleAuthDataUpdate as EventListener);
    
    return () => {
      if (controllerRef.current) {
        controllerRef.current.abort();
      }
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current);
      }
      window.removeEventListener('authDataUpdated', handleAuthDataUpdate as EventListener);
    };
  }, []);

  const manager: SharedSSEManager = {
    addListener,
    isConnected
  };

  return (
    <SharedSSEManagerContext.Provider value={manager}>
      {children}
    </SharedSSEManagerContext.Provider>
  );
}

export function useSharedSSE() {
  const context = useContext(SharedSSEManagerContext);
  if (!context) {
    throw new Error('useSharedSSE must be used within a SharedSSEManagerProvider');
  }
  return context;
} 