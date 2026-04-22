import React, { useState, useEffect } from 'react';
import { User, MASTER_PASSWORD } from '../lib/utils';
import { db } from '../lib/firebase';
import { collection, onSnapshot, doc, updateDoc, addDoc, deleteDoc, query, where } from 'firebase/firestore';
import { toast } from 'react-hot-toast';
import { X, Save, Shield, UserPlus, Trash2, Phone, Key, Table } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentWhatsapp: string;
  onLogout: () => void;
}

export function SettingsModal({ isOpen, onClose, currentWhatsapp, onLogout }: SettingsModalProps) {
  const [activeSubTab, setActiveSubTab] = useState<'whatsapp' | 'users'>('whatsapp');
  const [whatsapp, setWhatsapp] = useState(currentWhatsapp);
  const [masterPass, setMasterPass] = useState('');
  const [users, setUsers] = useState<User[]>([]);
  
  // User form
  const [newUserName, setNewUserName] = useState('');
  const [newUserPin, setNewUserPin] = useState('');

  useEffect(() => {
    if (!isOpen) return;
    const unsub = onSnapshot(collection(db, 'users'), (snap) => {
      setUsers(snap.docs.map(d => ({ id: d.id, ...d.data() } as User)));
    });
    return () => unsub();
  }, [isOpen]);

  const handleUpdateWhatsapp = async () => {
    if (masterPass !== MASTER_PASSWORD) {
      toast.error('Senha mestra incorreta');
      return;
    }
    try {
      await updateDoc(doc(db, 'config', 'whatsapp'), { whatsappNumber: whatsapp });
      toast.success('Número atualizado com sucesso');
      setMasterPass('');
    } catch (err) {
      toast.error('Erro ao atualizar');
    }
  };

  const handleAddUser = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newUserName || newUserPin.length < 4 || newUserPin.length > 6) {
      toast.error('Dados de usuário inválidos');
      return;
    }
    try {
      await addDoc(collection(db, 'users'), { name: newUserName, pin: newUserPin });
      toast.success('Usuário criado');
      setNewUserName('');
      setNewUserPin('');
    } catch (err) {
      toast.error('Erro ao criar usuário');
    }
  };

  const handleDeleteUser = async (user: User) => {
    if (user.name === 'Lucio') {
      toast.error('Usuário Lucio não pode ser removido');
      return;
    }
    if (!confirm(`Deseja realmente remover o usuário ${user.name}?`)) return;
    try {
      await deleteDoc(doc(db, 'users', user.id));
      toast.success('Usuário removido');
    } catch (err) {
      toast.error('Erro ao remover usuário');
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        onClick={onClose}
        className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
      />
      
      <motion.div 
        initial={{ opacity: 0, scale: 0.9, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        className="relative bg-white w-full max-w-2xl rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
      >
        <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50">
          <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2">
            <Shield className="w-5 h-5 text-orange-500" />
            Configurações do Sistema
          </h2>
          <button onClick={onClose} className="p-2 hover:bg-slate-200 rounded-full transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="flex border-b border-slate-100">
          <button 
            onClick={() => setActiveSubTab('whatsapp')}
            className={`flex-1 py-3 text-sm font-bold border-b-4 transition-all ${activeSubTab === 'whatsapp' ? 'border-orange-500 text-blue-700 bg-blue-50/50' : 'border-transparent text-slate-500 hover:text-slate-800'}`}
          >
            WhatsApp
          </button>
          <button 
            onClick={() => setActiveSubTab('users')}
            className={`flex-1 py-3 text-sm font-bold border-b-4 transition-all ${activeSubTab === 'users' ? 'border-orange-500 text-blue-700 bg-blue-50/50' : 'border-transparent text-slate-500 hover:text-slate-800'}`}
          >
            Usuários
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-6">
          <AnimatePresence mode="wait">
            {activeSubTab === 'whatsapp' ? (
              <motion.div
                key="whatsapp"
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 10 }}
                className="space-y-6"
              >
                <div className="bg-orange-50 border border-orange-100 p-4 rounded-xl flex items-start gap-4">
                  <Phone className="w-5 h-5 text-orange-600 mt-1" />
                  <div>
                    <p className="font-bold text-orange-900">Número Atual</p>
                    <p className="text-2xl font-black font-mono text-orange-700">{whatsapp}</p>
                  </div>
                </div>

                <div className="space-y-4 pt-4 border-t border-slate-100">
                  <div>
                    <label className="text-sm font-bold text-slate-700 block mb-1">Novo Número WhatsApp</label>
                    <input 
                      type="text" 
                      placeholder="+5592992926772"
                      className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-lg outline-none focus:ring-2 focus:ring-blue-700 transition-all font-bold text-slate-700"
                      value={whatsapp}
                      onChange={(e) => setWhatsapp(e.target.value)}
                    />
                  </div>
                  <div>
                    <label className="text-sm font-bold text-slate-700 block mb-1">Senha Mestra</label>
                    <div className="relative">
                      <Key className="absolute left-3 top-3.5 w-4 h-4 text-slate-400" />
                      <input 
                        type="password" 
                        placeholder="Chave de segurança..."
                        className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-lg outline-none focus:ring-2 focus:ring-blue-700 transition-all"
                        value={masterPass}
                        onChange={(e) => setMasterPass(e.target.value)}
                      />
                    </div>
                  </div>
                  <button 
                    onClick={handleUpdateWhatsapp}
                    className="w-full bg-blue-700 hover:bg-blue-800 text-white font-black py-4 rounded-xl shadow-lg transition-all active:scale-[0.98] border-b-4 border-blue-900"
                  >
                    Alterar Número
                  </button>
                </div>
              </motion.div>
            ) : (
              <motion.div
                key="users"
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 10 }}
                className="space-y-8"
              >
                <div className="bg-slate-50 border border-slate-200 p-6 rounded-2xl border-b-4">
                  <h3 className="font-black text-slate-800 mb-4 flex items-center gap-2 uppercase tracking-wide text-sm">
                    <UserPlus className="w-5 h-5 text-orange-500" /> Novo Usuário
                  </h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <input 
                      placeholder="Nome"
                      className="px-4 py-3 bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-700 outline-none"
                      value={newUserName}
                      onChange={(e) => setNewUserName(e.target.value)}
                    />
                    <input 
                      placeholder="PIN (4-6)"
                      className="px-4 py-3 bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-700 outline-none"
                      value={newUserPin}
                      onChange={(e) => setNewUserPin(e.target.value)}
                    />
                  </div>
                  <button 
                    onClick={handleAddUser}
                    className="w-full mt-6 bg-slate-800 hover:bg-black text-white font-black py-3 rounded-xl transition-all border-b-4 border-slate-950"
                  >
                    Adicionar Usuário
                  </button>
                </div>

                <div className="space-y-2">
                  <h3 className="font-black text-slate-800 mb-2 flex items-center gap-2 uppercase tracking-wide text-sm">
                    <Table className="w-5 h-5 text-blue-700" /> Usuários Cadastrados
                  </h3>
                  <div className="border border-slate-200 rounded-2xl overflow-hidden shadow-sm border-b-4">
                    <table className="w-full text-sm">
                      <thead className="bg-slate-50 border-b border-slate-200">
                        <tr>
                          <th className="px-4 py-4 text-left font-black text-slate-500 uppercase tracking-widest text-[10px]">Nome</th>
                          <th className="px-4 py-4 text-left font-black text-slate-500 uppercase tracking-widest text-[10px]">PIN</th>
                          <th className="px-4 py-4 text-right font-black text-slate-500 uppercase tracking-widest text-[10px]">Ação</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {users.map(u => (
                          <tr key={u.id} className="hover:bg-blue-50 transition-colors">
                            <td className="px-4 py-4 font-bold text-slate-800">{u.name}</td>
                            <td className="px-4 py-4 font-black font-mono text-xs text-orange-600 tracking-widest">{u.pin}</td>
                            <td className="px-4 py-4 text-right">
                              <button 
                                onClick={() => handleDeleteUser(u)}
                                className={`p-2 rounded-xl transition-colors ${u.name === 'Lucio' ? 'text-slate-300 cursor-not-allowed' : 'text-red-500 hover:bg-red-50 hover:shadow-sm'}`}
                                disabled={u.name === 'Lucio'}
                              >
                                <Trash2 className="w-5 h-5" />
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </motion.div>

            )}
          </AnimatePresence>
        </div>

        <div className="p-4 bg-slate-50 border-t border-slate-100 flex gap-4">
          <button 
            onClick={onClose}
            className="flex-1 py-3 text-slate-600 font-bold hover:text-slate-900"
          >
            Fechar
          </button>
          <button 
            onClick={onLogout}
            className="flex-1 py-3 bg-red-100 hover:bg-red-200 text-red-600 font-bold rounded-lg transition-colors"
          >
            Sair do Sistema
          </button>
        </div>
      </motion.div>
    </div>
  );
}
