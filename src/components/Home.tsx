import React from 'react';
import { motion } from 'motion/react';
import { Send, History, ArrowRight } from 'lucide-react';

interface HomeProps {
  onStart: () => void;
}

export function Home({ onStart }: HomeProps) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      className="text-center py-12"
    >
      <div className="mb-8 inline-block bg-orange-100 p-6 rounded-full border-4 border-white shadow-xl">
        <Send className="w-16 h-16 text-orange-600" />
      </div>
      
      <h1 className="text-4xl font-black text-slate-800 mb-4 tracking-tight">
        <span className="text-blue-700">GLOBAL</span>
        <span className="text-orange-500">SERVICE</span>
      </h1>
      
      <p className="text-slate-600 max-w-xl mx-auto mb-12 text-lg leading-relaxed">
        Gerencie e envie solicitações através do WhatsApp de forma rápida e organizada.
      </p>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-2xl mx-auto">
        <button
          onClick={onStart}
          className="group flex items-center justify-between p-6 bg-blue-700 text-white rounded-2xl shadow-lg hover:bg-blue-800 transition-all hover:-translate-y-1 border-b-4 border-blue-900"
        >
          <div className="text-left">
            <p className="font-bold text-xl mb-1">Novo Registro</p>
            <p className="text-sm text-blue-100">Iniciar remanejamento</p>
          </div>
          <ArrowRight className="w-6 h-6 group-hover:translate-x-1 transition-transform" />
        </button>

        <div className="flex items-center justify-between p-6 bg-white border border-slate-200 text-slate-800 rounded-2xl shadow-sm border-b-4 border-slate-300">
          <div className="text-left">
            <p className="font-bold text-xl mb-1">Histórico</p>
            <p className="text-sm text-slate-500">Registros anteriores</p>
          </div>
          <History className="w-6 h-6 text-orange-500" />
        </div>
      </div>
    </motion.div>
  );
}
