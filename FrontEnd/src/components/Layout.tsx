import { Outlet } from 'react-router-dom';
import { useState, useEffect, useRef, useLayoutEffect } from 'react';
import { getApiBaseUrl, isMobileTouchDevice } from '../helpers/config';
import { getSmartTitleClass } from '../helpers/displayHelper';
import { getThemeIdFromCookie } from '../helpers/cookieHelper';
import FeedbackBanner from './UserControls/FeedbackBanner/FeedbackBanner';
import CheckAuth from '../components/Account/CheckAuth';
import Icon from '../components/UserControls/Icons/icons';
import Menu from '../components/UserControls/Menu/Menu';
import ButtonGrid from './UserControls/ButtonGrid/ButtonGrid';

//Layout.tsx
//This page is a defines the basic layout for all pages
//Public pages, such as sign in, register, use a "card" on desktop devices
//Public pages, such as sign in, register, do NOT use a "card" on mobile devices
//Pages requiring authentication do NOT use a card on any device

const hexToRgba = (hex: string, alpha = 1): string => {
    const r = parseInt(hex.slice(1, 3), 16);
    const g = parseInt(hex.slice(3, 5), 16);
    const b = parseInt(hex.slice(5, 7), 16);
    return `rgba(${r}, ${g}, ${b}, ${alpha})`;
};

export interface LayoutContext {
    setTitle: (title: string) => void;
    setBanner: (banner: string | null) => void;
}

interface AuthResult {
    auth: boolean;
    username?: string;
    claims?: { FirstName?: string; ThemeId?: string };
}

interface LayoutProps {
    buttonSlot?: React.ReactNode;       //for button grid (optional)
    footerSlots?: React.ReactNode[];    //for navigation footers (optional)
}

function Layout({ buttonSlot, footerSlots }: LayoutProps) {
    const [title, setTitle] = useState<string>('');
    const [banner, setBanner] = useState<string | null>(null);
    const [menuOpen, setMenuOpen] = useState(false);
    const menuRef = useRef<HTMLDivElement>(null);
    const [auth, setAuth] = useState<AuthResult | null>(null);
    const [actualThemeId, setActualThemeId] = useState<number>(1);
    const [themeReady, setThemeReady] = useState(false);

    const headerRef = useRef<HTMLDivElement>(null);
    const [smartClass, setSmartClass] = useState('');



    const publicRoutes = import.meta.env.VITE_PUBLIC_ROUTES?.split(',') ?? [];
    const currentRoute = location.pathname;
    const isPublicRoute = publicRoutes.includes(currentRoute);
    const isMobile = isMobileTouchDevice();
    const useCard = isPublicRoute && !isMobileTouchDevice();

    const cardClassName = useCard ? 'use-card' : 'no-card';
    const borderClassName = useCard ? 'use-border' : 'no-border';
    const pageFadeInClassName = isMobile ? 'page-fade-in-mobile' : 'page-fade-in';

    const innerHeightClass = isPublicRoute ? '' : 'inner-page-height';
    const API_BASE = getApiBaseUrl();

    useEffect(() => {
        const setVH = () => {
            document.documentElement.style.setProperty('--vh', `${window.innerHeight}px`);
            const offset = useCard ? 68 : 30;
            document.documentElement.style.setProperty('--vhInner', `${window.innerHeight - offset}px`);
        };

        setVH();
        window.addEventListener('resize', setVH);
        return () => window.removeEventListener('resize', setVH);
    }, []);

    useEffect(() => {
        async function hydrateAuth() {
            const result = await CheckAuth();
            setAuth(result);
            //console.log('CheckAuth result:', result);
        }
        hydrateAuth();
    }, []);
   
    useEffect(() => {
        if (!auth || !auth.claims?.ThemeId) {
            // Public user (not authenticated)

            // Read the hex value from the root CSS variable
            const rootStyles = getComputedStyle(document.documentElement);
            const borderHex = rootStyles.getPropertyValue('--textBoxBorderColor').trim();

            // Convert hex → rgba
            const borderRgba = hexToRgba(borderHex, 0.75);

            // Write the rgba value back into a CSS variable
            document.documentElement.style.setProperty('--textBoxShadowColorRgba', borderRgba);

            // Determine theme ID for public user
            const resolvedThemeId1 = getThemeIdFromCookie() ?? 1;

            setActualThemeId(resolvedThemeId1);
            loadTheme(resolvedThemeId1);

            return;
        }

        // Authenticated user

        const resolvedThemeId = parseInt(auth.claims.ThemeId ?? "1", 10);
        //const resolvedThemeId = 7;

        setActualThemeId(resolvedThemeId);

        loadTheme(resolvedThemeId);

    }, [auth]);

    async function loadTheme(themeId: number) {
        try {
            const response = await fetch(`${API_BASE}/api/theme/${themeId}/variables`, {
                credentials: 'include',
                headers: { 'Content-Type': 'application/json' },
            });

            if (!response.ok) {
                throw new Error(`Failed to fetch theme data: ${response.status}`);
            }

            const data: { description: string; color: string }[] = await response.json();

            // Apply each CSS variable
            data.forEach(({ description, color }) => {
                document.documentElement.style.setProperty(`--${description}`, color);
            });

            // Compute rgba shadow color
            const borderHex =
                data.find((v) => v.description === 'textBoxBorderColor')?.color ?? '#dfdfdf';

            const borderRgba = hexToRgba(borderHex, 0.75);
            document.documentElement.style.setProperty('--textBoxShadowColorRgba', borderRgba);

            setThemeReady(true);
            //console.log(`Theme ${themeId} applied successfully.`);
        } catch (error) {
            console.error('Error loading theme:', error);
        }
    }



    useEffect(() => {
        if (banner) {
            window.scrollTo({ top: 0, behavior: "smooth" });
        }
    }, [banner]);


    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
                setMenuOpen(false);
            }
        };

        if (menuOpen) {
            document.addEventListener('mousedown', handleClickOutside);
        }

        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [menuOpen]);

    useLayoutEffect(() => {
        if (!headerRef.current) return;

        const width = headerRef.current.offsetWidth;

        if (width === 0) {
            return;
        }

        setSmartClass(getSmartTitleClass(title, width));
    }, [title]);


    const toggleMenu = () => setMenuOpen((prev) => !prev);

    const currentYear = new Date().getFullYear();

    //if (!themeReady && !isPublicRoute) {
    //    return null; // or a spinner, or a blank screen
    //}

    //const headerRef = useRef<HTMLDivElement>(null);

    // const smartClass = getSmartTitleClass(
    //     title,
    //     headerRef.current?.offsetWidth ?? window.innerWidth
    // );





    //alert('width: ' + window.innerWidth + 'l; height: ' + window.innerHeight);

    return (
        <div className={`theme-${actualThemeId} ${pageFadeInClassName}`}>
            <div className={`page-layout page-layout-margin ${useCard ? 'page-background' : 'page-background-inner'}`}>
                {banner ? (
                    <FeedbackBanner message={banner} />
                ) : (
                    useCard && <div className="feedback-banner-placeholder" />
                )}

                <div className={innerHeightClass}>
                    <div className={cardClassName}>
                        <header className={`card-title d-flex ${borderClassName}`}>
                            {!isPublicRoute && (
                                <div className="home-icon-holder">
                                    <a href="#" className="card-text-color icon-margin" id="menuToggle" onClick={toggleMenu}>
                                        <Icon name="menu" />
                                    </a>
                                </div>
                            )}

                            <div
                                ref={headerRef}
                                className={`header-holder truncate-html ${!isPublicRoute ? 'header-padding' : ''} ${smartClass}`}
                            >
                                {title}
                            </div>
                        </header>

                        <main style={{ flex: 1 }}>
                            <Outlet context={{ setTitle, setBanner }} />
                        </main>

                        {/* BUTTON SLOT HERE */}
                        <div className={`${isMobile ? 'button-grid-holder-mobile' : 'button-grid-holder-desktop'}`}>
                            {buttonSlot && <ButtonGrid {...(buttonSlot as any)} />}
                        </div>

                    </div>
                </div>

                {footerSlots && footerSlots.length > 0 && (
                    <div className="form-footer-slot-container">
                        {footerSlots.map((slot, index) => (
                            <div key={index} className="form-footer-slot">
                                {slot}
                            </div>
                        ))}
                    </div>
                )}


                <footer>© {currentYear} Quiz Builder</footer>
                <Menu isOpen={menuOpen} closeMenu={() => setMenuOpen(false)} ref={menuRef} />
            </div>
        </div>

    );
}

export default Layout;