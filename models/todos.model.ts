import { PriorityLevels } from "../enums/priority.model"

export interface TaskList {
    id: number;
    taskName: string;
    priority: PriorityLevels;
    taskDescription: string;
}