import { ThumbsUp, ThumbsDown, ArrowLeft, Clock, User, Pizza } from 'lucide-react';
import { useEffect, useState } from 'react';
import { ImageWithFallback } from './figma/ImageWithFallback';
import EiCheck from '../imports/EiCheck';

interface Person {
  id: string;
  name: string;
  position: string;
  photo: string;
  applauseCount: number;
  foodBrought: number;
  pendingFood: boolean;
  lastApplause: string;
}

interface HistoryEntry {
  date: string;
  from: string;
  action: string;
  toName?: string;
}

interface PersonDetailProps {
  person: Person;
  onBack: () => void;
  onGiveApplause: (personId: string) => void;
  onRemoveApplause: (personId: string) => void;
  onMarkFoodBrought: (personId: string) => void;
  isLoading?: boolean;
  apiUrl: string;
}

export function PersonDetail({ 
  person, 
  onBack, 
  onGiveApplause, 
  onRemoveApplause,
  onMarkFoodBrought,
  isLoading,
  apiUrl 
}: PersonDetailProps) {
  const [history, setHistory] = useState<HistoryEntry[]>([]);
  const [givenHistory, setGivenHistory] = useState<HistoryEntry[]>([]);
  const [loadingHistory, setLoadingHistory] = useState(true);
  const [loadingGivenHistory, setLoadingGivenHistory] = useState(true);

  useEffect(() => {
    const fetchHistory = async () => {
      try {
        const response = await fetch(`${apiUrl}/people/${person.id}/history`);
        const data = await response.json();
        setHistory(data.history || []);
      } catch (error) {
        console.error('Error fetching history:', error);
      } finally {
        setLoadingHistory(false);
      }
    };

    const fetchGivenHistory = async () => {
      try {
        const response = await fetch(`${apiUrl}/people/${person.id}/given-history`);
        const data = await response.json();
        setGivenHistory(data.history || []);
      } catch (error) {
        console.error('Error fetching given history:', error);
      } finally {
        setLoadingGivenHistory(false);
      }
    };

    fetchHistory();
    fetchGivenHistory();
  }, [person.id, apiUrl]);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = (now.getTime() - date.getTime()) / (1000 * 60 * 60);
    
    if (diffInHours < 24) {
      return date.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' });
    }
    return date.toLocaleDateString('es-ES', { day: 'numeric', month: 'short' });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-pink-50 pb-8">
      <div className="max-w-4xl mx-auto px-4 py-6">
        <button
          onClick={onBack}
          className="flex items-center gap-2 text-purple-600 hover:text-purple-700 mb-6 transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
          <span>Volver al ranking</span>
        </button>

        {/* Header Card */}
        <div className="bg-white rounded-2xl shadow-lg p-8 mb-6">
          <div className="flex flex-col md:flex-row items-center md:items-start gap-6">
            <div className="relative">
              <ImageWithFallback
                src={person.photo}
                alt={person.name}
                className="w-32 h-32 rounded-full object-cover ring-4 ring-purple-200"
              />
              {person.pendingFood && (
                <div className="absolute -top-2 -right-2 text-4xl animate-bounce">🍕</div>
              )}
            </div>
            
            <div className="flex-1 text-center md:text-left">
              <h1 className="text-gray-900 mb-2 text-[32px] font-bold">{person.name}</h1>
              <p className="text-gray-600 mb-6 text-[20px]">{person.position}</p>
              
              <div className="flex flex-wrap gap-4 justify-center md:justify-start">
                <button
                  onClick={() => onGiveApplause(person.id)}
                  disabled={isLoading}
                  className="flex items-center gap-2 bg-gradient-to-r from-green-500 to-emerald-500 text-white py-3 px-6 rounded-xl hover:from-green-600 hover:to-emerald-600 disabled:from-gray-300 disabled:to-gray-400 transition-all"
                >
                  <ThumbsUp className="w-5 h-5" />
                  <span>Agregar aplauso</span>
                </button>
                
                <button
                  onClick={() => onRemoveApplause(person.id)}
                  disabled={isLoading || person.applauseCount === 0}
                  className="flex items-center gap-2 bg-gray-200 text-gray-700 py-3 px-6 rounded-xl hover:bg-gray-300 disabled:bg-gray-100 disabled:text-gray-400 disabled:cursor-not-allowed transition-all"
                >
                  <ThumbsDown className="w-5 h-5" />
                  <span>Restar aplauso</span>
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div className="bg-white rounded-xl shadow p-6 text-center">
            <div className="text-5xl text-[rgb(0,0,0)] mb-2">{person.applauseCount}</div>
            <div className="text-gray-600 text-[20px]">Aplausos actuales</div>
            <div className="mt-2 text-sm text-gray-500">
              {15 - person.applauseCount} para el siguiente festejo
            </div>
          </div>
          
          <div className="bg-white rounded-xl shadow p-6 text-center">
            <div className="text-5xl text-[rgb(0,0,0)] mb-2">{person.foodBrought}</div>
            <div className="text-gray-600 text-[20px]">Veces que trajo comida</div>
          </div>
          
          <div className="bg-white rounded-xl shadow p-6 text-center">
            <div className="mb-2 flex justify-center items-center">
              {person.pendingFood ? (
                <div className="text-5xl">🍕</div>
              ) : (
                <div className="w-12 h-12 text-green-500">
                  <EiCheck />
                </div>
              )}
            </div>
            <div className="text-gray-600 mb-3">
              {person.pendingFood ? 'Pendiente de traer' : 'Al día'}
            </div>
            {person.pendingFood && (
              <button
                onClick={() => onMarkFoodBrought(person.id)}
                className="text-sm bg-orange-100 text-orange-600 px-4 py-2 rounded-lg hover:bg-orange-200 transition-colors"
              >
                Marcar como traído
              </button>
            )}
          </div>
        </div>

        {/* History Received */}
        <div className="bg-white rounded-xl shadow p-6 mb-6">
          <h2 className="text-gray-900 mb-4 flex items-center gap-2">
            <Clock className="w-5 h-5" />
            Aplausos recibidos
          </h2>
          
          {loadingHistory ? (
            <div className="text-center py-8 text-gray-500">Cargando historial...</div>
          ) : history.length === 0 ? (
            <div className="text-center py-8 text-gray-500">No hay historial disponible</div>
          ) : (
            <div className="space-y-3">
              {history.map((entry, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                      entry.action === '+1' 
                        ? 'bg-green-100 text-green-600' 
                        : 'bg-red-100 text-red-600'
                    }`}>
                      {entry.action === '+1' ? <ThumbsUp className="w-5 h-5" /> : <ThumbsDown className="w-5 h-5" />}
                    </div>
                    <div>
                      <div className="text-gray-900">
                        {entry.action === '+1' ? 'Recibió un aplauso' : 'Le quitaron un aplauso'}
                      </div>
                      <div className="text-sm text-gray-600 flex items-center gap-1">
                        <User className="w-3 h-3" />
                        de <span>{entry.from}</span>
                      </div>
                    </div>
                  </div>
                  <div className="text-sm text-gray-500">
                    {formatDate(entry.date)}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* History Given */}
        <div className="bg-white rounded-xl shadow p-6">
          <h2 className="text-gray-900 mb-4 flex items-center gap-2">
            <ThumbsUp className="w-5 h-5" />
            Aplausos dados
          </h2>
          
          {loadingGivenHistory ? (
            <div className="text-center py-8 text-gray-500">Cargando historial...</div>
          ) : givenHistory.length === 0 ? (
            <div className="text-center py-8 text-gray-500">No ha dado aplausos aún</div>
          ) : (
            <div className="space-y-3">
              {givenHistory.map((entry, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between p-4 bg-purple-50 rounded-lg hover:bg-purple-100 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                      entry.action === '+1' 
                        ? 'bg-purple-100 text-purple-600' 
                        : 'bg-gray-200 text-gray-600'
                    }`}>
                      {entry.action === '+1' ? <ThumbsUp className="w-5 h-5" /> : <ThumbsDown className="w-5 h-5" />}
                    </div>
                    <div>
                      <div className="text-gray-900">
                        {entry.action === '+1' ? 'Dio un aplauso' : 'Restó un aplauso'}
                      </div>
                      <div className="text-sm text-gray-600 flex items-center gap-1">
                        <User className="w-3 h-3" />
                        a <span>{entry.toName}</span>
                      </div>
                    </div>
                  </div>
                  <div className="text-sm text-gray-500">
                    {formatDate(entry.date)}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
