import React, { useState } from 'react';
import { Plus, User } from 'lucide-react';
import { useApp } from '../../../context/AppContext';
import {
 TypeSelector, PrioritySelector, InlineTaskCreator
} from '../task/SharedComponents';
import { useNavigate, useSearchParams } from 'react-router-dom';

const BoardView = () => {
 const {
 sections, currentProjectTasks, updateTask, addTask, activeProjectId
 } = useApp();
 const navigate = useNavigate();
 const [searchParams, setSearchParams] = useSearchParams();

 // Local state for DnD and Inline Create
 const [creatingTaskId, setCreatingTaskId] = useState(null);
 const [draggedTaskId, setDraggedTaskId] = useState(null);
 const [dragOverSectionId, setDragOverSectionId] = useState(null);

 // DnD Handlers
 const handleDragStart = (e, taskId) => {
 setDraggedTaskId(taskId);
 e.dataTransfer.effectAllowed = "move";
 };

 const handleDragOver = (e, sectionId) => {
 e.preventDefault();
 setDragOverSectionId(sectionId);
 };

 const handleDrop = (e, sectionId) => {
 e.preventDefault();
 setDragOverSectionId(null);
 if (draggedTaskId) {
 updateTask(draggedTaskId, 'sectionId', sectionId);
 setDraggedTaskId(null);
 }
 };

 // Inline Create Handlers
 const startInlineCreate = (sectionId) => {
 const tempId = Date.now();
 const newTask = {
 id: tempId,
 projectIds: [activeProjectId],
 sectionId: sectionId,
 key: 'NEW',
 title: '',
 assignees: [],
 status: sections.find(s => s.id === sectionId)?.title || '未対応',
 completed: false,
 priority: '中',
 type: 'タスク',
 due: '',
 isTemp: true
 };
 addTask(newTask);
 setCreatingTaskId(tempId);
 };

 const handleTaskCreateUpdate = (id, title) => {
 updateTask(id, 'title', title);
 };

 const handleTaskCreateBlur = (id) => {
 const task = currentProjectTasks.find(t => t.id === id);
 if (task && !task.title.trim()) {
 // Remove if empty
 // implementing removeTask is needed in Context, skipping for brevity
 // forcing title for now or keep empty task
 }
 setCreatingTaskId(null);
 };

 const handleTaskClick = (task) => {
 setSearchParams({ task: task.id.toString() });
 };

 const selectedTaskId = parseInt(searchParams.get('task'));

 return (
 <div className="flex-1 overflow-x-auto overflow-y-hidden pb-2 px-4 h-full">
 <div className="flex h-full gap-4 md:gap-6 min-w-max">
 {sections.map(section => (
 <div
 key={section.id}
 onDragOver={(e) => handleDragOver(e, section.id)}
 onDrop={(e) => handleDrop(e, section.id)}
 className={`w-[85vw] md:w-[320px] lg:flex-1 rounded-2xl flex flex-col max-h-full border transition-colors shadow-inner group/column
 ${dragOverSectionId === section.id
 ? 'bg-emerald-50/80 border-emerald-300'
 : 'bg-slate-100/80 border-slate-200/60'
 }`}
 >
 <div className="p-3 md:p-4 flex justify-between items-center sticky top-0 backdrop-blur-sm z-10 rounded-t-2xl border-b border-slate-200/60">
 <div className="flex items-center gap-2">
 <div className={`w-2 h-2 rounded-full ${section.title === '未対応' ? 'bg-slate-400' : section.title === '処理中' ? 'bg-blue-500' : 'bg-emerald-500'}`} />
 <h3 className="font-bold text-slate-700 text-sm md:text-base">{section.title}</h3>
 </div>
 <div className="flex items-center gap-2">
 <span className="bg-white text-slate-500 text-xs px-2 py-0.5 rounded-full border border-slate-200 font-medium">
 {currentProjectTasks.filter(t => t.sectionId === section.id).length}
 </span>
 <button
 onClick={() => startInlineCreate(section.id)}
 className="p-1 hover:bg-slate-200:bg-zinc-700 rounded-lg text-slate-500 hover:text-emerald-600 transition-colors"
 title={`${section.title}にタスクを追加`}
 >
 <Plus size={16} />
 </button>
 </div>
 </div>

 <div className="p-2 md:p-3 space-y-3 overflow-y-auto flex-1 custom-scrollbar">
 {currentProjectTasks.filter(t => t.sectionId === section.id).map(task => (
 <div key={task.id}>
 {creatingTaskId === task.id ? (
 <InlineTaskCreator task={task} onUpdate={handleTaskCreateUpdate} onBlur={handleTaskCreateBlur} />
 ) : (
 <div
 draggable
 onDragStart={(e) => handleDragStart(e, task.id)}
 onClick={() => handleTaskClick(task)}
 className={`bg-white p-3 md:p-4 rounded-xl shadow-sm border hover:shadow-md hover:-translate-y-0.5 transition-all duration-200 cursor-grab active:cursor-grabbing group relative
 ${draggedTaskId === task.id ? 'opacity-50' : 'opacity-100'}
 ${draggedTaskId === task.id ? 'border-dashed border-slate-300' : 'border-slate-100'}
 ${selectedTaskId === task.id ? 'ring-2 ring-emerald-500 border-emerald-500 shadow-md' : ''}
 `}
 >
 <div className="flex justify-between items-start mb-2">
 <span className="text-[10px] font-mono text-slate-400 bg-slate-50 px-1.5 py-0.5 rounded border border-slate-100">
 {task.key}
 </span>
 <TypeSelector task={task} />
 </div>

 <h4 className="font-bold text-slate-800 text-sm md:text-base mb-3 leading-snug group-hover:text-emerald-600:text-emerald-400 transition-colors">
 {task.title || <span className="text-slate-400 italic">無題</span>}
 </h4>

 <div className="flex items-center justify-between mt-3 pt-3 border-t border-slate-50">
 <div className="flex items-center gap-2">
 {task.assignees && task.assignees.length > 0 ? (
 <div className="w-6 h-6 rounded-full bg-indigo-50 text-indigo-600 flex items-center justify-center text-[10px] font-bold border border-indigo-100">
 {task.assignees[0].charAt(0)}
 </div>
 ) : (
 <div className="w-6 h-6 rounded-full bg-slate-100 text-slate-400 flex items-center justify-center text-[10px] border border-slate-200">
 <User size={12} />
 </div>
 )}
 <span className="text-xs text-slate-500 truncate max-w-[80px]">
 {task.assignees && task.assignees.length > 0 ? task.assignees[0] : '未割当'}
 </span>
 </div>
 <PrioritySelector task={task} />
 </div>
 </div>
 )}
 </div>
 ))}

 {/* Empty drop zone */}
 <div
 className={`py-8 text-center flex flex-col items-center justify-center h-full border-2 border-dashed rounded-xl m-1 transition-colors
 ${currentProjectTasks.filter(t => t.sectionId === section.id).length === 0 && !creatingTaskId ? 'opacity-50' : 'opacity-0 h-4 py-0'}
 ${dragOverSectionId === section.id ? 'opacity-100 border-emerald-300 bg-emerald-50/50' : 'border-slate-200'}
 `}
 >
 <div className="text-xs text-slate-400">{currentProjectTasks.filter(t => t.sectionId === section.id).length === 0 && "タスクをドロップ"}</div>
 </div>
 </div>
 </div>
 ))}
 </div>
 </div>
 );
};

export default BoardView;
