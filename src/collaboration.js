import * as Y from 'yjs';
import { WebsocketProvider } from 'y-websocket';

export class CollaborationManager {
  constructor(serverUrl, roomName, userProfile) {
    this.ydoc = new Y.Doc();
    this.serverUrl = serverUrl;
    this.roomName = roomName;
    this.userProfile = userProfile; // { name: string, role: 'teacher' | 'student' }

    // Connect Y-websocket provider
    this.provider = new WebsocketProvider(this.serverUrl, this.roomName, this.ydoc);

    // Setup User Awareness (Cursor & Avatar)
    const color = userProfile.role === 'teacher' ? '#8b5cf6' : '#06b6d4';
    this.provider.awareness.setLocalStateField('user', {
      name: userProfile.name,
      color: color,
      role: userProfile.role
    });

    this.yTextHTML = this.ydoc.getText('html');
    this.yTextCSS = this.ydoc.getText('css');
  }

  onConnected(callback) {
    this.provider.on('status', (event) => {
      if (typeof callback === 'function') {
        callback(event.status); // 'connected' | 'connecting' | 'disconnected'
      }
    });
  }

  getAwarenessUsers() {
    const states = Array.from(this.provider.awareness.getStates().values());
    return states.map(s => s.user).filter(Boolean);
  }
}
