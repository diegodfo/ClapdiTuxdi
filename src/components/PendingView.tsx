import { Pizza } from 'lucide-react';
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

interface PendingViewProps {
  people: Person[];
  onMarkFoodBrought: (personId: string) => void;
  onViewDetails: (personId: string) => void;
}

export function PendingView({ people, onMarkFoodBrought, onViewDetails }: PendingViewProps) {
  const pendingPeople = people.filter(p => p.pendingFood);

  return (
    <div>
      <div className="text-center mb-8">
        <div className="text-6xl mb-4 animate-bounce">🍰</div>
        <p className="text-gray-600">Estas personas alcanzaron 15 aplausos</p>
      </div>

      {pendingPeople.length === 0 ? (
        <div className="bg-white rounded-2xl shadow-lg p-12 text-center">
          <div className="text-6xl mb-4">✨</div>
          <h3 className="text-gray-900 mb-2">¡Todo al día!</h3>
          <p className="text-gray-600">No hay pendientes en este momento</p>
        </div>
      ) : (
        <div className="space-y-4">
          {pendingPeople.map((person) => (
            <div
              key={person.id}
              className="bg-white rounded-2xl shadow-lg hover:shadow-xl transition-shadow p-6 border-2 border-orange-200"
            >
              <div className="flex items-center gap-4">
                <div className="relative">
                  <ImageWithFallback
                    src={person.photo}
                    alt={person.name}
                    className="w-20 h-20 rounded-full object-cover ring-4 ring-orange-200"
                  />
                  <div className="absolute -top-2 -right-2 text-3xl animate-bounce">🍕</div>
                </div>
                
                <div className="flex-1 min-w-0">
                  <h3 className="text-gray-900 truncate">{person.name}</h3>
                  <p className="text-gray-600 text-sm mb-2">{person.position}</p>
                  <p className="text-sm text-orange-600">
                    Ha traído comida {person.foodBrought} {person.foodBrought === 1 ? 'vez' : 'veces'}
                  </p>
                </div>
                
                <div className="flex gap-2">
                  <button
                    onClick={() => onMarkFoodBrought(person.id)}
                    className="flex items-center gap-2 bg-gradient-to-r from-orange-500 to-yellow-500 text-white py-2.5 px-4 rounded-xl hover:from-orange-600 hover:to-yellow-600 transition-all transform hover:scale-105 active:scale-95"
                  >
                    <Pizza className="w-4 h-4" />
                    <span className="text-sm">Ya trajo</span>
                  </button>
                  
                  <button
                    onClick={() => onViewDetails(person.id)}
                    className="bg-gray-200 text-gray-700 py-2.5 px-4 rounded-xl hover:bg-gray-300 transition-all text-sm"
                  >
                    Ver detalles
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
