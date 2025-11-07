import { ThumbsUp, ThumbsDown, ArrowRight } from 'lucide-react';
import { ImageWithFallback } from './figma/ImageWithFallback';

interface Person {
  id: string;
  name: string;
  position: string;
  photo: string;
  applauseCount: number;
  foodBrought: number;
  pendingFood: boolean;
}

interface PersonCardProps {
  person: Person;
  onGiveApplause: (personId: string) => void;
  onRemoveApplause: (personId: string) => void;
  onViewDetails: (personId: string) => void;
  isLoading?: boolean;
}

export function PersonCard({ 
  person, 
  onGiveApplause, 
  onRemoveApplause, 
  onViewDetails,
  isLoading 
}: PersonCardProps) {
  return (
    <div className="bg-white rounded-2xl shadow-lg hover:shadow-xl transition-shadow p-6 border-2 border-gray-100">
      <div className="flex items-start gap-4">
        <div className="relative">
          <ImageWithFallback
            src={person.photo}
            alt={person.name}
            className="w-20 h-20 rounded-full object-cover ring-4 ring-purple-100"
          />
          {person.pendingFood && (
            <div className="absolute -top-1 -right-1 text-2xl animate-bounce">🍕</div>
          )}
        </div>
        
        <div className="flex-1 min-w-0">
          <h3 className="text-gray-900 truncate">{person.name}</h3>
          <p className="text-gray-600 text-sm mb-3">{person.position}</p>
          
          <div className="flex items-center gap-4 mb-4">
            <div className="text-center">
              <div className="text-4xl text-purple-600 mb-1">{person.applauseCount}</div>
              <div className="text-xs text-gray-500">aplausos</div>
            </div>
            
            <div className="h-10 w-px bg-gray-200"></div>
            
            <div className="text-center">
              <div className="text-2xl text-gray-700 mb-1">{person.foodBrought}</div>
              <div className="text-xs text-gray-500">veces trajo</div>
            </div>
          </div>
          
          <div className="flex gap-2">
            <button
              onClick={() => onGiveApplause(person.id)}
              disabled={isLoading}
              className="flex-1 flex items-center justify-center gap-2 bg-gradient-to-r from-green-500 to-emerald-500 text-white py-2.5 px-4 rounded-xl hover:from-green-600 hover:to-emerald-600 disabled:from-gray-300 disabled:to-gray-400 transition-all transform hover:scale-105 active:scale-95"
            >
              <ThumbsUp className="w-4 h-4" />
              <span className="text-sm">Dar aplauso</span>
            </button>
            
            <button
              onClick={() => onRemoveApplause(person.id)}
              disabled={isLoading || person.applauseCount === 0}
              className="flex items-center justify-center gap-2 bg-gray-200 text-gray-700 py-2.5 px-4 rounded-xl hover:bg-gray-300 disabled:bg-gray-100 disabled:text-gray-400 disabled:cursor-not-allowed transition-all"
            >
              <ThumbsDown className="w-4 h-4" />
            </button>
            
            <button
              onClick={() => onViewDetails(person.id)}
              className="flex items-center justify-center bg-purple-100 text-purple-600 py-2.5 px-4 rounded-xl hover:bg-purple-200 transition-all"
            >
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
