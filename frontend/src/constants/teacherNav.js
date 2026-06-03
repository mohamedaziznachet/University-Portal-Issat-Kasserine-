import { 
  Home, 
  BookOpen, 
  ClipboardList, 
  FolderPlus, 
  UserX, 
  MessageSquare, 
  HelpCircle 
} from "lucide-react";

export const TEACHER_SPACE_LINKS = [
  { to: "/espace/enseignant", label: "Tableau de bord", icon: Home },
  { to: "/espace/enseignant/classroom", label: "Mes cours", icon: BookOpen },
  { to: "/espace/enseignant/devoirs", label: "Mes devoirs", icon: ClipboardList },
  { to: "/espace/enseignant/soumissions", label: "Soumissions", icon: FolderPlus },
  { to: "/espace/enseignant/absences", label: "Absences", icon: UserX },
  { to: "/espace/enseignant/messages", label: "Messagerie", icon: MessageSquare },
  { to: "/support", label: "Support technique", icon: HelpCircle },
];
