import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import CheckAuth from '../../../components/Account/CheckAuth';
import SignOut from '../../../components/Account/signOut/signOut';
import './menu.css';

interface MenuProps {
    isOpen: boolean;
    closeMenu: () => void;
}

interface AuthResult {
    auth: boolean;
    username?: string;
    claims?: { FirstName?: string };
}

const Menu = React.forwardRef<HTMLDivElement, MenuProps>(({ isOpen, closeMenu }, ref) => {
    const navigate = useNavigate();

    const [auth, setAuth] = useState<AuthResult | null>(null);

    useEffect(() => {
        async function hydrateAuth() {
            const result = await CheckAuth();
            setAuth(result);
        }
        hydrateAuth();
    }, []);

    if (auth === null) {
        return null;
    }

    const claims = auth?.claims as { [key: string]: string } | undefined;
    const role = claims?.["http://schemas.microsoft.com/ws/2008/06/identity/claims/role"];

    const handleNavigate = (path: string) => {
        closeMenu();
        navigate(path);
    };

    const handleSignOut = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            await SignOut();
            document.location.href = "/signin"; // full reload is correct for sign-out
        } catch (error) {
            console.error('Sign-out failed:', error);
        }
    };

    return (
        <div ref={ref} id="sideMenu" className={`side-menu ${isOpen ? 'menu-open' : 'menu-close'}`}>
            
            <div className="menu-item">
                <button className="menu-button-link" onClick={() => handleNavigate("/dashboard")}>
                    <div className="menu-icon">🏠</div>
                    <div className="menu-text">Dashboard</div>
                </button>
            </div>

            {role === "Instructor" && (
                <div className="menu-item">
                    <button className="menu-button-link" onClick={() => handleNavigate("/quizbuilder/myquizzes")}>
                        <div className="menu-icon">📖</div>
                        <div className="menu-text">My Quizzes</div>
                    </button>
                </div>
            )}

            {role === "Instructor" && (
                <div className="menu-item">
                    <button className="menu-button-link" onClick={() => handleNavigate("/quizbuilder/quizinfo")}>
                        <div className="menu-icon">➕</div>
                        <div className="menu-text">Create Quiz</div>
                    </button>
                </div>
            )}

            {/* <div className="menu-item">
                <button className="menu-button-link" onClick={() => handleNavigate("/recipe/search")}>
                    <div className="menu-icon">🔍</div>
                    <div className="menu-text">Search Recipes</div>
                </button>
            </div> */}

            {/* <div className="menu-item">
                <button className="menu-button-link" onClick={() => handleNavigate("/recipe/favorites")}>
                    <div className="menu-icon">⭐</div>
                    <div className="menu-text">Favorites</div>
                </button>
            </div> */}

            <div className="menu-item">
                <button className="menu-button-link" onClick={() => handleNavigate("/account/profile")}>
                    <div className="menu-icon">👤</div>
                    <div className="menu-text">Profile</div>
                </button>
            </div>

            {/* <div className="menu-item">
                <button className="menu-button-link" onClick={() => handleNavigate("/account/changepassword")}>
                    <div className="menu-icon">🔑</div>
                    <div className="menu-text">Change Password</div>
                </button>
            </div> */}

            <div className="menu-item">
                <button className="menu-button-link" onClick={() => handleNavigate("/account/themes")}>
                    <div className="menu-icon">🎨</div>
                    <div className="menu-text">Themes</div>
                </button>
            </div>

            <div className="menu-item">
                <button className="menu-button-link" onClick={closeMenu}>
                    <div className="menu-icon">✖️</div>
                    <div className="menu-text">Close</div>
                </button>
            </div>

            <div id="menuSignout" className="menu-item menu-signout">
                <form onSubmit={handleSignOut}>
                    <button type="submit" className="menu-button">
                        <span className="menu-icon">🚪</span>
                        <span className="menu-text">Sign Out</span>
                    </button>
                </form>
            </div>

        </div>
    );
});

export default Menu;
