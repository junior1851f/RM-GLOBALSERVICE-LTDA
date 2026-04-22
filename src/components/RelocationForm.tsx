import React, { useState } from 'react';
import { User, Remanejamento } from '../lib/utils';
import { db } from '../lib/firebase';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { toast } from 'react-hot-toast';
import { Send, Users, MapPin, Calendar, Clock, ClipboardList, UserCheck, ArrowLeft } from 'lucide-react';
import { motion } from 'motion/react';

interface RelocationFormProps {
  user: User;
  whatsappNumber: string;
  onBack: () => void;
}

export function RelocationForm({ user, whatsappNumber, onBack }: RelocationFormProps) {
  const [formData, setFormData] = useState({
    nome: '',
    drt: '',
    origem: '',
    destino: '',
    fiscal: '',
    turno: 'Diurno',
    dataServico: '',
    dataFolga: '',
    escala: '12x36',
    motivo: ''
  });

  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validation
    const emptyFields = Object.entries(formData).filter(([_, value]) => !value);
    if (emptyFields.length > 0) {
      toast.error('Preencha todos os campos obrigatórios');
      return;
    }

    setIsSubmitting(true);
    try {
      const remanejamento: Remanejamento = {
        ...formData,
        solicitante: user.name,
        timestamp: serverTimestamp() as any,
        turno: formData.turno as any,
        escala: formData.escala as any
      };

      // Save to Firebase
      await addDoc(collection(db, 'remanejamentos'), remanejamento);

      // Generate WhatsApp message
      const message = `🔄 *REMANEJAMENTO DE FUNCIONÁRIO*
👤 *Solicitante:* ${user.name}

*NOME:* ${formData.nome}
*DRT:* ${formData.drt}
*ORIGEM:* ${formData.origem}
*DESTINO:* ${formData.destino}
*FISCAL:* ${formData.fiscal}
*TURNO:* ${formData.turno}
*DATA SERVIÇO:* ${formData.dataServico}
*DATA FOLGA:* ${formData.dataFolga}
*ESCALA:* ${formData.escala}
*MOTIVO:* ${formData.motivo}
---
*Globalservice Serviços Empresariais Ltda*`;

      const encodedMessage = encodeURIComponent(message);
      const whatsappUrl = `https://wa.me/${whatsappNumber.replace(/\D/g, '')}?text=${encodedMessage}`;
      
      // Open WhatsApp
      window.open(whatsappUrl, '_blank');

      // Clear form
      setFormData({
        nome: '',
        drt: '',
        origem: '',
        destino: '',
        fiscal: '',
        turno: 'Diurno',
        dataServico: '',
        dataFolga: '',
        escala: '12x36',
        motivo: ''
      });

      toast.success('Remanejamento registrado e enviado!');
    } catch (err) {
      toast.error('Erro ao salvar remanejamento');
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 20 }}
      className="bg-white rounded-2xl shadow-xl border border-slate-200 overflow-hidden"
    >
      <div className="bg-slate-50 p-6 border-b border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2">
            <ClipboardList className="w-5 h-5 text-orange-500" />
            Formulário de Remanejamento
          </h2>
          <p className="text-sm text-slate-500">Preencha os dados abaixo para gerar a solicitação</p>
        </div>
        <button
          onClick={onBack}
          className="flex items-center justify-center gap-2 px-4 py-2 bg-white border border-slate-200 rounded-lg text-slate-600 font-semibold hover:bg-slate-100 transition-colors shadow-sm"
        >
          <ArrowLeft className="w-4 h-4" />
          Voltar
        </button>
      </div>

      <form onSubmit={handleSubmit} className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-4">
          <div className="relative">
            <label className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1 block">Funcionário</label>
            <div className="relative">
              <Users className="absolute left-3 top-3.5 w-4 h-4 text-slate-400" />
              <input
                name="nome"
                value={formData.nome}
                onChange={handleChange}
                placeholder="Nome completo"
                className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-700 outline-none transition-all"
              />
            </div>
          </div>

          <div className="relative">
            <label className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1 block">DRT</label>
            <div className="relative">
              <ClipboardList className="absolute left-3 top-3.5 w-4 h-4 text-slate-400" />
              <input
                name="drt"
                value={formData.drt}
                onChange={handleChange}
                placeholder="Matrícula DRT"
                className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-700 outline-none transition-all"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="relative">
              <label className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1 block">Origem</label>
              <div className="relative">
                <MapPin className="absolute left-3 top-3.5 w-4 h-4 text-slate-400" />
                <input
                  name="origem"
                  value={formData.origem}
                  onChange={handleChange}
                  placeholder="Local orig."
                  className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-700 outline-none transition-all"
                />
              </div>
            </div>
            <div className="relative">
              <label className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1 block">Destino</label>
              <div className="relative">
                <MapPin className="absolute left-3 top-3.5 w-4 h-4 text-slate-400" />
                <input
                  name="destino"
                  value={formData.destino}
                  onChange={handleChange}
                  placeholder="Local dest."
                  className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-700 outline-none transition-all"
                />
              </div>
            </div>
          </div>

          <div className="relative">
            <label className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1 block">Fiscal Responsável</label>
            <div className="relative">
              <UserCheck className="absolute left-3 top-3.5 w-4 h-4 text-slate-400" />
              <input
                name="fiscal"
                value={formData.fiscal}
                onChange={handleChange}
                placeholder="Nome do fiscal"
                className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-700 outline-none transition-all"
              />
            </div>
          </div>
        </div>

        <div className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1 block">Turno</label>
              <div className="relative">
                <Clock className="absolute left-3 top-3.5 w-4 h-4 text-slate-400" />
                <select
                  name="turno"
                  value={formData.turno}
                  onChange={handleChange}
                  className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-700 outline-none transition-all appearance-none cursor-pointer"
                >
                  <option value="Diurno">Diurno</option>
                  <option value="Noturno">Noturno</option>
                </select>
              </div>
            </div>
            <div>
              <label className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1 block">Escala</label>
              <div className="relative">
                <ClipboardList className="absolute left-3 top-3.5 w-4 h-4 text-slate-400" />
                <select
                  name="escala"
                  value={formData.escala}
                  onChange={handleChange}
                  className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-700 outline-none transition-all appearance-none cursor-pointer"
                >
                  <option value="12x36">12x36</option>
                  <option value="5x2">5x2</option>
                  <option value="6x1">6x1</option>
                </select>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1 block">Data de Serviço</label>
              <div className="relative">
                <Calendar className="absolute left-3 top-3.5 w-4 h-4 text-slate-400" />
                <input
                  type="date"
                  name="dataServico"
                  value={formData.dataServico}
                  onChange={handleChange}
                  className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-700 outline-none transition-all cursor-pointer"
                />
              </div>
            </div>
            <div>
              <label className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1 block">Data de Folga</label>
              <div className="relative">
                <Calendar className="absolute left-3 top-3.5 w-4 h-4 text-slate-400" />
                <input
                  type="date"
                  name="dataFolga"
                  value={formData.dataFolga}
                  onChange={handleChange}
                  className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-700 outline-none transition-all cursor-pointer"
                />
              </div>
            </div>
          </div>

          <div>
            <label className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1 block">Motivo</label>
            <textarea
              name="motivo"
              value={formData.motivo}
              onChange={handleChange}
              rows={3}
              placeholder="Descreva o motivo do remanejamento..."
              className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-700 outline-none transition-all resize-none"
            />
          </div>
        </div>

        <div className="md:col-span-2 pt-4">
          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full bg-blue-700 hover:bg-blue-800 text-white font-bold py-4 rounded-xl shadow-lg transition-all active:scale-[0.98] flex items-center justify-center gap-3 disabled:opacity-50 border-b-4 border-blue-900"
          >
            {isSubmitting ? (
              <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
            ) : (
              <>
                <Send className="w-5 h-5" /> Enviar p/ WhatsApp & Salvar
              </>
            )}
          </button>
        </div>
      </form>
    </motion.div>
  );
}
