// Global SSE manager for real-time notifications
class SSEManager {
  private clients: Set<ReadableStreamDefaultController> = new Set();
  private userConnections: Map<string, Set<ReadableStreamDefaultController>> = new Map();

  addClient(controller: ReadableStreamDefaultController, userId?: string) {
    this.clients.add(controller);
    
    // Also track by user if userId provided
    if (userId) {
      if (!this.userConnections.has(userId)) {
        this.userConnections.set(userId, new Set());
      }
      this.userConnections.get(userId)!.add(controller);
    }
    
    console.log(`SSE client added for user: ${userId || 'anonymous'}. Total clients: ${this.clients.size}`);
  }

  removeClient(controller: ReadableStreamDefaultController) {
    this.clients.delete(controller);
    
    // Remove from user connections too
    for (const [userId, userClients] of this.userConnections.entries()) {
      if (userClients.has(controller)) {
        userClients.delete(controller);
        if (userClients.size === 0) {
          this.userConnections.delete(userId);
        }
      }
    }
    
    console.log(`SSE client removed. Total clients: ${this.clients.size}`);
  }

  notifyAll(message: string = 'sync') {
    console.log(`Notifying ${this.clients.size} clients with message: ${message}`);
    const encoder = new TextEncoder();
    const data = `data: ${message}\n\n`;
    
    let i = 0;
    this.clients.forEach((controller) => {
      try {
        controller.enqueue(encoder.encode(data));
        i += 1;
        console.log(`Message sent to client ${i}`);
      } catch (error) {
        console.error(`Failed to send message to client ${i}:`, error);
        // Client disconnected, remove it
        this.removeClient(controller);
      }
    });
  }

  notifyUser(userId: string, message: string = 'sync') {
    const userClients = this.userConnections.get(userId);
    if (!userClients || userClients.size === 0) {
      console.log(`No clients found for user: ${userId}`);
      return;
    }
    
    console.log(`Notifying ${userClients.size} clients for user: ${userId} with message: ${message}`);
    const encoder = new TextEncoder();
    const data = `data: ${message}\n\n`;
    
    let i = 0;
    userClients.forEach((controller) => {
      try {
        controller.enqueue(encoder.encode(data));
        i += 1;
        console.log(`Message sent to user ${userId} client ${i}`);
      } catch (error) {
        console.error(`Failed to send message to user ${userId} client ${i}:`, error);
        // Client disconnected, remove it
        this.removeClient(controller);
      }
    });
  }

  getClientCount() {
    return this.clients.size;
  }

  getUserClientCount(userId: string) {
    const userClients = this.userConnections.get(userId);
    return userClients ? userClients.size : 0;
  }
}

// Singleton instance
export const sseManager = new SSEManager(); 