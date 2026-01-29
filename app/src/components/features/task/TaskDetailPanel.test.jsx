import React from 'react';
import { render, screen } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import TaskDetailPanel from './TaskDetailPanel';
import { AppProvider } from '../../../context/AppContext';
import { vi } from 'vitest';

test('renders TaskDetailPanel without crashing when task is selected', () => {
    // Setup URL with task param
    const url = new URL(window.location);
    url.searchParams.set('task', '1');
    window.history.pushState({}, '', url);

    render(
        <AppProvider>
            <BrowserRouter>
                <TaskDetailPanel />
            </BrowserRouter>
        </AppProvider>
    );

    // It should find the task title from the mock data in AppContext (PHX-1 login screen...)
    expect(screen.getByText('ログイン画面のデザイン作成')).toBeInTheDocument();
});
