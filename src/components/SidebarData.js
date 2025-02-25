import React from 'react'
import HomeIcon from '@mui/icons-material/Home';
import TaskIcon from '@mui/icons-material/Task';
import CalendarMonthIcon from '@mui/icons-material/CalendarMonth';

export const SidebarData = [
    {
        title: 'ホーム',
        icon: <HomeIcon />,
        link: '#/home'
    },
    {
        title: 'タスク',
        icon: <TaskIcon />,
        link: '#/task'
    },
    {
        title: 'カレンダー',
        icon: <CalendarMonthIcon />,
        link: '#/calendar'
    }
]