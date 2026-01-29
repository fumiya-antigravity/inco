import React from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import Header from './Header';
import { useApp } from '../../context/AppContext';

const MainLayout = () => {
    const { isMobileMenuOpen, setIsMobileMenuOpen } = useApp();
    // Note: Mobile menu logic needs to be fully ported or refactored. 
    // For now, keeping the structure ready.

    return (
        <div className="flex h-screen bg-slate-50 dark:bg-black font-sans text-slate-800 dark:text-slate-200 overflow-hidden transition-colors duration-300">
            <Sidebar />

            {/* Mobile Drawer (Simplified port) */}
            {isMobileMenuOpen && (
                <div className="fixed inset-0 z-50 md:hidden">
                    <div
                        className="absolute inset-0 bg-black/60 backdrop-blur-sm transition-opacity"
                        onClick={() => setIsMobileMenuOpen(false)}
                    />
                    <div className="absolute left-0 top-0 bottom-0 w-3/4 max-w-xs bg-slate-900 text-slate-300 flex flex-col shadow-2xl animate-in slide-in-from-left duration-200 border-r border-slate-800">
                        <div className="p-4">Mobile Menu Placeholder</div>
                    </div>
                </div>
            )}

            <div className="flex-1 flex flex-col h-screen overflow-hidden relative bg-white dark:bg-black">
                <Header />
                <div className="flex-1 flex overflow-hidden relative">
                    <Outlet />
                </div>
            </div>
        </div>
    );
};

export default MainLayout;
