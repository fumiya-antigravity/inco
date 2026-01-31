import React, { useState } from 'react';
import { useApp } from '../../../context/AppContext';
import Modal from '../../ui/Modal';
import { ProjectIcon } from '../../common/ProjectIcon';
import * as Icons from 'lucide-react';
import { AlertCircle } from 'lucide-react';

const colors = [
 { id: 'emerald', bg: 'bg-emerald-500' },
 { id: 'blue', bg: 'bg-blue-500' },
 { id: 'orange', bg: 'bg-orange-500' },
 { id: 'purple', bg: 'bg-purple-500' },
 { id: 'rose', bg: 'bg-rose-500' },
];

const icons = [
 'Layout', 'Briefcase', 'Code', 'Database', 'Globe',
 'Server', 'Smartphone', 'Monitor', 'Settings', 'Cpu',
 'Folder', 'Coffee', 'Zap', 'Target', 'Flag'
];

const CreateProjectModal = ({ isOpen, onClose }) => {
 const { addProject } = useApp();
 const [name, setName] = useState('');
 const [key, setKey] = useState('');
 const [selectedColor, setSelectedColor] = useState('emerald');
 const [selectedIcon, setSelectedIcon] = useState('Layout');
 const [error, setError] = useState(null);
 const [isSubmitting, setIsSubmitting] = useState(false);

 const handleKeyChange = (e) => {
 const val = e.target.value.toUpperCase();
 // Allow only A-Z and 0-9
 if (/^[A-Z0-9]*$/.test(val)) {
 setKey(val);
 setError(null);
 }
 };

 const handleSubmit = async (e) => {
 e.preventDefault();
 if (!name || !key) return;

 setIsSubmitting(true);
 setError(null);

 const { error: submitError } = await addProject({
 name,
 key,
 color: selectedColor,
 icon: selectedIcon
 });

 setIsSubmitting(false);

 if (submitError) {
 if (submitError.code === '23505') {
 setError('そのプロジェクトキーは既に使用されています。別のキーを指定してください。');
 } else {
 setError('プロジェクトの作成に失敗しました。時間をおいて再度お試しください。');
 }
 return;
 }

 // Reset and close
 setName('');
 setKey('');
 setSelectedColor('emerald');
 setSelectedIcon('Layout');
 onClose();
 };

 return (
 <Modal isOpen={isOpen} onClose={onClose} title="新規プロジェクト">
 <form onSubmit={handleSubmit} className="space-y-6">
 <div>
 <label className="block text-sm font-bold text-slate-700 mb-1">
 プロジェクト名
 </label>
 <input
 type="text"
 value={name}
 onChange={(e) => setName(e.target.value)}
 className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all"
 placeholder="例: ウェブサイトリニューアル"
 autoFocus
 />
 </div>

 <div>
 <label className="block text-sm font-bold text-slate-700 mb-1">
 プロジェクトキー
 </label>
 <input
 type="text"
 value={key}
 onChange={handleKeyChange}
 className={`w-full px-3 py-2 bg-slate-50 border rounded-lg focus:outline-none focus:ring-2 transition-all font-mono uppercase 
 ${error ? 'border-red-500 focus:ring-red-500/20 focus:border-red-500' : 'border-slate-200 focus:ring-emerald-500/20 focus:border-emerald-500'}`}
 placeholder="EX: WEB"
 maxLength={6}
 />
 {error ? (
 <p className="text-xs text-red-500 mt-1 font-bold flex items-center gap-1">
 <AlertCircle size={12} /> {error}
 </p>
 ) : (
 <p className="text-xs text-slate-400 mt-1">半角英大文字と数字のみ (例: WEB, PRJ1)</p>
 )}
 </div>

 <div className="grid grid-cols-2 gap-6">
 <div>
 <label className="block text-sm font-bold text-slate-700 mb-2">
 カラー
 </label>
 <div className="flex flex-wrap gap-2">
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

 <div>
 <label className="block text-sm font-bold text-slate-700 mb-2">
 アイコン
 </label>
 <div className="flex flex-wrap gap-2">
 {icons.map(iconName => {
 const Icon = Icons[iconName];
 if (!Icon) return null;
 return (
 <button
 key={iconName}
 type="button"
 onClick={() => setSelectedIcon(iconName)}
 className={`w-8 h-8 rounded-lg flex items-center justify-center transition-all border ${selectedIcon === iconName ? 'bg-slate-100 border-emerald-500 text-emerald-500' : 'bg-transparent border-transparent text-slate-400 hover:text-slate-600 hover:bg-slate-50:bg-zinc-800'}`}
 >
 <Icon size={18} />
 </button>
 );
 })}
 </div>
 </div>
 </div>

 {/* Preview */}
 <div className="bg-slate-50 rounded-lg p-4 flex items-center gap-4 border border-slate-100">
 <ProjectIcon color={selectedColor} icon={selectedIcon} size="lg" />
 <div>
 <div className="font-bold text-slate-800">{name || 'プロジェクト名'}</div>
 <div className="text-xs font-mono text-slate-400">{key ? `${key}-1` : 'KEY-1'}</div>
 </div>
 </div>

 <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
 <button
 type="button"
 onClick={onClose}
 className="px-4 py-2 text-sm font-bold text-slate-500 hover:bg-slate-100:bg-zinc-800 rounded-lg transition-colors"
 disabled={isSubmitting}
 >
 キャンセル
 </button>
 <button
 type="submit"
 disabled={!name || !key || isSubmitting}
 className="px-4 py-2 text-sm font-bold bg-emerald-500 text-white rounded-lg hover:bg-emerald-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors shadow-sm shadow-emerald-500/20 flex items-center gap-2"
 >
 {isSubmitting ? '作成中...' : 'プロジェクトを作成'}
 </button>
 </div>
 </form>
 </Modal>
 );
};

export default CreateProjectModal;
