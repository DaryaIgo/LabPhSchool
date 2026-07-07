import {
  Home,
  Beaker,
  FileText,
  NotebookPen,
} from "lucide-react";

export type StudentTabDef = {
  id: string;
  label: string;
  icon: React.ComponentType<{ size?: number; className?: string }>;
  badgeType: "lab" | "problem" | "jupyter_notebook" | null;
};

export const STUDENT_TABS: StudentTabDef[] = [
  { id: "main", label: "Главная", icon: Home, badgeType: null },
  { id: "tasks", label: "Мои Задачи", icon: FileText, badgeType: "problem" },
  { id: "labs", label: "Мои Лабораторные", icon: Beaker, badgeType: "lab" },
  {
    id: "notebooks",
    label: "Мои Тетради",
    icon: NotebookPen,
    badgeType: "jupyter_notebook",
  },
];
