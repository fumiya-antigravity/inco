import React, { useState } from 'react';
import { useApp } from '../../../context/AppContext';
import Modal from '../../ui/Modal';
import { ProjectIcon } from '../../common/ProjectIcon';

const colors = [
    { id: 'emerald', bg: 'bg-emerald-500' },
    { id: 'blue', bg: 'bg-blue-500' },
    { id: 'orange', bg: 'bg-orange-500' },
    { id: 'purple', bg: 'bg-purple-500' },
    { id: 'rose', bg: 'bg-rose-500' },
];

const CreateProjectModal = ({ isOpen, onClose }) => {
    const { addProject } = useApp();
    const [name, setName] = useState('');
    const [key, setKey] = useState('');
    const [selectedColor, setSelectedColor] = useState('emerald');

    const handleSubmit = (e) => {
        e.preventDefault();
        if (!name || !key) return;

        addProject({
            name,
            key: key.toUpperCase(),
            color: selectedColor
        });

        // Reset and close
        setName('');
        setKey('');
        setSelectedColor('emerald');
        onClose();
    };

    return (
        <Modal isOpen={isOpen} onClose={onClose} title="新規プロジェクト">
            <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                    <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-1">
                        プロジェクト名
                    </label>
                    <input
                        type="text"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        className="w-full px-3 py-2 bg-slate-50 dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all dark:text-slate-100"
                        placeholder="例: ウェブサイトリニューアル"
                        autoFocus
                    />
                </div>

                <div>
                    <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-1">
                        プロジェクトキー
                    </label>
                    <input
                        type="text"
                        value={key}
                        onChange={(e) => setKey(e.target.value.toUpperCase())}
                        className="w-full px-3 py-2 bg-slate-50 dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all font-mono uppercase dark:text-slate-100"
                        placeholder="EX: WEB"
                        maxLength={5}
                    />
                    <p className="text-xs text-slate-400 mt-1">タスクIDのプレフィックスに使用されます (例: WEB-12)</p>
                </div>

                <div>
                    <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">
                        カラー
                    </label>
                    <div className="flex items-center gap-3">
                        {colors.map(c => (
                            <button
                                key={c.id}
                                type="button"
                                onClick={() => setSelectedColor(c.id)}
                                className={`w-8 h-8 rounded-full ${c.bg} transition-transform ${selectedColor === c.id ? 'ring-2 ring-offset-2 ring-slate-400 scale-110' : 'hover:scale-110 opacity-70 hover:opacity-100'}`}
                            />
                        ))}
                    </div>
                </div>

                <div className="flex justify-end gap-3 pt-4 border-t border-slate-100 dark:border-zinc-800">
                    <button
                        type="button"
                        onClick={onClose}
                        className="px-4 py-2 text-sm font-bold text-slate-500 hover:bg-slate-100 dark:hover:bg-zinc-800 rounded-lg transition-colors"
                    >
                        キャンセル
                    </button>
                    <button
                        type="submit"
                        disabled={!name || !key}
                        className="px-4 py-2 text-sm font-bold bg-emerald-500 text-white rounded-lg hover:bg-emerald-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors shadow-sm shadow-emerald-500/20"
                    >
                        プロジェクトを作成
                    </button>
                </div>
            </form>
        </Modal>
    );
};

export default CreateProjectModal;
