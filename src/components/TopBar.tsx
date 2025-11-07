import { LogOut } from "lucide-react";
import CapaX from "../imports/CapaX00201";

interface TopBarProps {
  userName: string;
  currentView: "home" | "pending" | "detail";
  onNavigate: (view: "home" | "pending") => void;
  onLogout: () => void;
}

export function TopBar({
  userName,
  currentView,
  onNavigate,
  onLogout,
}: TopBarProps) {
  return (
    <div className="bg-white shadow-md sticky top-0 z-40">
      <div className="max-w-7xl mx-auto px-4 py-4">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <div className="w-32 h-10">
              <CapaX />
            </div>
          </div>

          <button
            onClick={onLogout}
            className="flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
          >
            <LogOut className="w-4 h-4" />
            <span className="text-sm">Salir</span>
          </button>
        </div>

        <div className="flex items-center justify-between">
          <p className="text-gray-700">
            👋 Hola, <span>{userName}</span>
          </p>
        </div>
      </div>
    </div>
  );
}
