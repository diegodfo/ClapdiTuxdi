import { Pizza, Croissant } from "lucide-react";

import { ImageWithFallback } from "./figma/ImageWithFallback";

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
  loadingPersonIds?: Set<string>;
}

export function PendingView({
  people,
  onMarkFoodBrought,
  onViewDetails,
  loadingPersonIds = new Set(),
}: PendingViewProps) {
  const pendingPeople = people.filter((p) => p.pendingFood);

  return (
    <div>
      {pendingPeople.length === 0 ? (
        <div className="bg-white rounded-2xl shadow-lg p-12 text-center">
          <h3 className="text-gray-900 mb-2">¡Todo al día!</h3>
          <p className="text-gray-600">
            No hay pendientes en este momento
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {pendingPeople.map((person) => (
            <div
              key={person.id}
              className="bg-white rounded-2xl shadow-lg hover:shadow-xl transition-shadow p-6 border-2 border-orange-200"
            >
              <div className="flex flex-col gap-4">
                <div className="flex items-center gap-4">
                  <div className="relative">
                    <ImageWithFallback
                      src={person.photo}
                      alt={person.name}
                      className="w-20 h-20 rounded-full object-cover ring-4 ring-orange-200"
                    />
                    <div className="absolute -top-2 -right-2 text-3xl animate-bounce">
                      🥐
                    </div>
                  </div>

                  <div className="flex-1 min-w-0">
                    <h3 className="text-gray-900 truncate">
                      {person.name}
                    </h3>
                    <p className="text-gray-600 text-sm mb-2">
                      {person.position}
                    </p>
                    <p className="text-sm text-orange-600">
                      Ha traído comida {person.foodBrought}{" "}
                      {person.foodBrought === 1
                        ? "vez"
                        : "veces"}
                    </p>
                  </div>
                </div>

                <div className="flex gap-2 w-full">
                  <button
                    onClick={() => onMarkFoodBrought(person.id)}
                    disabled={loadingPersonIds.has(person.id)}
                    className="flex-1 flex items-center justify-center gap-2 bg-gradient-to-r from-orange-500 to-yellow-500 text-white py-2.5 px-4 rounded-xl hover:from-orange-600 hover:to-yellow-600 disabled:from-gray-300 disabled:to-gray-400 transition-all"
                  >
                    <Croissant className="w-4 h-4" />
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