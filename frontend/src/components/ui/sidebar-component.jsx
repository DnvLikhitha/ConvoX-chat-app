import React, { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../../contexts/useAuth";
import { GlassFilter } from "./liquid-glass";
import DashboardView from "../views/DashboardView";
import SettingsView from "../views/SettingsView";
import MediaView from "../views/MediaView";
import GroupsView from "../views/GroupsView";
import { Avatar, AvatarImage, AvatarFallback, AvatarGroup, AvatarGroupCount } from "./avatar";
import { Button } from "./button";
import { Field } from "./field";
import { Input } from "./input";
import {
  Search as SearchIcon,
  Dashboard,
  Task,
  Folder,
  Calendar as CalendarIcon,
  UserMultiple,
  Analytics,
  DocumentAdd,
  Settings as SettingsIcon,
  User as UserIcon,
  ChevronDown as ChevronDownIcon,
  AddLarge,
  Filter,
  Time,
  InProgress,
  CheckmarkOutline,
  Flag,
  Archive,
  View,
  Report,
  StarFilled,
  Group,
  ChartBar,
  FolderOpen,
  Share,
  CloudUpload,
  Security,
  Notification,
  Integration,
  WarningAlt,
  SettingsAdjust as ToggleIcon,
  CircleOutline,
} from "@carbon/icons-react";
/** ======================= Local SVG paths (inline) ======================= */
const svgPaths = {
  p10dcabc0: "M8 11L3 6.00001L3.7 5.30001L8 9.60001L12.3 5.30001L13 6.00001L8 11Z",
  p13593580:
    "M12 9C12.5523 9 13 8.55228 13 8C13 7.44772 12.5523 7 12 7C11.4477 7 11 7.44772 11 8C11 8.55228 11.4477 9 12 9Z",
  p154b5b00:
    "M14.5 13.793L10.724 10.0169C11.6313 8.92758 12.0838 7.53039 11.9872 6.11596C11.8907 4.70154 11.2525 3.37879 10.2055 2.42289C9.15856 1.46699 7.78336 0.951523 6.36601 0.983731C4.94866 1.01594 3.59829 1.59334 2.59581 2.59581C1.59334 3.59829 1.01594 4.94866 0.983731 6.36601C0.951523 7.78336 1.46699 9.15856 2.42289 10.2055C3.37879 11.2525 4.70154 11.8907 6.11596 11.9872C7.53039 12.0838 8.92758 11.6313 10.0169 10.724L13.793 14.5L14.5 13.793ZM2 6.5C2 5.60999 2.26392 4.73996 2.75839 3.99994C3.25286 3.25992 3.95566 2.68314 4.77793 2.34255C5.6002 2.00195 6.505 1.91284 7.37791 2.08647C8.25082 2.2601 9.05265 2.68869 9.68198 3.31802C10.3113 3.94736 10.7399 4.74918 10.9135 5.6221C11.0872 6.49501 10.9981 7.39981 10.6575 8.22208C10.3169 9.04435 9.74009 9.74715 9.00007 10.2416C8.26005 10.7361 7.39002 11 6.5 11C5.30694 10.9987 4.16311 10.5242 3.31949 9.68052C2.47586 8.8369 2.00133 7.69307 2 6.5Z",
  p15853b70:
    "M0.528 0C0.343183 0 0.250774 0 0.180183 0.0359679C0.11809 0.0676061 0.0676061 0.11809 0.0359679 0.180183C0 0.250774 0 0.343183 0 0.528V9.097C0 9.28181 0 9.37422 0.0359678 9.44481C0.0676061 9.50691 0.11809 9.55739 0.180183 9.58903C0.250774 9.625 0.343183 9.625 0.528 9.625L4.972 9.625C5.15682 9.625 5.24923 9.625 5.31982 9.58903C5.38191 9.55739 5.43239 9.50691 5.46403 9.44481C5.5 9.37422 5.5 9.28182 5.5 9.097V6.028C5.5 5.84318 5.5 5.75077 5.53597 5.68018C5.56761 5.61809 5.61809 5.56761 5.68018 5.53597C5.75077 5.5 5.84318 5.5 6.028 5.5L26.972 5.5C27.1568 5.5 27.2492 5.5 27.3198 5.53597C27.3819 5.56761 27.4324 5.61809 27.464 5.68018C27.5 5.75077 27.5 5.84318 27.5 6.028V9.097C27.5 9.28182 27.5 9.37423 27.536 9.44482C27.5676 9.50691 27.6181 9.55739 27.6802 9.58903C27.7508 9.625 27.8432 9.625 28.028 9.625L32.472 9.625C32.6568 9.625 32.7492 9.625 32.8198 9.58903C32.8819 9.55739 32.9324 9.50691 32.964 9.44482C33 9.37423 33 9.28182 33 9.097V0.528C33 0.343183 33 0.250774 32.964 0.180183C32.9324 0.11809 32.8819 0.0676061 32.8198 0.0359679C32.7492 0 32.6568 0 32.472 0H0.528Z",
  p1a3cd600:
    "M8.778 13.75C8.59318 13.75 8.50077 13.75 8.43018 13.714C8.36809 13.6824 8.31761 13.6319 8.28597 13.5698C8.25 13.4992 8.25 13.4068 8.25 13.222V8.778C8.25 8.59318 8.25 8.50077 8.28597 8.43018C8.31761 8.36809 8.36809 8.31761 8.43018 8.28597C8.50077 8.25 8.59318 8.25 8.778 8.25L24.222 8.25C24.4068 8.25 24.4992 8.25 24.5698 8.28597C24.6319 8.31761 24.6824 8.36809 24.714 8.43018C24.75 8.50077 24.75 8.59318 24.75 8.778V13.222C24.75 13.4068 24.75 13.4992 24.714 13.5698C24.6824 13.6319 24.6319 13.6824 24.5698 13.714C24.4992 13.75 24.4068 13.75 24.222 13.75H8.778Z",
  p29bde780: "M4 9C4.55228 9 5 8.55228 5 8C5 7.44772 4.55228 7 4 7C3.44772 7 3 7.44772 3 8C3 8.55228 3.44772 9 4 9Z",
  p2b29ce00:
    "M13 15H12V12.5C12 12.1717 11.9353 11.8466 11.8097 11.5433C11.6841 11.24 11.4999 10.9644 11.2678 10.7322C11.0356 10.5001 10.76 10.3159 10.4567 10.1903C10.1534 10.0647 9.8283 10 9.5 10H6.5C5.83696 10 5.20107 10.2634 4.73223 10.7322C4.26339 11.2011 4 11.837 4 12.5V15H3V12.5C3 11.5717 3.36875 10.6815 4.02513 10.0251C4.6815 9.36875 5.57174 9 6.5 9H9.5C10.4283 9 11.3185 9.36875 11.9749 10.0251C12.6313 10.6815 13 11.5717 13 12.5V15Z",
  p35081d00:
    "M0.528 22C0.343183 22 0.250774 22 0.180183 21.964C0.11809 21.9324 0.0676061 21.8819 0.0359679 21.8198C0 21.7492 0 21.6568 0 21.472V12.903C0 12.7182 0 12.6258 0.0359679 12.5552C0.0676061 12.4931 0.11809 12.4426 0.180183 12.411C0.250774 12.375 0.343183 12.375 0.528 12.375H4.972C5.15682 12.375 5.24923 12.375 5.31982 12.411C5.38191 12.4426 5.43239 12.4931 5.46403 12.5552C5.5 12.6258 5.5 12.7182 5.5 12.903V15.972C5.5 16.1568 5.5 16.2492 5.53597 16.3198C5.56761 16.3819 5.61809 16.4324 5.68018 16.464C5.75077 16.5 5.84318 16.5 6.028 16.5L26.972 16.5C27.1568 16.5 27.2492 16.5 27.3198 16.464C27.3819 16.4324 27.4324 16.3819 27.464 16.3198C27.5 16.2492 27.5 16.1568 27.5 15.972V12.903C27.5 12.7182 27.5 12.6258 27.536 12.5552C27.5676 12.4931 27.6181 12.4426 27.6802 12.411C27.7508 12.375 27.8432 12.375 28.028 12.375H32.472C32.6568 12.375 32.7492 12.375 32.8198 12.411C32.8819 12.4426 32.9324 12.4931 32.964 12.5552C33 12.6258 33 12.7182 33 12.903V21.472C33 21.6568 33 21.7492 32.964 21.8198C32.9324 21.8819 32.8819 21.9324 32.8198 21.964C32.7492 22 32.6568 22 32.472 22H0.528Z",
  p355df480:
    "M0.32 16C0.20799 16 0.151984 16 0.109202 15.9782C0.0715695 15.959 0.0409734 15.9284 0.0217987 15.8908C0 15.848 0 15.792 0 15.68V9.32C0 9.20799 0 9.15198 0.0217987 9.1092C0.0409734 9.07157 0.0715695 9.04097 0.109202 9.0218C0.151984 9 0.207989 9 0.32 9H3.68C3.79201 9 3.84802 9 3.8908 9.0218C3.92843 9.04097 3.95903 9.07157 3.9782 9.1092C4 9.15198 4 9.20799 4 9.32V11.68C4 11.792 4 11.848 4.0218 11.8908C4.04097 11.9284 4.07157 11.959 4.1092 11.9782C4.15198 12 4.20799 12 4.32 12L19.68 12C19.792 12 19.848 12 19.8908 11.9782C19.9284 11.959 19.959 11.9284 19.9782 11.8908C20 11.848 20 11.792 20 11.68V9.32C20 9.20799 20 9.15199 20.0218 9.1092C20.041 9.07157 20.0716 9.04098 20.1092 9.0218C20.152 9 20.208 9 20.32 9H23.68C23.792 9 23.848 9 23.8908 9.0218C23.9284 9.04098 23.959 9.07157 23.9782 9.1092C24 9.15199 24 9.20799 24 9.32V15.68C24 15.792 24 15.848 23.9782 15.8908C23.959 15.9284 23.9284 15.959 23.8908 15.9782C23.848 16 23.792 16 23.68 16H0.32Z",
  p36880f80:
    "M0.32 0C0.20799 0 0.151984 0 0.109202 0.0217987C0.0715695 0.0409734 0.0409734 0.0715695 0.0217987 0.109202C0 0.151984 0 0.20799 0 0.32V6.68C0 6.79201 0 6.84801 0.0217987 6.8908C0.0409734 6.92843 0.0715695 6.95902 0.109202 6.9782C0.151984 7 0.207989 7 0.32 7L3.68 7C3.79201 7 3.84802 7 3.8908 6.9782C3.92843 6.95903 3.95903 6.92843 3.9782 6.8908C4 6.84801 4 6.79201 4 6.68V4.32C4 4.20799 4 4.15198 4.0218 4.1092C4.04097 4.07157 4.07157 4.04097 4.1092 4.0218C4.15198 4 4.20799 4 4.32 4L19.68 4C19.792 4 19.848 4 19.8908 4.0218C19.9284 4.04097 19.959 4.07157 19.9782 4.1092C20 4.15198 20 4.20799 20 4.32V6.68C20 6.79201 20 6.84802 20.0218 6.8908C20.041 6.92843 20.0716 6.95903 20.1092 6.9782C20.152 7 20.208 7 20.32 7L23.68 7C23.792 7 23.848 7 23.8908 6.9782C23.9284 6.95903 23.959 6.92843 23.9782 6.8908C24 6.84802 24 6.79201 24 6.68V0.32C24 0.20799 24 0.151984 23.9782 0.109202C23.959 0.0715695 23.9284 0.0409734 23.8908 0.0217987C23.848 0 23.792 0 23.68 0H0.32Z",
  p3801bf80:
    "M8 2C8.49445 2 8.9778 2.14662 9.38893 2.42133C9.80005 2.69603 10.1205 3.08648 10.3097 3.54329C10.4989 4.00011 10.5484 4.50277 10.452 4.98773C10.3555 5.47268 10.1174 5.91814 9.76777 6.26777C9.41814 6.6174 8.97268 6.8555 8.48773 6.95196C8.00277 7.04843 7.50011 6.99892 7.04329 6.8097C6.58648 6.62048 6.19603 6.30005 5.92133 5.88893C5.64662 5.4778 5.5 4.99445 5.5 4.5C5.5 3.83696 5.76339 3.20107 6.23223 2.73223C6.70107 2.26339 7.33696 2 8 2ZM8 1C7.30777 1 6.63108 1.20527 6.0555 1.58986C5.47993 1.97444 5.03133 2.52107 4.76642 3.16061C4.50152 3.80015 4.4322 4.50388 4.56725 5.18282C4.7023 5.86175 5.03564 6.48539 5.52513 6.97487C6.01461 7.46436 6.63825 7.7977 7.31718 7.93275C7.99612 8.0678 8.69985 7.99849 9.33939 7.73358C9.97893 7.46867 10.5256 7.02007 10.9101 6.4445C11.2947 5.86892 11.5 5.19223 11.5 4.5C11.5 3.57174 11.1313 2.6815 10.4749 2.02513C9.8185 1.36875 8.92826 1 8 1Z",
  p3af0dbf2: "M8 9C8.55228 9 9 8.55228 9 8C9 7.44772 8.55228 7 8 7C7.44772 7 7 7.44772 7 8C7 8.55228 7.44772 9 8 9Z",
  p5113400:
    "M14.252 4.06808L8.25195 0.568081C8.17548 0.523469 8.08853 0.499962 8 0.499962C7.91147 0.499962 7.82452 0.523469 7.74805 0.568081L1.74805 4.06808C1.67257 4.11212 1.60994 4.17517 1.56642 4.25095C1.5229 4.32673 1.5 4.41259 1.5 4.49998V11.5C1.5 11.5874 1.5229 11.6732 1.56642 11.749C1.60994 11.8248 1.67257 11.8878 1.74805 11.9319L7.74805 15.4319C7.82452 15.4765 7.91147 15.5 8 15.5C8.08853 15.5 8.17548 15.4765 8.25195 15.4319L14.252 11.9319C14.3274 11.8878 14.3901 11.8248 14.4336 11.749C14.4771 11.6732 14.5 11.5874 14.5 11.5V4.49998C14.5 4.41259 14.4771 4.32673 14.4336 4.25095C14.3901 4.17517 14.3274 4.11212 14.252 4.06808ZM8 1.57883L13.0078 4.49998L8 7.42113L2.9922 4.49998L8 1.57883ZM2.5 5.37058L7.5 8.28708V14.1294L2.5 11.2129В5.37058ZM8.5 14.1294V8.28708L13.5 5.37058V11.2129L8.5 14.1294Z",
  pfa0d600:
    "M6.32 10C6.20799 10 6.15198 10 6.1092 9.9782C6.07157 9.95903 6.04097 9.92843 6.0218 9.8908C6 9.84802 6 9.79201 6 9.68В6.32C6 6.20799 6 6.15198 6.0218 6.1092C6.04097 6.07157 6.07157 6.04097 6.1092 6.0218C6.15198 6 6.20799 6 6.32 6L17.68 6C17.792 6 17.848 6 17.8908 6.0218C17.9284 6.04097 17.959 6.07157 17.9782 6.1092C18 6.15198 18 6.20799 18 6.32V9.68C18 9.79201 18 9.84802 17.9782 9.8908C17.959 9.92843 17.9284 9.95903 17.8908 9.9782C17.848 10 17.792 10 17.68 10H6.32Z",
};
const softSpringEasing = "cubic-bezier(0.25, 1.1, 0.4, 1)";
/* ----------------------------- Brand / Logos ----------------------------- */
function InterfacesLogoSquare() {
  return (
    <div className="aspect-[24/24] grow min-h-px min-w-px overflow-clip relative shrink-0">
      <div className="absolute aspect-[24/16] left-0 right-0 top-1/2 -translate-y-1/2">
        <svg className="block size-full" fill="none" viewBox="0 0 24 16">
          <g>
            <path d={svgPaths.p36880f80} fill="#FAFAFA" />
            <path d={svgPaths.p355df480} fill="#FAFAFA" />
            <path d={svgPaths.pfa0d600} fill="#FAFAFA" />
          </g>
        </svg>
      </div>
    </div>
  );
}
function BrandBadge() {
  return (
    <div className="relative shrink-0 w-full">
      <div className="flex items-center p-1 w-full">
        <div className="h-10 w-8 flex items-center justify-center pl-2">
          <InterfacesLogoSquare />
        </div>
        <div className="px-2 py-1">
          <div className="font-['Lexend:SemiBold',_sans-serif] text-[16px] text-neutral-50">
            ConvoX
          </div>
        </div>
      </div>
    </div>
  );
}
/* --------------------------------- Avatar -------------------------------- */
function AvatarCircle() {
  return (
    <div className="relative rounded-full shrink-0 size-8 bg-black">
      <div className="flex items-center justify-center size-8">
        <UserIcon size={16} className="text-neutral-50" />
      </div>
      <div
        aria-hidden="true"
        className="absolute inset-0 rounded-full border border-neutral-800 pointer-events-none"
      />
    </div>
  );
}
/* ------------------------------ Users List ----------------------------- */
function UsersList({ searchQuery, activeSection, isCollapsed, selectedUser, onSelectUser }) {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { user } = useAuth();
  React.useEffect(() => {
    const fetchUsers = async () => {
      try {
        setLoading(true);
        const token = localStorage.getItem("chat_token");
        
        if (!token) {
          setError("Not authenticated. Please login first.");
          setUsers([]);
          setLoading(false);
          return;
        }
        const response = await fetch("http://localhost:5000/api/users", {
          method: "GET",
          headers: {
            "Authorization": `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        });
        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.message || `HTTP ${response.status}`);
        }
        
        const data = await response.json();
        setUsers(data.data || []);
        setError(null);
      } catch (err) {
        console.error("Error fetching users:", err);
        setError(err.message);
        setUsers([]);
      } finally {
        setLoading(false);
      }
    };
    if (activeSection === "chats") {
      fetchUsers();
    }
  }, [activeSection]);
  const filteredUsers = users.filter(user =>
    user.username?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    user.email?.toLowerCase().includes(searchQuery.toLowerCase())
  );
  const getStatusColor = (status) => {
    switch(status) {
      case "online": return "bg-green-500";
      case "offline": return "bg-neutral-500";
      case "away": return "bg-yellow-500";
      default: return "bg-neutral-500";
    }
  };
  if (activeSection !== "chats") return null;
  // Collapsed view with avatar group
  if (isCollapsed) {
    return (
      <div className="w-full flex flex-col items-center gap-2">
        <AvatarGroup className="justify-center">
          {filteredUsers.slice(0, 2).map((user) => (
            <Avatar key={user._id || user.id} size="sm">
              <AvatarImage src={user.avatar} alt={user.username} />
              <AvatarFallback className="text-xs">
                {user.username?.charAt(0).toUpperCase() || "U"}
              </AvatarFallback>
            </Avatar>
          ))}
          {filteredUsers.length > 2 && (
            <AvatarGroupCount className="text-xs">
              +{filteredUsers.length - 2}
            </AvatarGroupCount>
          )}
        </AvatarGroup>
        <div className="font-['Lexend:Regular',_sans-serif] text-[11px] text-neutral-400 text-center">
          {filteredUsers.length} {filteredUsers.length === 1 ? "user" : "users"}
        </div>
      </div>
    );
  }
  // Expanded view with list
  return (
    <div className="flex flex-col gap-2 w-full">
      <div className="px-4 py-2">
        <div className="font-['Lexend:Regular',_sans-serif] text-[14px] text-neutral-400">
          {loading ? "Loading..." : `${filteredUsers.length} ${filteredUsers.length === 1 ? "user" : "users"}`}
        </div>
      </div>
      {error && (
        <div className="px-4 py-2">
          <div className="font-['Lexend:Regular',_sans-serif] text-[12px] text-red-400">
            Error: {error}
          </div>
        </div>
      )}
      {!loading && filteredUsers.length === 0 && !error && (
        <div className="px-4 py-2">
          <div className="font-['Lexend:Regular',_sans-serif] text-[12px] text-neutral-500">
            No users found
          </div>
        </div>
      )}
      {!loading && filteredUsers.map((u) => (
        <div
          key={u._id || u.id}
          onClick={() => onSelectUser(u)}
          className="mx-2 p-3 rounded-lg bg-neutral-800/50 hover:bg-neutral-800 cursor-pointer transition flex items-center gap-3"
        >
          <div className="relative">
            <div className="w-8 h-8 rounded-full bg-neutral-700 flex items-center justify-center text-sm text-neutral-400">
              {u.username?.charAt(0).toUpperCase() || "U"}
            </div>
            <div className={`absolute bottom-0 right-0 w-2.5 h-2.5 ${getStatusColor(u.status || "offline")} rounded-full border border-black`}></div>
          </div>
          <div className="flex-1 min-w-0">
            <div className="font-['Lexend:SemiBold',_sans-serif] text-[13px] text-neutral-50 truncate">
              {u.username || "Unknown"}
            </div>
            <div className="font-['Lexend:Regular',_sans-serif] text-[11px] text-neutral-400 truncate">
              {u.status || "offline"}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
/* ------------------------------ Search Input ----------------------------- */
function SearchContainer({ isCollapsed = false, onSearchChange }) {
  const [searchValue, setSearchValue] = useState("");
  const handleChange = (e) => {
    setSearchValue(e.target.value);
    onSearchChange?.(e.target.value);
  };
  return (
    <div
      className={`relative shrink-0 transition-all duration-500 ${
        isCollapsed ? "w-full flex justify-center" : "w-full"
      }`}
      style={{ transitionTimingFunction: softSpringEasing }}
    >
      <div
        className={`bg-black h-10 relative rounded-lg flex items-center transition-all duration-500 ${
          isCollapsed ? "w-10 min-w-10 justify-center" : "w-full"
        }`}
        style={{ transitionTimingFunction: softSpringEasing }}
      >
        <div
          className={`flex items-center justify-center shrink-0 transition-all duration-500 ${
            isCollapsed ? "p-1" : "px-1"
          }`}
          style={{ transitionTimingFunction: softSpringEasing }}
        >
          <div className="size-8 flex items-center justify-center">
            <SearchIcon size={16} className="text-neutral-50" />
          </div>
        </div>
        <div
          className={`flex-1 relative transition-opacity duration-500 overflow-hidden ${
            isCollapsed ? "opacity-0 w-0" : "opacity-100"
          }`}
          style={{ transitionTimingFunction: softSpringEasing }}
        >
          <div className="flex flex-col justify-center size-full">
            <div className="flex flex-col gap-2 items-start justify-center pr-2 py-1 w-full">
              <input
                type="text"
                placeholder="Search users..."
                value={searchValue}
                onChange={handleChange}
                className="w-full bg-transparent border-none outline-none font-['Lexend:Regular',_sans-serif] text-[14px] text-neutral-50 placeholder:text-neutral-400 leading-[20px]"
                tabIndex={isCollapsed ? -1 : 0}
              />
            </div>
          </div>
        </div>
        <div
          aria-hidden="true"
          className="absolute inset-0 rounded-lg border border-neutral-800 pointer-events-none"
        />
      </div>
    </div>
  );
}
/* ------------------------------ Menu Types ------------------------------- */
function getSidebarContent(activeSection, isAdmin = false) {
  const contentMap = {
    dashboard: {
      title: "Dashboard",
      sections: [
        {
          title: "Dashboard Types",
          items: [
            { icon: <View size={16} className="text-neutral-50" />, label: "Overview", isActive: true },
            {
              icon: <Dashboard size={16} className="text-neutral-50" />,
              label: "Executive Summary",
              hasDropdown: true,
              children: [
                { label: "Revenue Overview" },
                { label: "Key Performance Indicators" },
              ],
            },
          ],
        },
      ],
    },
    chats: {
      title: "Chats",
      sections: [
        {
          title: "Messages",
          items: [
            { icon: <AddLarge size={16} className="text-neutral-50" />, label: "Start new chat" },
          ],
        },
      ],
      showUsersList: true,
    },
    groups: {
      title: "Groups",
      sections: [
        {
          title: "Quick Actions",
          items: [
            { icon: <AddLarge size={16} className="text-neutral-50" />, label: "New Group", settingsPage: "create" },
            { icon: <Filter size={16} className="text-neutral-50" />, label: "Filter groups", settingsPage: "filter" },
          ],
        },
      ],
    },
    media: {
      title: "Media & Files",
      sections: [
        {
          title: "Filter by type",
          items: [
            { icon: <FolderOpen size={16} className="text-neutral-50" />, label: "All", settingsPage: "all" },
            { icon: <View size={16} className="text-neutral-50" />, label: "Images", settingsPage: "Images" },
            { icon: <Report size={16} className="text-neutral-50" />, label: "Documents", settingsPage: "Documents" },
            { icon: <ChartBar size={16} className="text-neutral-50" />, label: "Videos", settingsPage: "Videos" },
          ],
        },
      ],
    },
    settings: {
      title: "Settings",
      sections: [
        {
          title: "Account",
          items: [
            { icon: <UserIcon size={16} className="text-neutral-50" />, label: "Profile settings", settingsPage: "profile" },
            { icon: <Security size={16} className="text-neutral-50" />, label: "Security", settingsPage: "security" },
          ],
        },
        {
          title: "App",
          items: [
            { icon: <ToggleIcon size={16} className="text-neutral-50" />, label: "Preferences", settingsPage: "preferences" },
          ],
        },
        ...(isAdmin ? [{
          title: "Moderation",
          items: [
            { icon: <WarningAlt size={16} className="text-neutral-50" />, label: "Flagged Messages", settingsPage: "admin" },
          ],
        }] : []),
      ],
    },
  };
  return contentMap[activeSection] || contentMap.tasks;
}
/* ----------------------- Left Icon Nav Rail ----------------------- */
function IconNavButton({ children, isActive = false, onClick }) {
  return (
    <button
      type="button"
      className={`flex items-center justify-center rounded-lg size-10 min-w-10 transition-colors duration-500
        ${isActive ? "bg-neutral-800 text-neutral-50" : "hover:bg-neutral-800 text-neutral-400 hover:text-neutral-300"}`}
      style={{ transitionTimingFunction: softSpringEasing }}
      onClick={onClick}
    >
      {children}
    </button>
  );
}
function IconNavigation({ activeSection, onSectionChange }) {
  const navItems = [
    { id: "dashboard", icon: <Dashboard size={16} />, label: "Dashboard" },
    { id: "chats", icon: <Task size={16} />, label: "Chats" },
    { id: "groups", icon: <Folder size={16} />, label: "Groups" },
    { id: "media", icon: <Analytics size={16} />, label: "Media & Files" },
    { id: "settings", icon: <SettingsIcon size={16} />, label: "Settings" },
  ];
  return (
    <aside className="bg-black flex flex-col gap-2 items-center p-4 w-16 border-r border-neutral-800">
      <div className="mb-2 size-10 flex items-center justify-center">
        <div className="size-7">
          <InterfacesLogoSquare />
        </div>
      </div>
      <div className="flex flex-col gap-2 w-full items-center">
        {navItems.map((item) => (
          <IconNavButton
            key={item.id}
            isActive={activeSection === item.id}
            onClick={() => onSectionChange(item.id)}
          >
            {item.icon}
          </IconNavButton>
        ))}
      </div>
      <div className="flex-1" />
      <div className="flex flex-col gap-2 w-full items-center">
        <AvatarCircle />
      </div>
    </aside>
  );
}
/* ------------------------------ Right Sidebar ----------------------------- */
function SectionTitle({ title, onToggleCollapse, isCollapsed }) {
  if (isCollapsed) {
    return (
      <div className="w-full flex justify-center transition-all duration-500" style={{ transitionTimingFunction: softSpringEasing }}>
        <button
          type="button"
          onClick={onToggleCollapse}
          className="flex items-center justify-center rounded-lg size-10 min-w-10 transition-all duration-500 hover:bg-neutral-800 text-neutral-400 hover:text-neutral-300"
          style={{ transitionTimingFunction: softSpringEasing }}
          aria-label="Expand sidebar"
        >
          <span className="inline-block rotate-180">
            <ChevronDownIcon size={16} />
          </span>
        </button>
      </div>
    );
  }
  return (
    <div className="w-full overflow-hidden transition-all duration-500" style={{ transitionTimingFunction: softSpringEasing }}>
      <div className="flex items-center justify-between">
        <div className="flex items-center h-10">
          <div className="px-2 py-1">
            <div className="font-['Lexend:SemiBold',_sans-serif] text-[18px] text-neutral-50 leading-[27px]">
              {title}
            </div>
          </div>
        </div>
        <div className="pr-1">
          <button
            type="button"
            onClick={onToggleCollapse}
            className="flex items-center justify-center rounded-lg size-10 min-w-10 transition-all duration-500 hover:bg-neutral-800 text-neutral-400 hover:text-neutral-300"
            style={{ transitionTimingFunction: softSpringEasing }}
            aria-label="Collapse sidebar"
          >
            <ChevronDownIcon size={16} className="-rotate-90" />
          </button>
        </div>
      </div>
    </div>
  );
}
function DetailSidebar({ activeSection, isCollapsed, onCollapseChange, onSettingsPageSelect, selectedUser, onSelectUser }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [expandedItems, setExpandedItems] = useState(new Set());
  const [searchQuery, setSearchQuery] = useState("");
  const isAdmin = user?.role === "admin" || user?.isAdmin === true;
  const handleLogout = () => {
    logout();
    navigate("/login");
  };
  const content = getSidebarContent(activeSection, isAdmin);
  const toggleExpanded = (itemKey) => {
    setExpandedItems((prev) => {
      const next = new Set(prev);
      if (next.has(itemKey)) next.delete(itemKey);
      else next.add(itemKey);
      return next;
    });
  };
  const toggleCollapse = () => onCollapseChange(!isCollapsed);
  return (
    <aside
      className={`flex flex-col gap-4 items-start p-4 transition-all duration-500 border-r border-white/[0.06] ${
        isCollapsed ? "w-16 min-w-16 !px-0 justify-center" : "w-80"
      }`}
      style={{
        transitionTimingFunction: softSpringEasing,
        background: "rgba(10, 10, 10, 0.55)",
        backdropFilter: "blur(18px) saturate(180%)",
        WebkitBackdropFilter: "blur(18px) saturate(180%)",
        boxShadow: "inset 1px 1px 0px rgba(255,255,255,0.08), inset -1px -1px 0px rgba(255,255,255,0.03)",
      }}
    >
      {!isCollapsed && <BrandBadge />}
      <SectionTitle title={content.title} onToggleCollapse={toggleCollapse} isCollapsed={isCollapsed} />
      <SearchContainer isCollapsed={isCollapsed} onSearchChange={setSearchQuery} />
      <div
        className={`flex flex-col w-full overflow-hidden transition-all duration-500 ${
          isCollapsed ? "gap-2 items-center" : "gap-4 items-start"
        }`}
        style={{ transitionTimingFunction: softSpringEasing }}
      >
        {activeSection === "chats" ? (
          <UsersList searchQuery={searchQuery} activeSection={activeSection} isCollapsed={isCollapsed} selectedUser={selectedUser} onSelectUser={onSelectUser} />
        ) : (
          <>
            {content.sections.map((section, index) => (
              <MenuSection
                key={`${activeSection}-${index}`}
                section={section}
                expandedItems={expandedItems}
                onToggleExpanded={toggleExpanded}
                isCollapsed={isCollapsed}
                onSettingsPageSelect={onSettingsPageSelect}
              />
            ))}
          </>
        )}
      </div>
      {!isCollapsed && (
        <div className="w-full mt-auto pt-2 border-t border-neutral-800">
          <div className="flex items-center gap-2 px-2 py-2">
            <AvatarCircle />
            <div className="flex flex-col flex-1 min-w-0">
              <div className="font-['Lexend:SemiBold',_sans-serif] text-[14px] text-neutral-50 truncate">{user?.username || "User"}</div>
              <div className="font-['Lexend:Regular',_sans-serif] text-[12px] text-neutral-400 truncate">{user?.email || "user@example.com"}</div>
            </div>
            <button
              onClick={handleLogout}
              className="flex-shrink-0 px-3 py-2 rounded-lg text-red-400 hover:text-red-300 hover:bg-red-500/10 transition-colors duration-300 text-xs font-medium"
              title="Logout"
            >
              Logout
            </button>
          </div>
        </div>
      )}
    </aside>
  );
}
/* ------------------------------ Menu Elements ----------------------------- */
function MenuItem({ item, isExpanded, onToggle, onItemClick, isCollapsed }) {
  const handleClick = () => {
    if (item.settingsPage) {
      onItemClick?.(item.settingsPage);
    } else if (item.hasDropdown && onToggle) {
      onToggle();
    } else {
      onItemClick?.();
    }
  };
  return (
    <div
      className={`relative shrink-0 transition-all duration-500 ${
        isCollapsed ? "w-full flex justify-center" : "w-full"
      }`}
      style={{ transitionTimingFunction: softSpringEasing }}
    >
      <div
        className={`rounded-lg cursor-pointer transition-all duration-500 flex items-center relative ${
          item.isActive ? "bg-neutral-800" : "hover:bg-neutral-800"
        } ${isCollapsed ? "w-10 min-w-10 h-10 justify-center p-4" : "w-full h-10 px-4 py-2"}`}
        style={{ transitionTimingFunction: softSpringEasing }}
        onClick={handleClick}
        title={isCollapsed ? item.label : undefined}
      >
        <div className="flex items-center justify-center shrink-0">{item.icon}</div>
        <div
          className={`flex-1 relative transition-opacity duration-500 overflow-hidden ${
            isCollapsed ? "opacity-0 w-0" : "opacity-100 ml-3"
          }`}
          style={{ transitionTimingFunction: softSpringEasing }}
        >
          <div className="font-['Lexend:Regular',_sans-serif] text-[14px] text-neutral-50 leading-[20px] truncate">
            {item.label}
          </div>
        </div>
        {item.hasDropdown && (
          <div
            className={`flex items-center justify-center shrink-0 transition-opacity duration-500 ${
              isCollapsed ? "opacity-0 w-0" : "opacity-100 ml-2"
            }`}
            style={{ transitionTimingFunction: softSpringEasing }}
          >
            <ChevronDownIcon
              size={16}
              className="text-neutral-50 transition-transform duration-500"
              style={{
                transitionTimingFunction: softSpringEasing,
                transform: isExpanded ? "rotate(180deg)" : "rotate(0deg)",
              }}
            />
          </div>
        )}
      </div>
    </div>
  );
}
function SubMenuItem({ item, onItemClick }) {
  return (
    <div className="w-full pl-9 pr-1 py-[1px]">
      <div
        className="h-10 w-full rounded-lg cursor-pointer transition-colors hover:bg-neutral-800 flex items-center px-3 py-1"
        onClick={onItemClick}
      >
        <div className="flex-1 min-w-0">
          <div className="font-['Lexend:Regular',_sans-serif] text-[14px] text-neutral-300 leading-[18px] truncate">
            {item.label}
          </div>
        </div>
      </div>
    </div>
  );
}
function MenuSection({ section, expandedItems, onToggleExpanded, isCollapsed, onSettingsPageSelect }) {
  return (
    <div className="flex flex-col w-full">
      <div
        className={`relative shrink-0 w-full transition-all duration-500 overflow-hidden ${
          isCollapsed ? "h-0 opacity-0" : "h-10 opacity-100"
        }`}
        style={{ transitionTimingFunction: softSpringEasing }}
      >
        <div className="flex items-center h-10 px-4">
          <div className="font-['Lexend:Regular',_sans-serif] text-[14px] text-neutral-400">
            {section.title}
          </div>
        </div>
      </div>
      {section.items.map((item, index) => {
        const itemKey = `${section.title}-${index}`;
        const isExpanded = expandedItems.has(itemKey);
        return (
          <div key={itemKey} className="w-full flex flex-col">
            <MenuItem
              item={item}
              isExpanded={isExpanded}
              onToggle={() => onToggleExpanded(itemKey)}
              onItemClick={(settingsPage) => {
                if (settingsPage) {
                  onSettingsPageSelect?.(settingsPage);
                } else {
                  console.log(`Clicked ${item.label}`);
                }
              }}
              isCollapsed={isCollapsed}
            />
            {isExpanded && item.children && !isCollapsed && (
              <div className="flex flex-col gap-1 mb-2">
                {item.children.map((child, childIndex) => (
                  <SubMenuItem
                    key={`${itemKey}-${childIndex}`}
                    item={child}
                    onItemClick={() => console.log(`Clicked ${child.label}`)}
                  />
                ))}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
/* --------------------------------- Settings Pages -------------------------------- */
function ProfileSettingsPage() {
  const { user } = useAuth();
  const [profile, setProfile] = useState({
    avatar: "👤",
    username: user?.username || "",
    email: user?.email || "",
    status: "Available",
  });
  const handleChange = (field, value) => {
    setProfile((prev) => ({ ...prev, [field]: value }));
  };
  return (
    <div className="flex flex-col gap-6 max-w-xl">
      <h2 className="font-['Lexend:SemiBold',_sans-serif] text-[40px] text-neutral-50">Profile Settings</h2>
      
      <div className="flex items-center gap-4">
        <div className="text-6xl">{profile.avatar}</div>
        <button className="px-4 py-2 bg-neutral-700 hover:bg-neutral-600 text-neutral-50 rounded-lg text-sm transition">
          Upload Picture
        </button>
      </div>
      <div className="space-y-4">
        <div>
          <label className="block text-neutral-400 text-sm mb-2">Username</label>
          <input
            type="text"
            value={profile.username}
            onChange={(e) => handleChange("username", e.target.value)}
            className="w-full bg-neutral-800 border border-neutral-700 rounded-lg px-4 py-2 text-neutral-50 focus:outline-none focus:border-violet-500"
          />
        </div>
        
        <div>
          <label className="block text-neutral-400 text-sm mb-2">Email (Read-only)</label>
          <input
            type="email"
            value={profile.email}
            disabled
            className="w-full bg-neutral-900 border border-neutral-700 rounded-lg px-4 py-2 text-neutral-400 cursor-not-allowed"
          />
        </div>
        <div>
          <label className="block text-neutral-400 text-sm mb-2">Status</label>
          <select
            value={profile.status}
            onChange={(e) => handleChange("status", e.target.value)}
            className="w-full bg-neutral-800 border border-neutral-700 rounded-lg px-4 py-2 text-neutral-50 focus:outline-none focus:border-violet-500"
          >
            <option>Available</option>
            <option>Busy</option>
            <option>Away</option>
            <option>Do Not Disturb</option>
          </select>
        </div>
      </div>
      <button className="mt-4 px-6 py-3 bg-violet-600 hover:bg-violet-700 text-white rounded-lg font-medium transition">
        💾 Save Changes
      </button>
    </div>
  );
}
function SecuritySettingsPage() {
  const [passwords, setPasswords] = useState({
    current: "",
    new: "",
    confirm: "",
  });
  const handleChange = (field, value) => {
    setPasswords((prev) => ({ ...prev, [field]: value }));
  };
  return (
    <div className="flex flex-col gap-6 max-w-xl">
      <h2 className="font-['Lexend:SemiBold',_sans-serif] text-[40px] text-neutral-50">Security Settings</h2>
      
      <div className="space-y-4">
        <div>
          <label className="block text-neutral-400 text-sm mb-2">🔑 Current Password</label>
          <input
            type="password"
            value={passwords.current}
            onChange={(e) => handleChange("current", e.target.value)}
            placeholder="Enter current password"
            className="w-full bg-neutral-800 border border-neutral-700 rounded-lg px-4 py-2 text-neutral-50 focus:outline-none focus:border-red-500 placeholder:text-neutral-600"
          />
        </div>
        <div>
          <label className="block text-neutral-400 text-sm mb-2">🔓 New Password</label>
          <input
            type="password"
            value={passwords.new}
            onChange={(e) => handleChange("new", e.target.value)}
            placeholder="Enter new password"
            className="w-full bg-neutral-800 border border-neutral-700 rounded-lg px-4 py-2 text-neutral-50 focus:outline-none focus:border-red-500 placeholder:text-neutral-600"
          />
        </div>
        <div>
          <label className="block text-neutral-400 text-sm mb-2">✅ Confirm Password</label>
          <input
            type="password"
            value={passwords.confirm}
            onChange={(e) => handleChange("confirm", e.target.value)}
            placeholder="Confirm new password"
            className="w-full bg-neutral-800 border border-neutral-700 rounded-lg px-4 py-2 text-neutral-50 focus:outline-none focus:border-red-500 placeholder:text-neutral-600"
          />
        </div>
      </div>
      <button className="mt-4 px-6 py-3 bg-red-600 hover:bg-red-700 text-white rounded-lg font-medium transition">
        🔐 Update Password
      </button>
    </div>
  );
}
function PreferencesSettingsPage() {
  const [preferences, setPreferences] = useState({
    darkMode: true,
    notifications: true,
    readReceipts: true,
  });
  const togglePreference = (key) => {
    setPreferences((prev) => ({ ...prev, [key]: !prev[key] }));
  };
  return (
    <div className="flex flex-col gap-6 max-w-xl">
      <h2 className="font-['Lexend:SemiBold',_sans-serif] text-[40px] text-neutral-50">Preferences</h2>
      <div className="space-y-4">
        <div className="flex items-center justify-between p-4 bg-neutral-800/50 rounded-lg">
          <span className="font-['Lexend:Regular',_sans-serif] text-neutral-200">🌙 Dark Mode</span>
          <button
            onClick={() => togglePreference("darkMode")}
            className={`w-12 h-6 rounded-full transition ${
              preferences.darkMode ? "bg-violet-600" : "bg-neutral-600"
            }`}
          >
            <div
              className={`w-5 h-5 rounded-full bg-white transition transform ${
                preferences.darkMode ? "translate-x-6" : "translate-x-0.5"
              }`}
            />
          </button>
        </div>
        <div className="flex items-center justify-between p-4 bg-neutral-800/50 rounded-lg">
          <span className="font-['Lexend:Regular',_sans-serif] text-neutral-200">🔔 Notifications</span>
          <button
            onClick={() => togglePreference("notifications")}
            className={`w-12 h-6 rounded-full transition ${
              preferences.notifications ? "bg-violet-600" : "bg-neutral-600"
            }`}
          >
            <div
              className={`w-5 h-5 rounded-full bg-white transition transform ${
                preferences.notifications ? "translate-x-6" : "translate-x-0.5"
              }`}
            />
          </button>
        </div>
        <div className="flex items-center justify-between p-4 bg-neutral-800/50 rounded-lg">
          <span className="font-['Lexend:Regular',_sans-serif] text-neutral-200">✅ Read Receipts</span>
          <button
            onClick={() => togglePreference("readReceipts")}
            className={`w-12 h-6 rounded-full transition ${
              preferences.readReceipts ? "bg-violet-600" : "bg-neutral-600"
            }`}
          >
            <div
              className={`w-5 h-5 rounded-full bg-white transition transform ${
                preferences.readReceipts ? "translate-x-6" : "translate-x-0.5"
              }`}
            />
          </button>
        </div>
      </div>
      <button className="mt-4 px-6 py-3 bg-violet-600 hover:bg-violet-700 text-white rounded-lg font-medium transition">
        💾 Save Preferences
      </button>
    </div>
  );
}
function AdminPanelPage() {
  const [flaggedMessages, setFlaggedMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [actionLoading, setActionLoading] = useState({});
  // Fetch flagged messages from backend
  React.useEffect(() => {
    const fetchFlaggedMessages = async () => {
      try {
        setLoading(true);
        const response = await fetch("http://localhost:5000/api/admin/flagged-messages", {
          headers: {
            "Authorization": `Bearer ${localStorage.getItem("chat_token")}`,
          },
        });
        
        if (!response.ok) throw new Error("Failed to fetch flagged messages");
        const data = await response.json();
        setFlaggedMessages(data.data || []);
      } catch (err) {
        setError(err.message);
        // Fallback to empty state if API fails
        setFlaggedMessages([]);
      } finally {
        setLoading(false);
      }
    };
    fetchFlaggedMessages();
  }, []);
  const handleApproove = async (messageId) => {
    try {
      setActionLoading(prev => ({ ...prev, [messageId]: true }));
      const response = await fetch(`http://localhost:5000/api/admin/messages/${messageId}/approve`, {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${localStorage.getItem("chat_token")}`,
          "Content-Type": "application/json",
        },
      });
      if (!response.ok) throw new Error("Failed to approve message");
      setFlaggedMessages(prev => prev.filter(msg => msg.id !== messageId));
    } catch (err) {
      console.error("Error approving message:", err);
    } finally {
      setActionLoading(prev => ({ ...prev, [messageId]: false }));
    }
  };
  const handleRemove = async (messageId) => {
    try {
      setActionLoading(prev => ({ ...prev, [messageId]: true }));
      const response = await fetch(`http://localhost:5000/api/admin/messages/${messageId}/remove`, {
        method: "DELETE",
        headers: {
          "Authorization": `Bearer ${localStorage.getItem("chat_token")}`,
          "Content-Type": "application/json",
        },
      });
      if (!response.ok) throw new Error("Failed to remove message");
      setFlaggedMessages(prev => prev.filter(msg => msg.id !== messageId));
    } catch (err) {
      console.error("Error removing message:", err);
    } finally {
      setActionLoading(prev => ({ ...prev, [messageId]: false }));
    }
  };
  const handleWarnUser = async (messageId, userId) => {
    try {
      setActionLoading(prev => ({ ...prev, [messageId]: true }));
      const response = await fetch(`http://localhost:5000/api/admin/users/${userId}/warn`, {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${localStorage.getItem("chat_token")}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          reason: "Inappropriate message",
          messageId,
        }),
      });
      if (!response.ok) throw new Error("Failed to warn user");
      setFlaggedMessages(prev => prev.filter(msg => msg.id !== messageId));
    } catch (err) {
      console.error("Error warning user:", err);
    } finally {
      setActionLoading(prev => ({ ...prev, [messageId]: false }));
    }
  };
  return (
    <div className="flex flex-col gap-6 max-w-3xl">
      <h2 className="font-['Lexend:SemiBold',_sans-serif] text-[40px] text-neutral-50">🛡️ Flagged Messages</h2>
      <p className="text-neutral-400">Manage flagged messages and moderation</p>
      {loading && <p className="text-neutral-400">Loading flagged messages...</p>}
      {error && <p className="text-red-400">Error: {error}</p>}
      {!loading && flaggedMessages.length === 0 && (
        <p className="text-neutral-400">No flagged messages at this time.</p>
      )}
      <div className="space-y-3 max-h-96 overflow-y-auto">
        {flaggedMessages.map((msg) => (
          <div key={msg._id || msg.id} className="p-4 bg-neutral-800/50 rounded-lg border border-neutral-700 hover:border-red-500 transition">
            <div className="flex items-start justify-between mb-2">
              <div className="flex-1">
                <p className="text-neutral-300 text-sm mb-2">"{msg.content}"</p>
                <div className="grid grid-cols-2 gap-2 text-xs text-neutral-400">
                  <div>👤 From: <span className="text-neutral-300">{msg.sender?.username || "Unknown"}</span></div>
                  <div>🚩 Flagged by: <span className="text-neutral-300">{msg.flaggedBy?.username || "Unknown"}</span></div>
                  <div>⚠️ Reason: <span className="text-red-400">{msg.reason || "No reason"}</span></div>
                  <div>⏰ {msg.timestamp ? new Date(msg.timestamp).toLocaleDateString() : "Unknown"}</div>
                </div>
              </div>
            </div>
            <div className="flex gap-2 mt-3">
              <button 
                onClick={() => handleApproove(msg._id || msg.id)}
                disabled={actionLoading[msg._id || msg.id]}
                className="px-3 py-1 bg-green-600/20 text-green-400 rounded text-xs hover:bg-green-600/40 transition disabled:opacity-50"
              >
                {actionLoading[msg._id || msg.id] ? "..." : "Approve"}
              </button>
              <button 
                onClick={() => handleRemove(msg._id || msg.id)}
                disabled={actionLoading[msg._id || msg.id]}
                className="px-3 py-1 bg-red-600/20 text-red-400 rounded text-xs hover:bg-red-600/40 transition disabled:opacity-50"
              >
                {actionLoading[msg._id || msg.id] ? "..." : "Remove"}
              </button>
              <button 
                onClick={() => handleWarnUser(msg._id || msg.id, msg.sender?._id || msg.sender?.id)}
                disabled={actionLoading[msg._id || msg.id]}
                className="px-3 py-1 bg-yellow-600/20 text-yellow-400 rounded text-xs hover:bg-yellow-600/40 transition disabled:opacity-50"
              >
                {actionLoading[msg._id || msg.id] ? "..." : "Warn User"}
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
function ChatSection({ selectedUser }) {
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const [loading, setLoading] = useState(true);
  const [fullscreenImage, setFullscreenImage] = useState(null);
  const fileInputRef = React.useRef(null);
  React.useEffect(() => {
    if (!selectedUser) {
      setMessages([]);
      setLoading(false);
      return;
    }
    // Load messages from backend
    const loadMessages = async () => {
      try {
        setLoading(true);
        const token = localStorage.getItem("chat_token");
        const userId = selectedUser._id || selectedUser.id;
        const response = await fetch(`http://localhost:5000/api/chats/user/${userId}/messages`, {
          headers: {
            "Authorization": `Bearer ${token}`,
          },
        });
        
        if (response.ok) {
          const data = await response.json();
          setMessages(data.data || []);
        }
      } catch (err) {
        console.error("Error loading messages:", err);
      } finally {
        setLoading(false);
      }
    };
    loadMessages();
  }, [selectedUser]);
  const handleSendMessage = async () => {
    if (!selectedUser || !newMessage.trim()) return;
    try {
      const token = localStorage.getItem("chat_token");
      const userId = selectedUser._id || selectedUser.id;
      const response = await fetch(`http://localhost:5000/api/chats/user/${userId}/messages`, {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          content: newMessage,
        }),
      });
      if (response.ok) {
        const data = await response.json();
        setMessages([...messages, data.data]);
        setNewMessage("");
      } else {
        const error = await response.json();
        console.error("Error response:", error);
        console.error("Error details:", error.details || error.message);
      }
    } catch (err) {
      console.error("Error sending message:", err);
    }
  };
  const handleFileSelect = async (event) => {
    const file = event.target.files?.[0];
    if (!file || !selectedUser) return;
    try {
      const token = localStorage.getItem("chat_token");
      const userId = selectedUser._id || selectedUser.id;
      const formData = new FormData();
      formData.append('file', file);
      const response = await fetch(`http://localhost:5000/api/chats/user/${userId}/upload`, {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${token}`,
        },
        body: formData,
      });
      if (response.ok) {
        const data = await response.json();
        setMessages([...messages, data.data]);
      } else {
        console.error("Error uploading file");
      }
    } catch (err) {
      console.error("Error uploading file:", err);
    }
    // Reset file input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };
  if (!selectedUser) {
    return (
      <div className="flex flex-col h-full items-center justify-center gap-4">
        <p className="text-neutral-400 text-lg">Select a user to start chatting</p>
        <p className="text-neutral-500 text-sm">Click on a user from the list on the left</p>
      </div>
    );
  }
  return (
    <div className="flex flex-col h-full gap-4">
      <div className="flex items-center gap-3 pb-4 border-b border-neutral-800">
        <div className="w-10 h-10 rounded-full bg-neutral-700 flex items-center justify-center text-sm text-neutral-400">
          {selectedUser.username?.charAt(0).toUpperCase() || "U"}
        </div>
        <div className="flex-1">
          <div className="font-['Lexend:SemiBold',_sans-serif] text-[14px] text-neutral-50">{selectedUser.username || "Unknown"}</div>
          <div className="font-['Lexend:Regular',_sans-serif] text-[12px] text-neutral-400">{selectedUser.status || "offline"}</div>
        </div>
      </div>
      <div className="flex-1 overflow-y-auto space-y-3">
        {loading ? (
          <p className="text-neutral-400 text-sm">Loading messages...</p>
        ) : messages.length === 0 ? (
          <p className="text-neutral-400 text-sm">No messages yet. Start the conversation!</p>
        ) : (
          messages.map((msg) => {
            const isImage = msg.messageType === 'file' && msg.fileUrl && (msg.fileUrl.match(/\.(jpg|jpeg|png|gif|webp)$/i));
            
            if (isImage) {
              return (
                <div key={msg._id || msg.id} className={`flex ${msg.isCurrentUser ? "justify-end" : "justify-start"}`}>
                  <div onClick={() => setFullscreenImage(`http://localhost:5000${msg.fileUrl}`)} className="cursor-pointer hover:opacity-90 transition">
                    <img src={`http://localhost:5000${msg.fileUrl}`} alt={msg.fileName} className="max-w-xs rounded-lg" />
                  </div>
                </div>
              );
            }
            
            return (
              <div key={msg._id || msg.id} className={`flex ${msg.isCurrentUser ? "justify-end" : "justify-start"}`}>
                <div className={`max-w-xs px-4 py-2 rounded-lg ${
                  msg.isCurrentUser 
                    ? "text-white" 
                    : "bg-neutral-800 text-neutral-300"
                }`}
                style={msg.isCurrentUser ? { backgroundColor: "#a684ff" } : {}}
                >
                  {msg.messageType === 'file' ? (
                    <a 
                      href={`http://localhost:5000${msg.fileUrl}`} 
                      download={msg.fileName}
                      className="flex items-center gap-2 hover:underline text-blue-300"
                    >
                      <span>📎</span>
                      <span className="text-sm truncate">{msg.fileName || 'Download file'}</span>
                    </a>
                  ) : (
                    <p className="text-sm">{msg.content}</p>
                  )}
                  <p className="text-xs opacity-70 mt-1">{msg.timestamp ? new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
                </div>
              </div>
            );
          })
        )}
      </div>
      <Field orientation="horizontal" className="pt-4 border-t border-neutral-800 gap-2 items-center">
        <input
          type="file"
          ref={fileInputRef}
          onChange={handleFileSelect}
          className="hidden"
          accept="*/*"
        />
        <button
          onClick={() => fileInputRef.current?.click()}
          className="px-3 py-3 bg-neutral-700 hover:bg-neutral-600 text-white rounded-lg font-medium transition flex items-center justify-center flex-shrink-0 hover:scale-110 duration-200"
          title="Attach file"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
        </button>
        <Input
          type="text"
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          onKeyPress={(e) => e.key === "Enter" && handleSendMessage()}
          placeholder="Type a message..."
          className="h-10"
        />
        <Button
          onClick={handleSendMessage}
          style={{ backgroundColor: "#a684ff" }}
        >
          Send
        </Button>
      </Field>
      {fullscreenImage && (
        <div 
          className="fixed inset-0 bg-black/90 flex items-center justify-center z-50 p-4"
          onClick={() => setFullscreenImage(null)}
        >
          <div className="relative max-w-4xl max-h-[90vh] flex items-center justify-center">
            <img 
              src={fullscreenImage} 
              alt="Fullscreen" 
              className="max-w-full max-h-[90vh] rounded-lg object-contain"
              onClick={(e) => e.stopPropagation()}
            />
            <button
              onClick={() => setFullscreenImage(null)}
              className="absolute top-4 right-4 bg-neutral-700 hover:bg-neutral-600 text-white p-2 rounded-lg transition"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
function SettingsPageRenderer({ page }) {
  switch (page) {
    case "profile":
      return <ProfileSettingsPage />;
    case "security":
      return <SecuritySettingsPage />;
    case "preferences":
      return <PreferencesSettingsPage />;
    case "admin":
      return <AdminPanelPage />;
    default:
      return <div className="text-neutral-400">Page not found</div>;
  }
}
/* --------------------------------- Floating Box -------------------------------- */
function FloatingBox({ activeSection, sidebarCollapsed, selectedSettingsPage, selectedUser }) {
  const sectionNames = {
    dashboard: { title: "Dashboard", description: "View your overview and executive summaries", icon: "📊" },
    chats: { title: "Chats", description: "Connect and chat with your team members", icon: "💬" },
    projects: { title: "Projects", description: "Organize and manage your projects", icon: "📁" },
    calendar: { title: "Calendar", description: "Schedule and plan your events", icon: "📅" },
    teams: { title: "Teams", description: "Collaborate with your team members", icon: "👥" },
    analytics: { title: "Analytics", description: "View detailed reports and insights", icon: "📈" },
    settings: { title: "Settings", description: "Manage your account and preferences", icon: "⚙️" },
    admin: { title: "Admin Panel", description: "Monitor flagged messages and moderation", icon: "🛡️" },
  };
  const current = sectionNames[activeSection] || sectionNames.dashboard;
  const leftPosition = sidebarCollapsed ? "left-44" : "left-108";
  return (
    <div
      className={`fixed right-6 top-4 bottom-4 z-10 ${leftPosition} rounded-3xl border border-white/[0.07] px-16 py-6 transition-all duration-500 flex flex-col justify-start overflow-y-auto w-auto`}
      style={{
        transitionTimingFunction: softSpringEasing,
        background: "rgba(8, 8, 12, 0.65)",
        backdropFilter: "blur(24px) saturate(200%)",
        WebkitBackdropFilter: "blur(24px) saturate(200%)",
        boxShadow: "0 12px 48px rgba(0,0,0,0.5), 0 0 0 1px rgba(255,255,255,0.07), inset 1px 1.5px 0px rgba(255,255,255,0.1), inset -1px -1px 0px rgba(255,255,255,0.04)",
      }}
    >
      {activeSection === "chats" ? (
        <ChatSection selectedUser={selectedUser} />
      ) : activeSection === "dashboard" ? (
        <DashboardView />
      ) : activeSection === "groups" ? (
        <GroupsView selectedPage={selectedSettingsPage} />
      ) : activeSection === "media" ? (
        <MediaView selectedFilter={selectedSettingsPage || "all"} />
      ) : activeSection === "settings" ? (
        <SettingsView selectedPage={selectedSettingsPage || "profile"} />
      ) : (
        <div className="flex flex-col gap-8 max-w-2xl">
          <div className="text-7xl">{current.icon}</div>
          <div>
            <h3 className="font-['Lexend:SemiBold',_sans-serif] text-[56px] text-neutral-50 leading-[64px] mb-4">
              {current.title}
            </h3>
          </div>
          <p className="font-['Lexend:Regular',_sans-serif] text-[18px] text-neutral-300 leading-[28px] max-w-lg">
            {current.description}
          </p>
          <div className="mt-8 pt-8 border-t border-neutral-700/50">
            <div className="flex items-center gap-3">
              <div className="w-3 h-3 bg-gradient-to-r from-neutral-50 to-neutral-400 rounded-full animate-pulse"></div>
              <p className="text-sm text-neutral-400">Active section • Click sidebar to explore</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
function TwoLevelSidebar() {
  const navigate = useNavigate();
  const location = useLocation();
  const activeSection = location.pathname.split("/")[1] || "dashboard";
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [selectedSettingsPage, setSelectedSettingsPage] = useState(null);
  const [selectedUser, setSelectedUser] = useState(null);
  const handleSectionChange = (section) => {
    navigate(`/${section}`);
    setSelectedSettingsPage(null);
  };
  return (
    <div
      className="h-screen w-screen flex items-center justify-start pl-6 pt-4 pb-4 relative"
      style={{
        background: "url(/photo-1432251407527-504a6b4174a2.avif) center",
        animation: "60s linear 0s infinite normal running moveBackground"
      }}
    >
      <GlassFilter />
      <div className="relative z-20 flex flex-row h-full rounded-2xl overflow-hidden border border-white/[0.07]">
        <IconNavigation activeSection={activeSection} onSectionChange={handleSectionChange} />
        <DetailSidebar 
          activeSection={activeSection} 
          isCollapsed={sidebarCollapsed} 
          onCollapseChange={setSidebarCollapsed}
          onSettingsPageSelect={setSelectedSettingsPage}
          selectedUser={selectedUser}
          onSelectUser={setSelectedUser}
        />
      </div>
      <FloatingBox activeSection={activeSection} sidebarCollapsed={sidebarCollapsed} selectedSettingsPage={selectedSettingsPage} selectedUser={selectedUser} />
    </div>
  );
}
export function SidebarComponent() {
  return <TwoLevelSidebar />;
}
export default SidebarComponent;