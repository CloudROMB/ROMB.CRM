import { Routes } from '@angular/router';

import { TasksComponent } from './tasks.component';

export const TasksRoutes: Routes = [
    {
        path: '',
        children: [ {
            path: '',
            component: TasksComponent
        }]
    }
];
