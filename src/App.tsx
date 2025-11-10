import { useState, useEffect } from 'react';
import { IdentificationModal } from './components/IdentificationModal';
import { TopBar } from './components/TopBar';
import { PersonCard } from './components/PersonCard';
import { PersonDetail } from './components/PersonDetail';
import { PendingView } from './components/PendingView';
import { ConfettiAnimation } from './components/ConfettiAnimation';
import { projectId, publicAnonKey } from './utils/supabase/info';
import { Loader2, Home, Pizza } from 'lucide-react';

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

type View = 'home' | 'pending' | 'detail';

export default function App() {
  const [userName, setUserName] = useState<string>('');
  const [showIdentificationModal, setShowIdentificationModal] = useState(false);
  const [people, setPeople] = useState<Person[]>([]);
  const [currentView, setCurrentView] = useState<View>('home');
  const [selectedPersonId, setSelectedPersonId] = useState<string | null>(null);
  const [celebrationPerson, setCelebrationPerson] = useState<string | null>(null);
  const [loadingPersonIds, setLoadingPersonIds] = useState<Set<string>>(new Set());
  const [isFetchingData, setIsFetchingData] = useState(true);

  const apiUrl = `https://${projectId}.supabase.co/functions/v1/make-server-daca5355`;

  // Set favicon
  useEffect(() => {
    const svg = `
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 248 282" fill="none">
        <circle cx="124" cy="141" r="124" fill="white"/>
        <g>
          <path d="M248 281.455L248 237.319L103.826 237.319L103.826 281.455L248 281.455Z" fill="#AF2EFF" />
          <path clip-rule="evenodd" d="M53.7457 225.446H0L79.1031 112.714L0 0H53.7457L132.868 112.714L53.7457 225.446Z" fill="#AF2EFF" fill-rule="evenodd" />
        </g>
      </svg>
    `;
    const dataUrl = `data:image/svg+xml,${encodeURIComponent(svg)}`;
    
    let link = document.querySelector("link[rel~='icon']") as HTMLLinkElement;
    if (!link) {
      link = document.createElement('link');
      link.rel = 'icon';
      document.head.appendChild(link);
    }
    link.href = dataUrl;
  }, []);

  // Check for saved username on mount
  useEffect(() => {
    const savedName = localStorage.getItem('aplausosapp_username');
    if (savedName) {
      setUserName(savedName);
    } else {
      setShowIdentificationModal(true);
    }
  }, []);

  // Fetch people data
  useEffect(() => {
    if (userName) {
      fetchPeople();
    }
  }, [userName]);

  const fetchPeople = async () => {
    try {
      setIsFetchingData(true);
      const response = await fetch(`${apiUrl}/people`, {
        headers: {
          'Authorization': `Bearer ${publicAnonKey}`,
        },
      });
      
      if (!response.ok) {
        throw new Error(`Error fetching people: ${response.status} ${response.statusText}`);
      }
      
      const data = await response.json();
      const sortedPeople = (data.people || []).sort(
        (a: Person, b: Person) => b.applauseCount - a.applauseCount
      );
      setPeople(sortedPeople);
    } catch (error) {
      console.error('Error fetching people:', error);
    } finally {
      setIsFetchingData(false);
    }
  };

  const handleSaveUserName = (name: string) => {
    setUserName(name);
    localStorage.setItem('aplausosapp_username', name);
    setShowIdentificationModal(false);
  };

  const handleLogout = () => {
    localStorage.removeItem('aplausosapp_username');
    setUserName('');
    setShowIdentificationModal(true);
  };

  const handleGiveApplause = async (personId: string) => {
    try {
      setLoadingPersonIds(prev => new Set(prev).add(personId));
      const response = await fetch(`${apiUrl}/applause`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${publicAnonKey}`,
        },
        body: JSON.stringify({
          personId,
          givenBy: userName,
        }),
      });

      if (!response.ok) {
        throw new Error(`Error giving applause: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();
      
      // Update people list
      setPeople(prevPeople => {
        const updated = prevPeople.map(p => 
          p.id === personId ? data.person : p
        ).sort((a, b) => b.applauseCount - a.applauseCount);
        return updated;
      });

      // Show celebration if needed
      if (data.celebration) {
        setCelebrationPerson(data.person.name);
      }
    } catch (error) {
      console.error('Error giving applause:', error);
    } finally {
      setLoadingPersonIds(prev => {
        const newSet = new Set(prev);
        newSet.delete(personId);
        return newSet;
      });
    }
  };

  const handleRemoveApplause = async (personId: string) => {
    try {
      setLoadingPersonIds(prev => new Set(prev).add(personId));
      const response = await fetch(`${apiUrl}/remove-applause`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${publicAnonKey}`,
        },
        body: JSON.stringify({
          personId,
          removedBy: userName,
        }),
      });

      if (!response.ok) {
        throw new Error(`Error removing applause: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();
      
      // Update people list
      setPeople(prevPeople => {
        const updated = prevPeople.map(p => 
          p.id === personId ? data.person : p
        ).sort((a, b) => b.applauseCount - a.applauseCount);
        return updated;
      });
    } catch (error) {
      console.error('Error removing applause:', error);
    } finally {
      setLoadingPersonIds(prev => {
        const newSet = new Set(prev);
        newSet.delete(personId);
        return newSet;
      });
    }
  };

  const handleMarkFoodBrought = async (personId: string) => {
    try {
      setLoadingPersonIds(prev => new Set(prev).add(personId));
      const response = await fetch(`${apiUrl}/mark-food-brought/${personId}`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${publicAnonKey}`,
        },
      });

      if (!response.ok) {
        throw new Error(`Error marking food as brought: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();
      
      // Update people list
      setPeople(prevPeople => 
        prevPeople.map(p => p.id === personId ? data.person : p)
      );
    } catch (error) {
      console.error('Error marking food as brought:', error);
    } finally {
      setLoadingPersonIds(prev => {
        const newSet = new Set(prev);
        newSet.delete(personId);
        return newSet;
      });
    }
  };

  const handleViewDetails = (personId: string) => {
    setSelectedPersonId(personId);
    setCurrentView('detail');
  };

  const handleNavigate = (view: 'home' | 'pending') => {
    setCurrentView(view);
    setSelectedPersonId(null);
  };

  const handleBackFromDetail = () => {
    setCurrentView('home');
    setSelectedPersonId(null);
    fetchPeople(); // Refresh data
  };

  if (showIdentificationModal) {
    return <IdentificationModal onSave={handleSaveUserName} />;
  }

  if (isFetchingData) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 to-pink-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-12 h-12 text-purple-600 animate-spin mx-auto mb-4" />
          <p className="text-gray-600">Cargando datos...</p>
        </div>
      </div>
    );
  }

  const selectedPerson = selectedPersonId 
    ? people.find(p => p.id === selectedPersonId)
    : null;

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-pink-50">
      <TopBar
        userName={userName}
        currentView={currentView}
        onNavigate={handleNavigate}
        onLogout={handleLogout}
      />

      {currentView === 'home' && (
        <div className="max-w-7xl mx-auto px-4 py-8">
          <div className="mb-6 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
            <div>
              <h2 className="text-gray-900 mb-2 text-[32px] font-bold">Ranking General</h2>
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => handleNavigate("home")}
                className="flex items-center gap-2 px-4 py-2 rounded-lg transition-all bg-purple-600 text-white"
              >
                <Home className="w-4 h-4" />
                <span className="text-sm">Ranking</span>
              </button>

              <button
                onClick={() => handleNavigate("pending")}
                className="flex items-center gap-2 px-4 py-2 rounded-lg transition-all bg-gray-100 hover:bg-gray-200 text-gray-700"
              >
                <Pizza className="w-4 h-4" />
                <span className="text-sm">Pendientes</span>
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {people.map((person) => (
              <PersonCard
                key={person.id}
                person={person}
                onGiveApplause={handleGiveApplause}
                onRemoveApplause={handleRemoveApplause}
                onViewDetails={handleViewDetails}
                isLoading={loadingPersonIds.has(person.id)}
              />
            ))}
          </div>

          {people.length === 0 && (
            <div className="bg-white rounded-2xl shadow-lg p-12 text-center">
              <div className="text-6xl mb-4">👥</div>
              <h3 className="text-gray-900 mb-2">No hay personas registradas</h3>
              <p className="text-gray-600">Los datos se cargarán automáticamente</p>
            </div>
          )}
        </div>
      )}

      {currentView === 'pending' && (
        <div className="max-w-7xl mx-auto px-4 py-8">
          <div className="mb-6 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
            <div>
              <h2 className="text-gray-900 mb-2 text-[32px] font-bold">Pendientes</h2>            
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => handleNavigate("home")}
                className="flex items-center gap-2 px-4 py-2 rounded-lg transition-all bg-gray-100 hover:bg-gray-200 text-gray-700"
              >
                <Home className="w-4 h-4" />
                <span className="text-sm">Ranking</span>
              </button>

              <button
                onClick={() => handleNavigate("pending")}
                className="flex items-center gap-2 px-4 py-2 rounded-lg transition-all bg-purple-600 text-white"
              >
                <Pizza className="w-4 h-4" />
                <span className="text-sm">Pendientes</span>
              </button>
            </div>
          </div>
          
          <PendingView
            people={people}
            onMarkFoodBrought={handleMarkFoodBrought}
            onViewDetails={handleViewDetails}
            loadingPersonIds={loadingPersonIds}
          />
        </div>
      )}

      {currentView === 'detail' && selectedPerson && (
        <PersonDetail
          person={selectedPerson}
          onBack={handleBackFromDetail}
          onGiveApplause={handleGiveApplause}
          onRemoveApplause={handleRemoveApplause}
          onMarkFoodBrought={handleMarkFoodBrought}
          isLoading={loadingPersonIds.has(selectedPerson.id)}
          apiUrl={apiUrl}
        />
      )}

      {celebrationPerson && (
        <ConfettiAnimation
          personName={celebrationPerson}
          onClose={() => setCelebrationPerson(null)}
        />
      )}
    </div>
  );
}
