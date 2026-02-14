
import React, { useState, useEffect, useRef } from 'react';
import { PharmacovigilanceReport, ChatMessage } from '../types';

interface ChatbotSectionProps {
  report: PharmacovigilanceReport;
  onUpdateReport: (report: PharmacovigilanceReport) => void;
}

export const ChatbotSection: React.FC<ChatbotSectionProps> = ({ report, onUpdateReport }) => {
  const [messages, setMessages] = useState<ChatMessage[]>(report.chatHistory || []);
  const [inputText, setInputText] = useState('');
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (messages.length === 0) {
      const medicineNames = report.extractedData?.medicines?.map(m => m.name).join(', ') || 'your medications';
      const firstMsg: ChatMessage = {
        role: 'bot',
        text: `Hello. I am the DrugWatch safety assistant. I have some follow-up questions regarding your report involving ${medicineNames}.`
      };
      setMessages([firstMsg]);
      triggerBotNextQuestion(0, [firstMsg]);
    }
  }, []);

  useEffect(() => {
    scrollRef.current?.scrollTo(0, scrollRef.current.scrollHeight);
  }, [messages]);

  const triggerBotNextQuestion = (index: number, currentMsgs: ChatMessage[]) => {
    const questions = report.analysis?.followUpQuestions || [];
    if (index < questions.length) {
      setTimeout(() => {
        const botMsg: ChatMessage = {
          role: 'bot',
          text: questions[index]
        };
        const newMsgs = [...currentMsgs, botMsg];
        setMessages(newMsgs);
        setCurrentQuestionIndex(index + 1);
        onUpdateReport({ ...report, chatHistory: newMsgs });
      }, 1000);
    } else if (index === questions.length) {
      setTimeout(() => {
        const botMsg: ChatMessage = {
          role: 'bot',
          text: "Thank you for providing these details. Our safety team has been updated."
        };
        const newMsgs = [...currentMsgs, botMsg];
        setMessages(newMsgs);
        onUpdateReport({ ...report, chatHistory: newMsgs });
      }, 1000);
    }
  };

  const handleSend = () => {
    if (!inputText.trim()) return;
    const userMsg: ChatMessage = { role: 'user', text: inputText };
    const newMsgs = [...messages, userMsg];
    setMessages(newMsgs);
    setInputText('');
    onUpdateReport({ ...report, chatHistory: newMsgs });
    triggerBotNextQuestion(currentQuestionIndex, newMsgs);
  };

  return (
    <div className="flex flex-col h-[600px] bg-white rounded-3xl shadow-xl shadow-slate-200 border border-slate-100 overflow-hidden">
      <div className="bg-slate-900 text-white p-5 flex items-center gap-3">
        <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center">
          <i className="fa-solid fa-robot"></i>
        </div>
        <div>
          <h2 className="font-bold text-sm">Pharma Safety Assistant</h2>
          <p className="text-[10px] text-blue-400 font-black uppercase tracking-widest">Active Follow-up Session</p>
        </div>
      </div>

      <div 
        ref={scrollRef}
        className="flex-1 overflow-y-auto p-6 space-y-4 bg-slate-50"
      >
        {messages.map((m, i) => (
          <div 
            key={i} 
            className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'} animate-fade-in`}
          >
            <div className={`max-w-[80%] p-4 rounded-2xl text-sm shadow-sm ${
              m.role === 'user' 
                ? 'bg-blue-600 text-white rounded-tr-none' 
                : 'bg-white text-slate-800 border border-slate-100 rounded-tl-none'
            }`}>
              {m.text}
            </div>
          </div>
        ))}
      </div>

      <div className="p-4 bg-white border-t border-slate-100 flex gap-2">
        <input 
          type="text" 
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleSend()}
          placeholder="Type your response..."
          className="flex-1 bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:ring-2 focus:ring-blue-500 outline-none"
        />
        <button 
          onClick={handleSend}
          className="w-12 h-12 bg-blue-600 text-white rounded-xl flex items-center justify-center hover:bg-blue-700 transition-all shadow-lg shadow-blue-100"
        >
          <i className="fa-solid fa-paper-plane"></i>
        </button>
      </div>
    </div>
  );
};
