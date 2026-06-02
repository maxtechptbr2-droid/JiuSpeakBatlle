/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { 
  DollarSign, 
  BookOpen, 
  PlusCircle, 
  Award, 
  ArrowUpRight, 
  CheckCircle2, 
  Users, 
  Percent,
  TrendingUp,
  FileText
} from 'lucide-react';
import { UserProfile, Course } from '../types';

interface CreatorPanelProps {
  user: UserProfile;
  courses: Course[];
  updateUser: (newUser: Partial<UserProfile>) => void;
  onAddNewCourse: (newCourse: Course) => void;
  onAddAuditLog: (type: any, desc: string, amtBRL?: number, amtKC?: number) => void;
  showToast: (msg: string, type?: 'success' | 'info' | 'error') => void;
}

export default function CreatorPanel({ 
  user, 
  courses, 
  updateUser, 
  onAddNewCourse, 
  onAddAuditLog, 
  showToast 
}: CreatorPanelProps) {
  
  // Local form for creating new courses
  const [courseForm, setCourseForm] = useState({
    title: '',
    description: '',
    priceBRL: 49.90,
  });

  // Local form for PIX withdrawals (Saque)
  const [saqueForm, setSaqueForm] = useState({
    amount: 150.00,
    keyType: 'CPF' as 'CPF' | 'CNPJ' | 'Email' | 'Celular' | 'Aleatoria',
    pixKey: ''
  });

  const handleCreateCourse = (e: React.FormEvent) => {
    e.preventDefault();
    if (!courseForm.title || !courseForm.description) {
      showToast("Preencha todos os campos do curso acadêmico!", "error");
      return;
    }

    const newCourseObj: Course = {
      id: `course_${Date.now()}`,
      title: courseForm.title,
      description: courseForm.description,
      creatorId: user.id,
      creatorName: user.name,
      creatorBadge: user.belt,
      priceBRL: parseFloat(courseForm.priceBRL as any) || 0,
      rating: 5.0,
      studentCount: 0,
      imageUrl: 'https://images.unsplash.com/photo-1555597673-b21d5c935865?auto=format&fit=crop&q=80&w=400',
      lessons: [
        {
          id: `lesson_${Date.now()}_1`,
          title: 'Aula Inicial: Postura Corporal',
          description: 'Vídeo-manual introdutório detalhando biomecânica dos quadrantes corporais.',
          duration: '12 min',
          quiz: [
            {
              id: `q_${Date.now()}_1`,
              question: 'Qual a principal vantagem da postura ereta ao passar guarda?',
              options: [
                'Previnir esgrima de lapela direta.',
                'Aumento da gravidade de pressão sobre o quadril do guardeiro.',
                'Cansar as pernas dele sem esforço corporal.',
                'Nenhuma das anteriores.'
              ],
              correctOptionIndex: 1,
              explanation: 'A postura verticalizada foca a força da sua pélvis no centro de rotação de oponente, estourando a aderência mais facilmente.'
            }
          ]
        }
      ]
    };

    onAddNewCourse(newCourseObj);
    
    onAddAuditLog(
      'lesson_completed',
      `Editor Sênior: Professor publicou novo curso "${newCourseObj.title}" por R$ ${newCourseObj.priceBRL.toFixed(2)} na plataforma global.`,
      newCourseObj.priceBRL
    );

    showToast(`Curso "${courseForm.title}" publicado e indexado com sucesso no Hotmart JiuSpeak!`, 'success');
    
    // Reset course form
    setCourseForm({
      title: '',
      description: '',
      priceBRL: 49.90
    });
  };

  const handleRequestSaque = (e: React.FormEvent) => {
    e.preventDefault();
    
    const amt = parseFloat(saqueForm.amount as any) || 0;
    
    if (amt <= 0) {
      showToast("Valor do saque de comissões inválido!", "error");
      return;
    }

    if (user.balanceBRL < amt) {
      showToast(`Saldo insuficiente para saque de comissões! Seu saldo disponível é de R$ ${user.balanceBRL.toFixed(2)}.`, "error");
      return;
    }

    if (!saqueForm.pixKey.trim()) {
      showToast("Insira uma Chave PIX destinatária válida!", "error");
      return;
    }

    const updatedBalance = user.balanceBRL - amt;
    updateUser({ balanceBRL: updatedBalance });

    onAddAuditLog(
      'withdrawal',
      `Solicitação de Saque PIX: Professor "${user.name}" transferiu R$ ${amt.toFixed(2)} de comissões para conta associada (Chave ${saqueForm.keyType}: "${saqueForm.pixKey}").`,
      amt
    );

    showToast(`Pedido de saque enviado com sucesso! R$ ${amt.toFixed(2)} em compensação na rede nacional.`, "success");
    
    // reset saque form
    setSaqueForm({
      amount: 100.00,
      keyType: 'CPF',
      pixKey: ''
    });
  };

  // calculate creator specific sales metrics
  const creatorCourses = courses.filter(c => c.creatorId === user.id || c.creatorId === 'prof_alliance');
  const simulatedSalesCount = creatorCourses.reduce((acc, c) => acc + c.studentCount, 0);
  const simulatedSalesRevenues = creatorCourses.reduce((acc, c) => acc + (c.studentCount * c.priceBRL), 0);

  return (
    <div className="space-y-6" id="bjj-creator-panel">
      
      {/* Upper overview metrics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        
        <div className="bg-slate-950/85 p-5 rounded-xl border border-slate-800 space-y-1">
          <div className="flex justify-between text-slate-500 font-mono text-[10px] uppercase">
            <span>Saldo para Saque</span>
            <DollarSign className="w-4 h-4 text-emerald-500" />
          </div>
          <p className="text-2xl font-black text-white">R$ {user.balanceBRL.toFixed(2)}</p>
          <span className="text-[10px] text-slate-500 block">Comissões processadas Hotmart</span>
        </div>

        <div className="bg-slate-950/85 p-5 rounded-xl border border-slate-800 space-y-1">
          <div className="flex justify-between text-slate-500 font-mono text-[10px] uppercase">
            <span>Matrículas Ativas</span>
            <Users className="w-4 h-4 text-violet-400" />
          </div>
          <p className="text-2xl font-black text-white">{simulatedSalesCount}</p>
          <span className="text-[10px] text-slate-500 block">Alunos inscritos nos seus cursos</span>
        </div>

        <div className="bg-slate-950/85 p-5 rounded-xl border border-slate-800 space-y-1">
          <div className="flex justify-between text-slate-500 font-mono text-[10px] uppercase">
            <span>Faturamento Bruto</span>
            <TrendingUp className="w-4 h-4 text-yellow-500" />
          </div>
          <p className="text-2xl font-black text-white">R$ {simulatedSalesRevenues.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</p>
          <span className="text-[10px] text-slate-500 block">Vendas acumuladas</span>
        </div>

        <div className="bg-slate-950/85 p-5 rounded-xl border border-slate-800 space-y-1">
          <div className="flex justify-between text-slate-500 font-mono text-[10px] uppercase">
            <span>Sua Comissão</span>
            <Percent className="w-4 h-4 text-indigo-400" />
          </div>
          <p className="text-2xl font-black text-white">85%</p>
          <span className="text-[10px] text-slate-500 block">Taxa de intermediação SaaS: 15%</span>
        </div>

      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Course formulation form */}
        <div className="bg-slate-950/60 p-6 rounded-2xl border border-slate-800 space-y-4">
          <div className="pb-3 border-b border-slate-800 flex justify-between items-center">
            <h4 className="font-display font-bold text-[15px] text-slate-201 flex items-center gap-2">
              <PlusCircle className="w-5 h-5 text-violet-400" /> Publicar Novo Curso (Hotmart Mode)
            </h4>
            <span className="bg-violet-500/10 text-violet-400 border border-violet-500/20 text-[9px] px-2 py-0.5 rounded uppercase font-mono font-bold">
              CONTA PRO
            </span>
          </div>

          <form onSubmit={handleCreateCourse} className="space-y-4 text-xs">
            <div className="space-y-1">
              <label className="text-slate-500 font-mono font-bold text-[10px] uppercase">Título do Curso</label>
              <input 
                type="text" 
                required
                placeholder="Ex: Segredos da Meia Guarda Profunda"
                value={courseForm.title}
                onChange={(e) => setCourseForm({ ...courseForm, title: e.target.value })}
                className="w-full bg-slate-900 border border-slate-750 text-slate-250 p-2.5 rounded-xl focus:outline-none focus:border-violet-500"
              />
            </div>

            <div className="space-y-1">
              <label className="text-slate-500 font-mono font-bold text-[10px] uppercase">Detalhamento dos Conceitos</label>
              <textarea 
                required
                placeholder="Descreva quais defesas e raspagens os atletas serão testados nesta grade teórica..."
                value={courseForm.description}
                onChange={(e) => setCourseForm({ ...courseForm, description: e.target.value })}
                rows={3}
                className="w-full bg-slate-900 border border-slate-750 text-slate-255 p-2.5 rounded-xl focus:outline-none focus:border-violet-500 resize-none leading-relaxed"
              />
            </div>

            <div className="space-y-1">
              <label className="text-slate-500 font-mono font-bold text-[10px] uppercase">Preço na Vitrine (BRL)</label>
              <input 
                type="number" 
                min={0}
                required
                step={0.01}
                value={courseForm.priceBRL}
                onChange={(e) => setCourseForm({ ...courseForm, priceBRL: parseFloat(e.target.value) || 0 })}
                className="w-full bg-slate-900 border border-slate-755 text-slate-250 p-2.5 rounded-xl focus:outline-none focus:border-violet-505"
              />
              <span className="text-[10px] text-slate-500">Defina R$ 0,00 para criar um manual gratuito disponível para todos os alunos na triagem.</span>
            </div>

            <button
              type="submit"
              className="w-full py-2.5 bg-violet-650 hover:bg-violet-600 text-white font-bold rounded-xl uppercase tracking-wider transition-all shadow shadow-violet-600/10 cursor-pointer"
            >
              🚀 Registrar & Publicar na Plataforma
            </button>
          </form>
        </div>

        {/* PIX Withdrawal Form */}
        <div className="bg-slate-950/60 p-6 rounded-2xl border border-slate-800 space-y-4">
          <div className="pb-3 border-b border-slate-800">
            <h4 className="font-display font-bold text-[15px] text-slate-201 flex items-center gap-2 animate-bounce">
              <DollarSign className="w-5 h-5 text-emerald-500" /> Solicitar Saque via PIX Rápido
            </h4>
            <p className="text-[11px] text-slate-450 mt-1 font-normal leading-snug">
              Retire suas comissões de vendas diretamente para sua carteira. Os saques são auditados e transitam instantaneamente na rede.
            </p>
          </div>

          <form onSubmit={handleRequestSaque} className="space-y-4 text-xs">
            <div className="bg-slate-900/60 p-4 rounded-xl border border-slate-800 flex justify-between items-center">
              <span className="text-slate-450">Saldo Disponível:</span>
              <span className="text-xl font-black text-emerald-500">R$ {user.balanceBRL.toFixed(2)}</span>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="text-slate-500 font-mono font-bold text-[10px] uppercase">Tipo de Chave</label>
                <select
                  value={saqueForm.keyType}
                  onChange={(e) => setSaqueForm({ ...saqueForm, keyType: e.target.value as any })}
                  className="w-full bg-slate-905 border border-slate-750 p-2 rounded-lg text-slate-350 cursor-pointer focus:outline-none"
                >
                  <option value="CPF">CPF</option>
                  <option value="CNPJ">CNPJ</option>
                  <option value="Email">E-mail</option>
                  <option value="Celular">Telefone Celular</option>
                  <option value="Aleatoria">Chave Aleatória</option>
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-slate-500 font-mono font-bold text-[10px] uppercase">Valor do Saque (R$)</label>
                <input 
                  type="number" 
                  min={10}
                  step={0.01}
                  required
                  value={saqueForm.amount}
                  onChange={(e) => setSaqueForm({ ...saqueForm, amount: parseFloat(e.target.value) || 0 })}
                  className="w-full bg-slate-905 border border-slate-750 p-2 rounded-lg text-slate-250 focus:outline-none"
                />
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-slate-500 font-mono font-bold text-[10px] uppercase">Chave PIX Destino</label>
              <input 
                type="text" 
                required
                placeholder="Ex: 123.456.789-00 ou pix@professor.com"
                value={saqueForm.pixKey}
                onChange={(e) => setSaqueForm({ ...saqueForm, pixKey: e.target.value })}
                className="w-full bg-slate-905 border border-slate-755 p-2 rounded-lg text-slate-250 font-mono focus:outline-none focus:border-emerald-500"
              />
            </div>

            <button
              type="submit"
              className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl uppercase tracking-wider transition-all shadow shadow-emerald-600/10 cursor-pointer"
            >
              💸 Solicitar Transferência Rápida
            </button>
          </form>
        </div>

      </div>

    </div>
  );
}
