import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Share2, Copy, Check, Users, Link2, X } from 'lucide-react';
import { useCollaboration } from '../context/CollaborationContext';

export function ShareButton() {
  const { roomId, connected, createRoom, leaveRoom } = useCollaboration();
  const [copied, setCopied] = useState(false);
  const [showModal, setShowModal] = useState(false);

  const handleShare = () => {
    if (!roomId) {
      createRoom();
    }
    setShowModal(true);
  };

  const handleCopyLink = async () => {
    const url = new URL(window.location.href);
    url.searchParams.set('room', roomId || '');
    await navigator.clipboard.writeText(url.toString());
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleLeave = () => {
    leaveRoom();
    setShowModal(false);
  };

  return (
    <>
      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={handleShare}
        className="flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium bg-[#1f6feb] text-white hover:bg-[#388bfd] transition-colors"
      >
        <Share2 className="w-3.5 h-3.5" />
        <span>{roomId ? 'Share' : 'Go Live'}</span>
        {connected && (
          <span className="w-1.5 h-1.5 rounded-full bg-[#3fb950] animate-pulse" />
        )}
      </motion.button>

      <AnimatePresence>
        {showModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60"
            onClick={() => setShowModal(false)}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              transition={{ type: 'spring', stiffness: 400, damping: 25 }}
              onClick={e => e.stopPropagation()}
              className="bg-[#161b22] border border-[#30363d] rounded-xl p-6 w-full max-w-md shadow-2xl space-y-4"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-[#1f6feb]/20 border border-[#1f6feb]/30 grid place-items-center">
                    <Link2 className="w-4 h-4 text-[#58a6ff]" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-[#f0f6fc]">Share Session</h3>
                    <p className="text-[10px] text-[#8b949e]">Real-time collaboration via WebRTC</p>
                  </div>
                </div>
                <button onClick={() => setShowModal(false)} className="text-[#8b949e] hover:text-[#c9d1d9] transition">
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="p-3 rounded-lg bg-[#0d1117] border border-[#30363d] space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-mono text-[#8b949e]">Room</span>
                  <span className="text-[10px] font-mono text-[#58a6ff]">{roomId}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-mono text-[#8b949e]">Status</span>
                  <span className={`text-[10px] font-mono ${connected ? 'text-[#3fb950]' : 'text-[#d29922]'}`}>
                    {connected ? '● Connected' : '○ Connecting…'}
                  </span>
                </div>
              </div>

              <div className="flex gap-2">
                <button
                  onClick={handleCopyLink}
                  className="flex-1 py-2.5 rounded-lg text-xs font-semibold bg-[#238636] text-white hover:bg-[#2ea043] transition-colors flex items-center justify-center gap-2"
                >
                  {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                  {copied ? 'Copied!' : 'Copy Link'}
                </button>
                {roomId && (
                  <button
                    onClick={handleLeave}
                    className="px-4 py-2.5 rounded-lg text-xs font-medium bg-[#21262d] border border-[#30363d] text-[#f85149] hover:bg-[#da3633]/20 transition-colors"
                  >
                    Leave
                  </button>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

export function UserPresence() {
  const { peers, connected, roomId } = useCollaboration();

  if (!roomId) return null;

  return (
    <div className="flex items-center gap-1.5">
      {/* Connection indicator */}
      <div className={`flex items-center gap-1 px-2 py-1 rounded-md text-[10px] font-mono ${connected ? 'bg-[#0d2818] border border-[#238636]/40 text-[#3fb950]' : 'bg-[#3d1d00] border border-[#d29922]/40 text-[#d29922]'}`}>
        <Users className="w-3 h-3" />
        <span>{peers.length + 1}</span>
      </div>

      {/* Peer avatars */}
      <div className="flex -space-x-1.5">
        {peers.slice(0, 4).map((peer) => (
          <motion.div
            key={peer.id}
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0, opacity: 0 }}
            className="w-5 h-5 rounded-full border-2 border-[#0d1117] flex items-center justify-center text-[8px] font-bold text-white"
            style={{ backgroundColor: peer.color }}
            title={peer.name}
          >
            {peer.name.charAt(0).toUpperCase()}
          </motion.div>
        ))}
        {peers.length > 4 && (
          <div className="w-5 h-5 rounded-full border-2 border-[#0d1117] bg-[#21262d] flex items-center justify-center text-[8px] text-[#8b949e]">
            +{peers.length - 4}
          </div>
        )}
      </div>
    </div>
  );
}
