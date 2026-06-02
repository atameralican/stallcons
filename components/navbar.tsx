'use client';
import React from 'react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { MenuToggleIcon } from '@/components/ui/menu-toggle-icon';
import { createPortal } from 'react-dom';
import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
} from '@/components/ui/navigation-menu';
import { List, LucideIcon, MailIcon, LayersIcon, UserPlusIcon, Users, Home } from 'lucide-react';
import { Link } from '@/i18n/navigation';
import { ThemeToggle } from '@/components/theme-toggle';
import { LanguageSwitcher } from '@/components/language-switcher';
import { useTranslations } from 'next-intl';

type LinkItem = {
  title: string;
  href: string;
  icon: LucideIcon;
  description?: string;
};

export function Navbar() {
  const [open, setOpen] = React.useState(false);
  const scrolled = useScroll(10);
  const t = useTranslations('Navbar');
  const cl = useTranslations('CompanyLinks');
  const el = useTranslations('ExpertiseLinks');

  const companyLinks: LinkItem[] = [
    { title: cl('aboutUs.title'), href: '/company/about-us', description: cl('aboutUs.description'), icon: Users },
    { title: cl('quality.title'), href: '/company/quality', description: cl('quality.description'), icon: LayersIcon },
    { title: cl('missionVision.title'), href: '/company/mission-vision', description: cl('missionVision.description'), icon: UserPlusIcon },
  ];

  const expertiseAreasLinks: LinkItem[] = [
    { title: el('engineeringDesign.title'), href: '/expertise-areas/engineering-design', description: el('engineeringDesign.description'), icon: Users },
    { title: el('steelConstruction.title'), href: '/expertise-areas/steel-construction', description: el('steelConstruction.description'), icon: LayersIcon },
  ];

  React.useEffect(() => {
    if (open) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => { document.body.style.overflow = ''; };
  }, [open]);

  return (
    <header
      className={cn('sticky top-0 z-50 w-full border-b border-transparent', {
        'bg-background/95 supports-[backdrop-filter]:bg-background/50 border-border backdrop-blur-lg': scrolled,
      })}
    >
      <nav className="flex justify-between h-20 mx-auto items-center px-4 max-w-screen-2xl">
        {/* LOGO */}
        <Link href="/" className="flex-shrink-0 flex flex-col items-center group" onClick={() => setOpen(false)}>
          <div className="flex items-end gap-0.5 leading-none select-none">
            <span className="relative font-black text-2xl tracking-tight text-[#1E50A0] dark:text-blue-400 lowercase">
              stallcons
            </span>
          </div>
          <span className="text-[9px] font-semibold tracking-[0.25em] uppercase text-slate-500 dark:text-slate-300 mt-0.5">
            STEEL CONSTRUCTION
          </span>
        </Link>



        {/* DESKTOP MENU */}
        <NavigationMenu className="hidden lg:flex">
          <NavigationMenuList>
            <NavigationMenuItem>
              <NavigationMenuLink className="px-4" asChild>
                <Link href="/" className="hover:bg-accent rounded-lg p-2">
                  {t('home')}
                </Link>
              </NavigationMenuLink>
            </NavigationMenuItem>
            <NavigationMenuItem>
              <NavigationMenuTrigger className="bg-transparent">{t('corporate')}</NavigationMenuTrigger>
              <NavigationMenuContent className="bg-zinc-100 dark:bg-zinc-900 p-1 pr-1.5">
                <ul className="bg-popover grid w-lg grid-cols-2 gap-2 rounded-lg border p-2 shadow">
                  {companyLinks.map((item, i) => (
                    <li key={i}><ListItem {...item} /></li>
                  ))}
                </ul>
                <div className="p-2">
                  <p className="text-muted-foreground text-sm">
                    {t('contactPrompt')}{' '}
                    <Link href="/contact" className="text-foreground font-medium hover:underline">
                      {t('contactLink')}
                    </Link>
                  </p>
                </div>
              </NavigationMenuContent>
            </NavigationMenuItem>
            <NavigationMenuItem>
              <NavigationMenuTrigger className="bg-transparent">{t('expertiseAreas')}</NavigationMenuTrigger>
              <NavigationMenuContent className="bg-zinc-100 dark:bg-zinc-900 p-1 pr-1.5">
                <ul className="bg-popover grid w-lg grid-cols-2 gap-2 rounded-lg border p-2 shadow">
                  {expertiseAreasLinks.map((item, i) => (
                    <li key={i}><ListItem {...item} /></li>
                  ))}
                </ul>
              </NavigationMenuContent>
            </NavigationMenuItem>
            <NavigationMenuItem>
              <NavigationMenuLink className="px-4" asChild>
                <Link href="/projects" className="hover:bg-accent rounded-lg p-2">
                  {t('projects')}
                </Link>
              </NavigationMenuLink>
            </NavigationMenuItem>
            <NavigationMenuItem>
              <NavigationMenuLink className="px-4" asChild>
                <Link href="/contact" className="hover:bg-accent rounded-lg p-2">
                  {t('contact')}
                </Link>
              </NavigationMenuLink>
            </NavigationMenuItem>
          </NavigationMenuList>
        </NavigationMenu>


        {/* SAĞ TARAF */}
        <div className="flex items-center gap-1">
          <LanguageSwitcher />
          <ThemeToggle />
          <Button
            size="icon"
            variant="outline"
            onClick={() => setOpen(!open)}
            className="lg:hidden"
            aria-expanded={open}
            aria-controls="mobile-menu"
            aria-label="Toggle menu"
          >
            <MenuToggleIcon open={open} className="size-5" duration={300} />
          </Button>
        </div>
      </nav>

      {/* MOBILE MENU */}
      <MobileMenu open={open} className="flex flex-col overflow-y-auto-">
        <NavigationMenu className="max-w-full max-h-full">
          <div className="flex w-full h-full flex-col justify-start gap-y-2-">
            <ListItem key="home" title={t('home')} href="/" description="" icon={Home} onClick={() => setOpen(false)} />

            <span className="text-sm">{t('corporate')}</span>
            {companyLinks.map((link) => (<ListItem key={link.title} {...link} onClick={() => setOpen(false)} />))}
            <span className="text-sm">{t('expertiseAreas')}</span>
            {expertiseAreasLinks.map((link) => (<ListItem key={link.title} {...link} onClick={() => setOpen(false)} />))}
            <span className="text-sm">{t('projects')}</span>
            <ListItem key="projects" title={t('projects')} href="/projects" description="" icon={List} onClick={() => setOpen(false)} />
            <span className="text-sm">{t('contact')}</span>
            <ListItem key="contact" title={t('contact')} href="/contact" description="" icon={MailIcon} onClick={() => setOpen(false)} />
          </div>
        </NavigationMenu>
      </MobileMenu>
    </header>
  );
}

type MobileMenuProps = React.ComponentProps<'div'> & { open: boolean };

function MobileMenu({ open, children, className, ...props }: MobileMenuProps) {
  if (!open || typeof window === 'undefined') return null;
  return createPortal(
    <div
      id="mobile-menu"
      className={cn(
        'bg-background/95 supports-[backdrop-filter]:bg-background/50 backdrop-blur-lg',
        'fixed top-20 right-0 bottom-0 left-0 z-40 flex flex-col overflow-hidden border-y lg:hidden',
      )}
    >
      <div
        data-slot={open ? 'open' : 'closed'}
        className={cn(
          'data-[slot=open]:animate-in data-[slot=open]:zoom-in-97 ease-out',
          'size-full p-4',
          className,
        )}
        {...props}
      >
        {children}
      </div>
    </div>,
    document.body,
  );
}

function ListItem({
  title, description, icon: Icon, className, href, ...props
}: React.ComponentProps<typeof NavigationMenuLink> & LinkItem) {
  return (
    <NavigationMenuLink
      className={cn('w-full flex flex-row gap-x-2 data-[active=true]:focus:bg-accent data-[active=true]:hover:bg-accent data-[active=true]:bg-accent/50 data-[active=true]:text-accent-foreground hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground rounded-sm p-2', className)}
      {...props}
      asChild
    >
      <Link href={href as Parameters<typeof Link>[0]['href']}>
        <div className="bg-background/40 flex aspect-square size-12 items-center justify-center rounded-lg border shadow-sm">
          <Icon className="text-foreground size-5" />
        </div>
        <div className="flex flex-col items-start justify-center">
          <span className="font-medium">{title}</span>
          <span className="text-muted-foreground text-xs">{description}</span>
        </div>
      </Link>
    </NavigationMenuLink>
  );
}

function useScroll(threshold: number) {
  const [scrolled, setScrolled] = React.useState(false);
  const onScroll = React.useCallback(() => {
    setScrolled(window.scrollY > threshold);
  }, [threshold]);
  React.useEffect(() => {
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, [onScroll]);
  React.useEffect(() => { onScroll(); }, [onScroll]);
  return scrolled;
}
