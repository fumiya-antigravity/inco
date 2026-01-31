import CreateTaskModal from '../features/task/CreateTaskModal';
import { Menu, Search, Bell, Plus } from 'lucide-react';
import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';

const Header = () => {
 const { setIsMobileMenuOpen } = useApp();
 const [isTaskModalOpen, setIsTaskModalOpen] = useState(false);

 return (
 <header className="h-14 flex items-center justify-between px-4 border-b border-slate-200 bg-white z-10 flex-shrink-0">
 <div className="flex items-center gap-3 flex-1">
 <button
 onClick={() => setIsMobileMenuOpen(true)}
 className="md:hidden p-2 -ml-2 text-slate-500 hover:bg-slate-100 rounded-lg transition-colors"
 >
 <Menu size={20} />
 </button>

 <div className="relative max-w-md w-full md:w-64 hidden md:block">
 <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={14} />
 <input type="text" placeholder="検索" className="w-full pl-9 pr-4 py-1.5 bg-slate-100 rounded-lg text-sm focus:outline-none" />
 </div>
 </div>

 <div className="flex items-center gap-2 md:gap-4 pl-2">
 <button className="text-slate-500 hover:bg-slate-100 p-2 rounded-full relative transition-colors">
 <Bell size={20} />
 <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-rose-500 rounded-full ring-2 ring-white"></span>
 </button>

 <div className="w-8 h-8 bg-indigo-600 rounded-full flex items-center justify-center text-white text-xs font-bold cursor-pointer ring-2 ring-indigo-100 hover:ring-indigo-300 transition-all">
 ME
 </div>
 </div>

 <CreateTaskModal isOpen={isTaskModalOpen} onClose={() => setIsTaskModalOpen(false)} />
 </header>
 );
};

export default Header;
