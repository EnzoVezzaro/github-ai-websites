import { createContext, useContext, useEffect, useRef, useState, useCallback } from 'react';
import * as Y from 'yjs';
import { WebrtcProvider } from 'y-webrtc';
import type { ProjectContent } from '../types';

interface Peer {
  id: string;
  name: string;
  color: string;
  cursor?: { x: number; y: number };
  selection?: string;
  following?: string;
}

interface CollaborationContextValue {
  /** The shared Yjs document */
  doc: Y.Doc;
  /** Whether we're connected to a room */
  connected: boolean;
  /** The room ID (null if not in a room) */
  roomId: string | null;
  /** Join a room by ID */
  joinRoom: (roomId: string) => void;
  /** Create and join a new room */
  createRoom: () => string;
  /** Leave the current room */
  leaveRoom: () => void;
  /** Other peers in the room (excluding self) */
  peers: Peer[];
  /** Our own peer ID */
  myPeerId: string;
  /** Update awareness (cursor position, selection, etc.) */
  updateAwareness: (data: Partial<Peer>) => void;
  /** Sync project content to Yjs */
  syncProject: (project: ProjectContent) => void;
  /** Listen for project changes from others */
  onProjectChange: (callback: (project: ProjectContent) => void) => () => void;
  /** Follow a peer's viewport */
  followPeer: (peerId: string) => void;
  /** Stop following */
  unfollow: () => void;
  /** Who we're currently following */
  following: string | null;
}

const CollaborationCtx = createContext<CollaborationContextValue | null>(null);

const PEER_COLORS = [
  '#f85149', '#58a6ff', '#3fb950', '#d29922', '#d2a8ff',
  '#f778ba', '#79c0ff', '#56d364', '#e3b341', '#bc8cff',
];

function generateRoomId(): string {
  return Math.random().toString(36).substring(2, 10);
}

function generatePeerId(): string {
  return Math.random().toString(36).substring(2, 14);
}

export function CollaborationProvider({ children }: { children: React.ReactNode }) {
  const docRef = useRef<Y.Doc>(new Y.Doc());
  const providerRef = useRef<WebrtcProvider | null>(null);
  const [connected, setConnected] = useState(false);
  const [roomId, setRoomId] = useState<string | null>(() => {
    const params = new URLSearchParams(window.location.search);
    return params.get('room');
  });
  const [peers, setPeers] = useState<Peer[]>([]);
  const [following, setFollowing] = useState<string | null>(null);
  const myPeerIdRef = useRef(generatePeerId());
  const callbacksRef = useRef<Set<(project: ProjectContent) => void>>(new Set());

  const doc = docRef.current;

  const syncProject = useCallback((project: ProjectContent) => {
    const yProject = doc.getMap('project');
    doc.transact(() => {
      yProject.set('id', project.id);
      yProject.set('title', project.title);
      yProject.set('slug', project.slug);
      yProject.set('intro', project.intro);
      yProject.set('story', project.story);
      yProject.set('ideas', project.ideas);
      yProject.set('media', project.media);
      yProject.set('closing', project.closing);
      yProject.set('updatedAt', new Date().toISOString());
    });
  }, [doc]);

  const onProjectChange = useCallback((callback: (project: ProjectContent) => void) => {
    callbacksRef.current.add(callback);
    return () => { callbacksRef.current.delete(callback); };
  }, []);

  useEffect(() => {
    const yProject = doc.getMap('project');

    const observer = () => {
      const project: ProjectContent = {
        id: (yProject.get('id') as string) || '',
        title: (yProject.get('title') as string) || '',
        slug: (yProject.get('slug') as string) || '',
        intro: (yProject.get('intro') as string) || '',
        story: (yProject.get('story') as string) || '',
        ideas: (yProject.get('ideas') as string) || '',
        media: (yProject.get('media') as string) || '',
        closing: (yProject.get('closing') as string) || '',
        updatedAt: (yProject.get('updatedAt') as string) || new Date().toISOString(),
      };
      callbacksRef.current.forEach(cb => cb(project));
    };

    yProject.observe(observer);
    return () => { yProject.unobserve(observer); };
  }, [doc]);

  const joinRoom = useCallback((id: string) => {
    if (providerRef.current) {
      providerRef.current.disconnect();
      providerRef.current.destroy();
    }

    const provider = new WebrtcProvider(id, doc, {
      signaling: ['wss://signaling.yjs.dev'],
    });

    provider.on('status', ({ connected: isConnected }: { connected: boolean }) => {
      setConnected(isConnected);
    });

    provider.on('peers', () => {
      const states = provider.awareness.getStates();
      const peerList: Peer[] = [];
      states.forEach((state, clientId) => {
        if (clientId !== doc.clientID && state.user) {
          peerList.push(state.user as Peer);
        }
      });
      setPeers(peerList);
    });

    const ourColor = PEER_COLORS[Math.floor(Math.random() * PEER_COLORS.length)];
    provider.awareness.setLocalStateField('user', {
      id: myPeerIdRef.current,
      name: `User ${myPeerIdRef.current.slice(0, 4)}`,
      color: ourColor,
    });

    provider.awareness.on('change', () => {
      const states = provider.awareness.getStates();
      const peerList: Peer[] = [];
      states.forEach((state, clientId) => {
        if (clientId !== doc.clientID && state.user) {
          peerList.push(state.user as Peer);
        }
      });
      setPeers(peerList);
    });

    providerRef.current = provider;
    setRoomId(id);

    const url = new URL(window.location.href);
    url.searchParams.set('room', id);
    window.history.replaceState({}, '', url.toString());
  }, [doc]);

  const createRoom = useCallback(() => {
    const id = generateRoomId();
    joinRoom(id);
    return id;
  }, [joinRoom]);

  const leaveRoom = useCallback(() => {
    if (providerRef.current) {
      providerRef.current.disconnect();
      providerRef.current.destroy();
      providerRef.current = null;
    }
    setConnected(false);
    setRoomId(null);
    setPeers([]);
    setFollowing(null);
    const url = new URL(window.location.href);
    url.searchParams.delete('room');
    window.history.replaceState({}, '', url.toString());
  }, []);

  const updateAwareness = useCallback((data: Partial<Peer>) => {
    if (providerRef.current) {
      const current = providerRef.current.awareness.getLocalState()?.user || {};
      providerRef.current.awareness.setLocalStateField('user', { ...current, ...data });
    }
  }, []);

  const followPeer = useCallback((peerId: string) => {
    setFollowing(peerId);
    updateAwareness({ following: peerId });
  }, [updateAwareness]);

  const unfollow = useCallback(() => {
    setFollowing(null);
    updateAwareness({ following: undefined });
  }, [updateAwareness]);

  useEffect(() => {
    if (roomId) {
      joinRoom(roomId);
    }
    return () => {
      if (providerRef.current) {
        providerRef.current.disconnect();
        providerRef.current.destroy();
      }
    };
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <CollaborationCtx.Provider value={{
      doc,
      connected,
      roomId,
      joinRoom,
      createRoom,
      leaveRoom,
      peers,
      myPeerId: myPeerIdRef.current,
      updateAwareness,
      syncProject,
      onProjectChange,
      followPeer,
      unfollow,
      following,
    }}>
      {children}
    </CollaborationCtx.Provider>
  );
}

export function useCollaboration() {
  const ctx = useContext(CollaborationCtx);
  if (!ctx) throw new Error('useCollaboration must be used within CollaborationProvider');
  return ctx;
}
