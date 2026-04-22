/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { Toaster, toast } from 'react-hot-toast';
import { onAuthStateChanged, signInAnonymously, signOut } from 'firebase/auth';
import { collection, query, getDocs, where, addDoc, serverTimestamp, setDoc, doc, onSnapshot, deleteDoc, orderBy } from 'firebase/firestore';
import { auth, db } from './lib/firebase';
import { User, Remanejamento, Config, MASTER_PASSWORD } from './lib/utils';
import { LoginForm } from './components/LoginForm';
import { Header } from './components/Header';
import { RelocationForm } from './components/RelocationForm';
import { HistoryList } from './components/HistoryList';
import { SettingsModal } from './components/SettingsModal';
import { Home } from './components/Home';
import { motion, AnimatePresence } from 'motion/react';

export default function App() {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [activeTab, setActiveTab] = useState<'home' | 'remanejamento' | 'historico'>('home');
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [whatsappNumber, setWhatsappNumber] = useState('+5592992926772');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    onAuthStateChanged(auth, async (user) => {
      if (!user) {
        signInAnonymously(auth).catch(err => {
          if (err.code === 'auth/admin-restricted-operation') {
            console.warn("A autenticação anônima está desativada no console do Firebase. Ative-a em 'Authentication > Sign-in method'.");
          } else {
            console.error("Firebase Auth Error:", err);
          }
          // Still set loading to false to allow app usage
          setIsLoading(false);
        });
      } else {
        // Initial fetch for WhatsApp config only after auth
        const unsubConfig = onSnapshot(doc(db, 'config', 'whatsapp'), (docSnap) => {
          if (docSnap.exists()) {
            setWhatsappNumber(docSnap.data().whatsappNumber);
          } else {
            setDoc(doc(db, 'config', 'whatsapp'), { whatsappNumber: '+5592992926772' });
          }
        }, (err) => {
          console.warn("Config sync error (check firestore rules):", err);
          setIsLoading(false);
        });
        
        setIsLoading(false);
      }
    });

    // Check session in local storage
    const storedUser = localStorage.getItem('globalservice_user');
    if (storedUser) {
      setCurrentUser(JSON.parse(storedUser));
    }
  }, []);

  const handleLogin = (user: User) => {
    setCurrentUser(user);
    localStorage.setItem('globalservice_user', JSON.stringify(user));
    toast.success(`Bem-vindo, ${user.name}!`);
  };

  const handleLogout = () => {
    setCurrentUser(null);
    localStorage.removeItem('globalservice_user');
    signOut(auth);
    setActiveTab('home');
    toast.error('Sessão encerrada');
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-blue-700 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!currentUser) {
    return (
      <div className="min-h-screen bg-slate-100 flex items-center justify-center p-4">
        <LoginForm onLogin={handleLogin} />
        <Toaster position="bottom-center" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 font-sans">
      <Header 
        user={currentUser} 
        onLogout={handleLogout} 
        onOpenSettings={() => setIsSettingsOpen(true)}
      />
      
      <nav className="bg-white border-b border-slate-200 sticky top-0 z-10">
        <div className="max-w-4xl mx-auto flex justify-around">
          {(['home', 'remanejamento', 'historico'] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`py-4 px-6 text-sm font-bold tracking-wide transition-colors relative ${
                activeTab === tab ? 'text-blue-700' : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              <span className="capitalize">{tab}</span>
              {activeTab === tab && (
                <motion.div
                  layoutId="activeTab"
                  className="absolute bottom-0 left-0 right-0 h-1 bg-orange-500"
                />
              )}
            </button>
          ))}
        </div>
      </nav>

      <main className="max-w-4xl mx-auto p-4 md:p-8">
        <AnimatePresence mode="wait">
          {activeTab === 'home' && <Home onStart={() => setActiveTab('remanejamento')} />}
          {activeTab === 'remanejamento' && (
            <RelocationForm 
              user={currentUser} 
              whatsappNumber={whatsappNumber} 
              onBack={() => setActiveTab('home')} 
            />
          )}
          {activeTab === 'historico' && <HistoryList onBack={() => setActiveTab('home')} />}
        </AnimatePresence>
      </main>

      <SettingsModal 
        isOpen={isSettingsOpen} 
        onClose={() => setIsSettingsOpen(false)} 
        currentWhatsapp={whatsappNumber}
        onLogout={handleLogout}
      />

      <Toaster position="bottom-center" />
    </div>
  );
}
