import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { Menu, Bell, CheckCheck } from "lucide-react";
import ThemeToggle from "../common/ThemeToggle";
import { useAuth } from "../../hooks/useAuth";
import { useWorkspace } from "../../hooks/useWorkspace";
import { ROUTES } from "../../utils/constants";

const Topbar = ({ onMenuClick, title }) => {
  const { user } = useAuth();
  const { notifications, markAllNotificationsRead } = useWorkspace();
  const [open, setOpen] = useState(false);
  const popoverRef = useRef(null);
  const unread = notifications.filter((notification) => !notification.read).length;
  const initials = (user?.name || "User")
    .split(" ")
    .map((n) => n[0])
    .join("")
    .slice(0, 2);

  useEffect(() => {
    const close = (event) => {
      if (popoverRef.current && !popoverRef.current.contains(event.target)) setOpen(false);
    };
    document.addEventListener("pointerdown", close);
    return () => document.removeEventListener("pointerdown", close);
  }, []);

  return (
    <header className="sticky top-0 z-30 flex items-center justify-between gap-4 glass border-b border-app px-5 sm:px-8 h-16">
      <div className="flex items-center gap-3">
        <button onClick={onMenuClick} className="lg:hidden text-body" aria-label="Open menu">
          <Menu size={22} />
        </button>
        {title && <h1 className="font-display font-semibold text-lg text-body">{title}</h1>}
      </div>

      <div className="flex items-center gap-3">
        <ThemeToggle />
        <div className="relative" ref={popoverRef}>
          <button onClick={() => setOpen((value) => !value)} className="relative h-9 w-9 rounded-lg glass flex items-center justify-center text-subtle hover:text-body" aria-label={`Notifications${unread ? `, ${unread} unread` : ""}`} aria-expanded={open}>
            <Bell size={17} />
            {unread > 0 && <span className="absolute top-1.5 right-1.5 h-1.5 w-1.5 rounded-full bg-magenta" />}
          </button>
          {open && (
            <div className="absolute right-0 top-12 w-[min(22rem,calc(100vw-2rem))] overflow-hidden rounded-2xl glass shadow-2xl">
              <div className="flex items-center justify-between border-b border-app px-4 py-3">
                <p className="font-display text-sm font-semibold text-body">Notifications</p>
                <button onClick={markAllNotificationsRead} className="inline-flex items-center gap-1 text-[11px] font-medium text-violet-400 hover:text-violet-300"><CheckCheck size={13} /> Mark all read</button>
              </div>
              <div className="max-h-80 overflow-y-auto p-2">
                {notifications.length ? notifications.map((notification) => (
                  <div key={notification.id} className={`relative rounded-xl px-3 py-3 ${notification.read ? "" : "bg-panel-2"}`}>
                    {!notification.read && <span className="absolute right-3 top-4 h-1.5 w-1.5 rounded-full bg-cyan-400" />}
                    <p className="pr-4 text-xs font-semibold text-body">{notification.title}</p>
                    <p className="mt-1 text-[11px] text-subtle">{notification.detail}</p>
                    <p className="mt-1 text-[10px] font-mono text-faint">{notification.time}</p>
                  </div>
                )) : <p className="px-3 py-8 text-center text-xs text-subtle">No notifications yet.</p>}
              </div>
            </div>
          )}
        </div>
        <Link to={ROUTES.PROFILE} className="h-9 w-9 rounded-full bg-gradient-brand flex items-center justify-center text-white text-xs font-semibold" aria-label="Open profile">
          {initials}
        </Link>
      </div>
    </header>
  );
};

export default Topbar;
