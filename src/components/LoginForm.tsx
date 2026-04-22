import React, { useState, useEffect } from 'react';
import { User, MASTER_PASSWORD } from '../lib/utils';
import { collection, query, where, getDocs, addDoc } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { toast } from 'react-hot-toast';
import { LogIn, UserPlus } from 'lucide-react';
import { motion } from 'motion/react';

interface LoginFormProps {
  onLogin: (user: User) => void;
}

export function LoginForm({ onLogin }: LoginFormProps) {
  const [name, setName] = useState('');
  const [pin, setPin] = useState('');
  const [isRegistering, setIsRegistering] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // Auto-create Lucio if he doesn't exist (seed)
  useEffect(() => {
    const checkLucio = async () => {
      const q = query(collection(db, 'users'), where('name', '==', 'Lucio'));
      const snap = await getDocs(q);
      if (snap.empty) {
        await addDoc(collection(db, 'users'), { name: 'Lucio', pin: '1851' });
      }
    };
    checkLucio();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || pin.length < 4 || pin.length > 6) {
      toast.error('Preencha o nome e um PIN de 4 a 6 dígitos');
      return;
    }

    setIsLoading(true);
    try {
      const q = query(collection(db, 'users'), where('name', '==', name), where('pin', '==', pin));
      const snap = await getDocs(q);

      if (!snap.empty) {
        const doc = snap.docs[0];
        onLogin({ id: doc.id, name: doc.data().name, pin: doc.data().pin });
      } else {
        toast.error('Usuário ou PIN inválidos');
      }
    } catch (err) {
      toast.error('Erro ao conectar ao banco de dados');
    } finally {
      setIsLoading(false);
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || pin.length < 4 || pin.length > 6) {
      toast.error('Dados inválidos');
      return;
    }

    setIsLoading(true);
    try {
      const q = query(collection(db, 'users'), where('name', '==', name));
      const snap = await getDocs(q);
      if (!snap.empty) {
        toast.error('Este nome de usuário já existe');
        return;
      }

      const docRef = await addDoc(collection(db, 'users'), { name, pin });
      onLogin({ id: docRef.id, name, pin });
    } catch (err) {
      toast.error('Erro ao criar usuário');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white p-8 rounded-2xl shadow-xl w-full max-w-md border border-slate-200"
    >
      <div className="flex flex-col items-center mb-8">
        <div className="bg-gradient-to-br from-blue-700 to-orange-500 p-4 rounded-2xl mb-4 shadow-lg ring-4 ring-white">
          <LogIn className="w-8 h-8 text-white" />
        </div>
        <h1 className="text-2xl font-black tracking-tight">
          <span className="text-blue-700 uppercase">Global</span>
          <span className="text-orange-500 uppercase">service</span>
        </h1>
        <p className="text-slate-500 text-sm font-medium">Remanejamento de Funcionários</p>
      </div>

      <form onSubmit={isRegistering ? handleRegister : handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">Nome de Usuário</label>
          <input
            type="text"
            className="w-full px-4 py-3 rounded-lg border border-slate-300 focus:ring-2 focus:ring-blue-700 focus:border-transparent transition-all outline-none"
            placeholder="Seu nome"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">PIN (4-6 dígitos)</label>
          <input
            type="password"
            maxLength={6}
            className="w-full px-4 py-3 rounded-lg border border-slate-300 focus:ring-2 focus:ring-blue-700 focus:border-transparent transition-all outline-none"
            placeholder="••••"
            value={pin}
            onChange={(e) => setPin(e.target.value.replace(/\D/g, ''))}
          />
        </div>

        <button
          disabled={isLoading}
          type="submit"
          className="w-full bg-blue-700 hover:bg-blue-800 text-white font-bold py-3 rounded-lg shadow-md transition-all active:scale-[0.98] disabled:opacity-50 flex items-center justify-center gap-2"
        >
          {isLoading ? (
            <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
          ) : isRegistering ? (
            <>
              <UserPlus className="w-5 h-5" /> Cadastrar
            </>
          ) : (
            <>
              <LogIn className="w-5 h-5" /> Entrar
            </>
          )}
        </button>
      </form>

      <div className="mt-6 text-center">
        <button
          onClick={() => setIsRegistering(!isRegistering)}
          className="text-orange-600 font-bold text-sm hover:underline"
        >
          {isRegistering ? 'Já tem conta? Entre aqui' : 'Não tem conta? Cadastre-se'}
        </button>
      </div>
    </motion.div>
  );
}
