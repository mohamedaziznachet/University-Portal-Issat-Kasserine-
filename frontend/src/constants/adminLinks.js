import { 
  Users, 
  UserCheck, 
  ShieldCheck, 
  Image, 
  FileText, 
  Key, 
  MessageSquare,
  Activity
} from "lucide-react";

export const ADMIN_LINKS = [
  { to: "/espace/admin", label: "Tableau de bord", icon: Activity },
  { to: "/espace/admin/utilisateurs", label: "Utilisateurs", icon: Users },
  { to: "/espace/admin/inscriptions", label: "Inscriptions", icon: UserCheck },
  { to: "/espace/admin/demandes-reset", label: "Demandes Reset", icon: Key },
  { to: "/espace/admin/messages", label: "Messages", icon: MessageSquare },
  { to: "/espace/admin/emplois", label: "Emplois du temps", icon: Image },
  { to: "/espace/admin/actualites", label: "Actualités & Annonces", icon: ShieldCheck },
  { to: "/espace/admin/plans-etude", label: "Plans d'étude", icon: FileText },
];
