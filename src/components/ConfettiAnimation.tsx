import { useEffect, useState } from 'react';
import { Sparkles } from 'lucide-react';

interface ConfettiAnimationProps {
  personName: string;
  onClose: () => void;
}

export function ConfettiAnimation({ personName, onClose }: ConfettiAnimationProps) {
  const [confettiPieces, setConfettiPieces] = useState<Array<{ id: number; left: number; delay: number; duration: number; color: string }>>([]);

  useEffect(() => {
    // Generate random confetti pieces
    const pieces = Array.from({ length: 50 }, (_, i) => ({
      id: i,
      left: Math.random() * 100,
      delay: Math.random() * 0.5,
      duration: 2 + Math.random() * 2,
      color: ['#9333ea', '#ec4899', '#f59e0b', '#3b82f6', '#10b981'][Math.floor(Math.random() * 5)],
    }));
    setConfettiPieces(pieces);

    // Auto close after 4 seconds
    const timer = setTimeout(() => {
      onClose();
    }, 4000);

    return () => clearTimeout(timer);
  }, [onClose]);

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center p-4 z-50 animate-[fade-in_0.3s_ease-out]">
      {/* Confetti */}
      {confettiPieces.map((piece) => (
        <div
          key={piece.id}
          className="absolute top-0 w-3 h-3 animate-[fall_linear_forwards]"
          style={{
            left: `${piece.left}%`,
            backgroundColor: piece.color,
            animationDelay: `${piece.delay}s`,
            animationDuration: `${piece.duration}s`,
            transform: 'rotate(0deg)',
          }}
        />
      ))}

      {/* Content */}
      <div className="bg-white rounded-3xl shadow-2xl max-w-lg w-full p-8 text-center animate-[bounce-in_0.5s_ease-out] relative z-10">
        <div className="flex justify-center mb-6">
          <div className="w-24 h-24 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-full flex items-center justify-center animate-[spin_2s_ease-in-out_infinite]">
            <Sparkles className="w-12 h-12 text-white" />
          </div>
        </div>

        <div className="text-6xl mb-4">🎉</div>
        
        <h2 className="text-gray-900 mb-4">¡Felicitaciones!</h2>
        
        <p className="text-xl text-gray-700 mb-2">
          <span className="text-purple-600">{personName}</span> alcanzó 15 aplausos
        </p>
        
        <p className="text-lg text-gray-600 mb-6">
          Le toca traer comida 🍰
        </p>

        <button
          onClick={onClose}
          className="bg-gradient-to-r from-purple-500 to-pink-500 text-white px-8 py-3 rounded-xl hover:from-purple-600 hover:to-pink-600 transition-all"
        >
          ¡Genial!
        </button>
      </div>

      <style>{`
        @keyframes fall {
          to {
            transform: translateY(100vh) rotate(360deg);
          }
        }
        
        @keyframes fade-in {
          from {
            opacity: 0;
          }
          to {
            opacity: 1;
          }
        }
        
        @keyframes bounce-in {
          0% {
            transform: scale(0.3);
            opacity: 0;
          }
          50% {
            transform: scale(1.05);
          }
          70% {
            transform: scale(0.9);
          }
          100% {
            transform: scale(1);
            opacity: 1;
          }
        }
      `}</style>
    </div>
  );
}
