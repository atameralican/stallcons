"use client";
import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import {
  Home,
  User,
  Settings,
  LogOut,
  Menu,
  X,
  ChevronLeft,
  ChevronRight,
  BarChart3,
  FileText,
  HelpCircle,
} from 'lucide-react';

export interface NavigationItem {
  /**
   * TR: Menü öğesinin benzersiz kimliği (ID)
   * EN: Unique identifier for the menu item (ID)
   */
  id: string;
  /**
   * TR: Menüde gösterilecek olan metin / başlık
   * EN: Text / title to be displayed in the menu
   */
  name: string;
  /**
   * TR: Menü öğesinin solunda gösterilecek ikon. Dizi (string) veya React bileşeni olabilir.
   * EN: Icon to display on the left. Can be a string key or a React component.
   */
  icon: string | React.ComponentType<{ className?: string }>;
  /**
   * TR: Tıklandığında yönlendirilecek hedef URL adresi
   * EN: Target URL destination when clicked
   */
  href: string;
  /**
   * TR: İsteğe bağlı olarak menü öğesinin sağ tarafında gösterilecek sayı veya metin rozeti
   * EN: Optional number or text badge to show on the right of the menu item
   */
  badge?: string;
}

export interface SidebarProps {
  /**
   * TR: Sidebar ana div'ine eklenecek ek Tailwind / CSS sınıfları
   * EN: Additional Tailwind / CSS classes to append to the sidebar main div
   */
  className?: string;
  /**
   * TR: Menüde listelenecek olan navigasyon elemanlarının dizisi.
   * EN: Array of navigation items to list in the menu.
   * @default [ { id: "dashboard", name: "Dashboard", icon: "Home", href: "/admin" } ]
   */
  items?: NavigationItem[];
  /**
   * TR: Logo alanında gösterilecek olan tek karakterlik marka harfi/logosu
   * EN: Single character brand logo/letter to display in the header
   * @default "A"
   */
  brandLogoChar?: React.ReactNode;
  /**
   * TR: Logo alanındaki ana marka adı
   * EN: Main brand title in the header area
   * @default "Admin"
   */
  brandTitle?: string;
  /**
   * TR: Logo alanındaki alt başlık
   * EN: Subtitle in the header area
   * @default "Management Panel"
   */
  brandSubtitle?: string;
  /**
   * TR: Alt kısımdaki profil kartında gösterilecek olan kullanıcı adı.
   * EN: User display name shown in the bottom profile card.
   * TR: Boş bırakılırsa Supabase oturumundaki e-postadan veya varsayılan değerden türetilir.
   * EN: If omitted, derived from the active Supabase session email or default value.
   */
  profileName?: string;
  /**
   * TR: Alt kısımdaki profil kartında gösterilecek olan e-posta / alt bilgi.
   * EN: User email / subtitle shown in the bottom profile card.
   * TR: Boş bırakılırsa Supabase oturumundan çekilir veya varsayılan değer kullanılır.
   * EN: If omitted, loaded from the active Supabase session or default value.
   */
  profileSubtitle?: string;
  /**
   * TR: Çıkış yap butonuna basıldığında tetiklenecek olan fonksiyon.
   * EN: Callback function triggered when the logout button is clicked.
   * TR: Boş bırakılırsa varsayılan olarak Supabase oturumunu kapatıp ana sayfaya yönlendirir.
   * EN: If omitted, signs out from Supabase and redirects to home page by default.
   */
  onLogout?: () => void | Promise<void>;
  /**
   * TR: Çıkış yap butonunun gösterilip gösterilmeyeceğini belirler.
   * EN: Controls the visibility of the logout button.
   * @default true
   */
  showLogout?: boolean;
}

const ICON_MAP: Record<string, React.ComponentType<{ className?: string }>> = {
  Home,
  User,
  Settings,
  LogOut,
  Menu,
  X,
  ChevronLeft,
  ChevronRight,
  BarChart3,
  FileText,
  HelpCircle,
};

const DEFAULT_NAV_ITEMS: NavigationItem[] = [
  { id: "dashboard", name: "Dashboard", icon: "Home", href: "/admin" },
];

export function Sidebar({
  className = "",
  items,
  brandLogoChar = "A",
  brandTitle = "Admin",
  brandSubtitle = "Management Panel",
  profileName,
  profileSubtitle,
  onLogout,
  showLogout = true,
}: SidebarProps) {
  const pathname = usePathname();
  const router = useRouter();
  const defaultSupabase = createClient();

  const [isOpen, setIsOpen] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(false);
  
  // TR: Supabase'den çekilen yedek kullanıcı e-postası
  // EN: Backup user email loaded from Supabase
  const [supabaseUserEmail, setSupabaseUserEmail] = useState("");

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 768) {
        setIsOpen(true);
      } else {
        setIsOpen(false);
      }
    };

    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // TR: Dışarıdan profil bilgileri girilmemişse varsayılan olarak Supabase oturumunu kontrol et
  // EN: If no profile info is passed, check the active Supabase session by default
  useEffect(() => {
    if (!profileName || !profileSubtitle) {
      const fetchUser = async () => {
        try {
          const { data: { user } } = await defaultSupabase.auth.getUser();
          if (user?.email) {
            setSupabaseUserEmail(user.email);
          }
        } catch (e) {
          // TR: Supabase bulunamazsa veya hata alırsa sessizce geç (diğer projelerde esneklik sağlamak için)
          // EN: Silent catch if Supabase is missing/errored (provides flexibility in other codebases)
        }
      };
      fetchUser();
    }
  }, [profileName, profileSubtitle, defaultSupabase]);

  const toggleSidebar = () => setIsOpen(!isOpen);
  const toggleCollapse = () => setIsCollapsed(!isCollapsed);

  const handleLogout = async () => {
    if (onLogout) {
      await onLogout();
      return;
    }
    // TR: Varsayılan olarak Supabase oturumunu kapatma ve yönlendirme
    // EN: Default Supabase sign out and redirection
    try {
      await defaultSupabase.auth.signOut({
        scope: "local",
      });
      router.replace("/");
      router.refresh();
    } catch (e) {
      console.warn("Logout failed: default Supabase client was not configured or signout failed.", e);
    }
  };

  // TR: Nihai profil bilgileri (Prop varsa öncelikli, yoksa Supabase, o da yoksa varsayılanlar)
  // EN: Final profile details (Prop has priority, then Supabase, then fallbacks)
  const finalEmail = profileSubtitle ?? (supabaseUserEmail || "admin@example.com");
  const finalName = profileName ?? (supabaseUserEmail ? supabaseUserEmail.split('@')[0] : "Admin User");
  const avatarChar = finalName ? finalName.charAt(0).toUpperCase() : "A";
  
  const navItems = items ?? DEFAULT_NAV_ITEMS;

  return (
    <>
      {/* Mobile hamburger button */}
      <button
        onClick={toggleSidebar}
        className="fixed top-6 left-6 z-50 p-3 rounded-lg bg-sidebar shadow-md border border-sidebar-border md:hidden hover:bg-sidebar-accent transition-all duration-200"
        aria-label="Toggle sidebar"
      >
        {isOpen ?
          <X className="h-5 w-5 text-sidebar-foreground" /> :
          <Menu className="h-5 w-5 text-sidebar-foreground" />
        }
      </button>

      {/* Mobile overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/40 backdrop-blur-sm z-30 md:hidden transition-opacity duration-300"
          onClick={toggleSidebar}
        />
      )}

      {/* Sidebar Container */}
      <div
        className={`
          fixed top-0 left-0 h-screen bg-sidebar border-r border-sidebar-border z-40 transition-all duration-300 ease-in-out flex flex-col
          ${isOpen ? "translate-x-0" : "-translate-x-full"}
          ${isCollapsed ? "w-20" : "w-72"}
          md:translate-x-0 md:sticky md:top-0 md:h-screen md:z-auto
          ${className}
        `}
      >
        {/* Brand Header */}
        <div className="flex items-center justify-between p-5 border-b border-sidebar-border bg-sidebar-accent/40">
          {!isCollapsed && (
            <div className="flex items-center space-x-2.5">
              <div className="w-9 h-9 bg-sidebar-primary rounded-lg flex items-center justify-center shadow-sm">
                <span className="text-sidebar-primary-foreground font-bold text-base">{brandLogoChar}</span>
              </div>
              <div className="flex flex-col">
                <span className="font-semibold text-sidebar-foreground text-base">{brandTitle}</span>
                <span className="text-xs text-muted-foreground">{brandSubtitle}</span>
              </div>
            </div>
          )}

          <button
            onClick={toggleCollapse}
            className={`hidden md:flex p-1.5 rounded-md hover:bg-sidebar-accent transition-all duration-200 ${isCollapsed ? "mx-auto" : ""}`}
            aria-label={isCollapsed ? "Expand sidebar" : "Collapse sidebar"}
          >
            {isCollapsed ? (
              <ChevronRight className="h-4 w-4 text-muted-foreground" />
            ) : (
              <ChevronLeft className="h-4 w-4 text-muted-foreground" />
            )}
          </button>
        </div>

        {/* Navigation Section */}
        <nav className="flex-1 px-3 py-4 overflow-y-auto">
          <ul className="space-y-1">
            {navItems.map((item) => {
              const Icon = typeof item.icon === 'string' ? (ICON_MAP[item.icon] || HelpCircle) : item.icon;
              const isActive = item.href === "/admin" ? pathname === "/admin" : pathname?.startsWith(item.href);

              return (
                <li key={item.id}>
                  <Link
                    href={item.href}
                    onClick={() => {
                      if (window.innerWidth < 768) {
                        setIsOpen(false);
                      }
                    }}
                    className={`
                      w-full flex items-center space-x-2.5 px-3 py-2.5 rounded-md text-left transition-all duration-200 group
                      ${isActive
                        ? "bg-sidebar-accent text-sidebar-accent-foreground"
                        : "text-sidebar-foreground/70 hover:bg-sidebar-accent hover:text-sidebar-foreground"
                      }
                      ${isCollapsed ? "justify-center px-2" : ""}
                    `}
                    title={isCollapsed ? item.name : undefined}
                  >
                    <div className="flex items-center justify-center min-w-[24px]">
                      <Icon
                        className={`
                          h-4.5 w-4.5 flex-shrink-0
                          ${isActive
                            ? "text-sidebar-primary"
                            : "text-muted-foreground group-hover:text-sidebar-foreground"
                          }
                        `}
                      />
                    </div>

                    {!isCollapsed && (
                      <div className="flex items-center justify-between w-full">
                        <span className={`text-sm ${isActive ? "font-medium" : "font-normal"}`}>{item.name}</span>
                        {item.badge && (
                          <span className={`
                            px-1.5 py-0.5 text-xs font-medium rounded-full
                            ${isActive
                              ? "bg-sidebar-primary text-sidebar-primary-foreground"
                              : "bg-sidebar-accent text-sidebar-accent-foreground"
                            }
                          `}>
                            {item.badge}
                          </span>
                        )}
                      </div>
                    )}

                    {isCollapsed && item.badge && (
                      <div className="absolute top-1 right-1 w-4 h-4 flex items-center justify-center rounded-full bg-sidebar-primary border border-sidebar">
                        <span className="text-[10px] font-medium text-sidebar-primary-foreground">
                          {parseInt(item.badge) > 9 ? '9+' : item.badge}
                        </span>
                      </div>
                    )}

                    {isCollapsed && (
                      <div className="absolute left-full ml-2 px-2 py-1 bg-popover text-popover-foreground text-xs rounded border border-border opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 whitespace-nowrap z-50">
                        {item.name}
                        {item.badge && (
                          <span className="ml-1.5 px-1 py-0.5 bg-muted rounded-full text-[10px]">
                            {item.badge}
                          </span>
                        )}
                        <div className="absolute left-0 top-1/2 transform -translate-y-1/2 -translate-x-1 w-1.5 h-1.5 bg-popover rotate-45 border-l border-b border-border" />
                      </div>
                    )}
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>

        {/* Bottom Profile and Action Section */}
        <div className="mt-auto border-t border-sidebar-border">
          {/* Profile Section */}
          <div className={`border-b border-sidebar-border bg-sidebar-accent/20 ${isCollapsed ? 'py-3 px-2' : 'p-3'}`}>
            {!isCollapsed ? (
              <div className="flex items-center px-3 py-2 rounded-md bg-sidebar hover:bg-sidebar-accent transition-colors duration-200">
                <div className="w-8 h-8 bg-muted rounded-full flex items-center justify-center">
                  <span className="text-muted-foreground font-medium text-sm uppercase">{avatarChar}</span>
                </div>
                <div className="flex-1 min-w-0 ml-2.5">
                  <p className="text-sm font-medium text-sidebar-foreground truncate capitalize">{finalName}</p>
                  <p className="text-xs text-muted-foreground truncate">{finalEmail}</p>
                </div>
                <div className="w-2 h-2 bg-green-500 rounded-full ml-2" title="Aktif" />
              </div>
            ) : (
              <div className="flex justify-center">
                <div className="relative">
                  <div className="w-9 h-9 bg-muted rounded-full flex items-center justify-center">
                    <span className="text-muted-foreground font-medium text-sm uppercase">{avatarChar}</span>
                  </div>
                  <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-green-500 rounded-full border-2 border-sidebar" />
                </div>
              </div>
            )}
          </div>

          {/* Logout Button */}
          {showLogout && (
            <div className="p-3">
              <button
                onClick={handleLogout}
                className={`
                  w-full flex items-center rounded-md text-left transition-all duration-200 group
                  text-destructive hover:bg-destructive/10 hover:text-destructive
                  ${isCollapsed ? "justify-center p-2.5" : "space-x-2.5 px-3 py-2.5"}
                `}
                title={isCollapsed ? "Çıkış Yap / Sign Out" : undefined}
              >
                <div className="flex items-center justify-center min-w-[24px]">
                  <LogOut className="h-4.5 w-4.5 flex-shrink-0 text-destructive" />
                </div>

                {!isCollapsed && (
                  <span className="text-sm">Çıkış Yap</span>
                )}

                {isCollapsed && (
                  <div className="absolute left-full ml-2 px-2 py-1 bg-popover text-popover-foreground text-xs rounded border border-border opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 whitespace-nowrap z-50">
                    Çıkış Yap
                    <div className="absolute left-0 top-1/2 transform -translate-y-1/2 -translate-x-1 w-1.5 h-1.5 bg-popover rotate-45 border-l border-b border-border" />
                  </div>
                )}
              </button>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
