import React, { useState, useEffect } from 'react';
import { db } from '../lib/firebase';
import { collection, query, orderBy, onSnapshot } from 'firebase/firestore';
import { Remanejamento } from '../lib/utils';
import { Search, Calendar, MapPin, User, ChevronRight, Clock, ArrowLeft } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface HistoryListProps {
  onBack: () => void;
}

export function HistoryList({ onBack }: HistoryListProps) {
  const [remanejamentos, setRemanejamentos] = useState<Remanejamento[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedItem, setSelectedItem] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const q = query(collection(db, 'remanejamentos'), orderBy('timestamp', 'desc'));
    const unsub = onSnapshot(q, (snap) => {
      const data = snap.docs.map(doc => ({ id: doc.id, ...doc.data() } as Remanejamento));
      setRemanejamentos(data);
      setIsLoading(false);
    });
    return () => unsub();
  }, []);

  const filtered = remanejamentos.filter(item => 
    item.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.solicitante.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.origem.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.destino.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.98 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.98 }}
      className="space-y-6"
    >
      <div className="flex flex-col sm:flex-row gap-4">
        <button
          onClick={onBack}
          className="flex items-center justify-center gap-2 px-6 py-4 bg-white border border-slate-200 rounded-2xl text-slate-600 font-bold hover:bg-slate-50 transition-all shadow-sm border-b-4 border-slate-300"
        >
          <ArrowLeft className="w-5 h-5" />
          Voltar
        </button>
        <div className="relative flex-1">
          <Search className="absolute left-4 top-4 w-5 h-5 text-slate-400" />
          <input
            type="text"
            placeholder="Pesquisar..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-12 pr-4 py-4 bg-white border border-slate-200 rounded-2xl shadow-sm focus:ring-2 focus:ring-blue-700 outline-none transition-all"
          />
        </div>
      </div>

      {isLoading ? (
        <div className="grid gap-4">
          {[1, 2, 3].map(i => (
            <div key={i} className="h-24 bg-white rounded-2xl animate-pulse border border-slate-100"></div>
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div className="bg-white p-12 rounded-2xl border border-slate-200 text-center shadow-inner">
          <p className="text-slate-500">Nenhum registro encontrado.</p>
        </div>
      ) : (
        <div className="grid gap-3">
          {filtered.map((item) => (
            <div 
              key={item.id}
              className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden transition-all hover:shadow-md border-b-4 border-slate-300"
            >
              <button
                onClick={() => setSelectedItem(selectedItem === item.id ? null : item.id!)}
                className="w-full p-4 flex items-center justify-between text-left"
              >
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-orange-50 rounded-xl flex items-center justify-center text-orange-600">
                    <User className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="font-bold text-slate-800">{item.nome}</h3>
                    <div className="flex items-center gap-2 text-xs text-slate-500 font-medium">
                      <span className="bg-blue-50 text-blue-700 px-2 py-0.5 rounded uppercase font-bold">{item.drt}</span>
                      <span>•</span>
                      <span>{item.origem} → {item.destino}</span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <div className="hidden sm:block text-right">
                    <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Solicitado por</p>
                    <p className="text-sm font-bold text-slate-700">{item.solicitante}</p>
                  </div>
                  <ChevronRight className={`w-5 h-5 text-slate-300 transition-transform ${selectedItem === item.id ? 'rotate-90' : ''}`} />
                </div>
              </button>

              <AnimatePresence>
                {selectedItem === item.id && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    className="border-t border-slate-100 bg-slate-50 p-6"
                  >
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 text-sm">
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-white rounded-lg shadow-sm">
                          <Calendar className="w-4 h-4 text-blue-700" />
                        </div>
                        <div>
                          <p className="text-xs text-slate-400 font-bold uppercase">Serviço / Folga</p>
                          <p className="font-bold text-slate-800">{item.dataServico} / {item.dataFolga}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-white rounded-lg shadow-sm">
                          <Clock className="w-4 h-4 text-orange-500" />
                        </div>
                        <div>
                          <p className="text-xs text-slate-400 font-bold uppercase">Turno / Escala</p>
                          <p className="font-bold text-slate-800">{item.turno} - {item.escala}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-white rounded-lg shadow-sm">
                          <MapPin className="w-4 h-4 text-blue-700" />
                        </div>
                        <div>
                          <p className="text-xs text-slate-400 font-bold uppercase">Fiscal</p>
                          <p className="font-bold text-slate-800">{item.fiscal}</p>
                        </div>
                      </div>
                      <div className="sm:col-span-2 lg:col-span-3 mt-2 bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
                        <p className="text-xs text-slate-400 mb-2 font-bold uppercase tracking-wider">Motivo do Remanejamento</p>
                        <p className="text-slate-700 font-medium italic leading-relaxed">"{item.motivo}"</p>
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          ))}
        </div>
      )}
    </motion.div>
  );
}
