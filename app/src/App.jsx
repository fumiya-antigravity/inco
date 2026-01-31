import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AppProvider } from './context/AppContext';
import MainLayout from './components/layout/MainLayout';
import Home from './pages/Home';
import ProjectView from './pages/ProjectView';
import BoardView from './components/features/board/BoardView';
import ListView from './components/features/list/ListView';
import WikiView from './components/features/wiki/WikiView';
import TaskDetailPanel from './components/features/task/TaskDetailPanel';

const App = () => {
 return (
 <AppProvider>
 <BrowserRouter>
 <Routes>
 <Route path="/" element={<MainLayout />}>
 <Route index element={<Home />} />
 <Route path="projects/:projectId" element={<ProjectView />}>
 <Route index element={<Navigate to="board" replace />} />
 <Route path="board" element={<BoardView />} />
 <Route path="list" element={<ListView />} />
 <Route path="wiki" element={<WikiView />} />
 </Route>
 <Route path="projects" element={<Navigate to="/" replace />} />
 </Route>
 </Routes>

 {/* Global Task Detail Panel - Overlays everything if query param exists */}
 <TaskDetailPanel />
 </BrowserRouter>
 </AppProvider>
 );
};

export default App;