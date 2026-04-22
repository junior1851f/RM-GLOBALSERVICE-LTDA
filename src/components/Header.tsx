import React from 'react';
import { User } from '../lib/utils';
import { Settings, LogOut } from 'lucide-react';

interface HeaderProps {
  user: User;
  onLogout: () => void;
  onOpenSettings: () => void;
}

export function Header({ user, onLogout, onOpenSettings }: HeaderProps) {
  return (
    <header className="bg-blue-700 text-white p-4 shadow-md">
      <div className="max-w-4xl mx-auto flex justify-between items-center">
        <div className="flex items-center gap-3">
          <div className="bg-white p-2 rounded-lg shadow-sm">
            <span className="font-black text-lg tracking-tight">
              <span className="text-blue-700 uppercase">Global</span>
              <span className="text-orange-500 uppercase">service</span>
            </span>
          </div>
        </div>
        
        <div className="flex items-center gap-4">
          <div className="hidden sm:block text-right">
            <p className="text-xs text-blue-100 opacity-80 uppercase font-semibold">Olá,</p>
            <p className="text-sm font-bold">{user.name}</p>
          </div>
          <button 
            onClick={onOpenSettings}
            className="p-2 hover:bg-white/10 rounded-full transition-colors"
            title="Configurações"
          >
            <Settings className="w-6 h-6" />
          </button>
          <button 
            onClick={onLogout}
            className="p-2 hover:bg-red-500 rounded-full transition-colors"
            title="Sair"
          >
            <LogOut className="w-5 h-5" />
          </button>
        </div>
      </div>
    </header>
  );
}
