// Global SSE manager for real-time notifications
class SSEManager {
  private clients: Set<ReadableStreamDefaultController> = new Set();

  addClient(controller: ReadableStreamDefaultController) {
    this.clients.add(controller);
  }

  removeClient(controller: ReadableStreamDefaultController) {
    this.clients.delete(controller);
  }

  notifyAll(message: string = 'sync') {
    const encoder = new TextEncoder();
    const data = `data: ${message}\n\n`;
    
    this.clients.forEach(controller => {
      try {
        controller.enqueue(encoder.encode(data));
      } catch (error) {
        // Client disconnected, remove it
        this.removeClient(controller);
      }
    });
  }

  getClientCount() {
    return this.clients.size;
  }
}

// Singleton instance
export const sseManager = new SSEManager(); 