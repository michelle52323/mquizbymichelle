import { useEffect, useState } from 'react';
import { useNavigate, useLocation, useOutletContext } from 'react-router-dom';
import Icon from '../UserControls/Icons/icons';


import CheckAuth from '../../components/Account/CheckAuth';
import Loader from '../UserControls/Loader/Loader';
import './dashboard.css';

// ---- Types ----
interface AuthResult {
    auth: boolean;
    claims: Record<string, any>;
}

interface OutletContextType {
    setTitle: (title: string) => void;
    setBanner: (banner: string) => void;
}

function Dashboard() {
    const navigate = useNavigate();
    const location = useLocation();
    const { setTitle, setBanner } = useOutletContext<OutletContextType>();

    const [auth, setAuth] = useState<AuthResult | null>(null);
    const [hasStarterKit, setHasStarterKit] = useState<boolean>(false);
    const [starterKitCreated, setStarterKitCreated] = useState<string | null>(null);
    const [displayNavigationDashboard, setDisplayNavigationDashboard] = useState<boolean>(false);
    const [userRole, setUserRole] = useState<string | null>(null);

    const [showOverview, setShowOverview] = useState<boolean>(false);

    // Load auth
    useEffect(() => {
        async function hydrateAuth() {
            const result = await CheckAuth();
            setAuth(result);
        }
        hydrateAuth();
    }, []);

    // Redirect + hydrate claims
    useEffect(() => {
        if (auth === null) return;

        if (!auth.auth) {
            navigate("/signin");
        } else {
            setTitle("Welcome, " + auth.claims.FirstName);
            setHasStarterKit(auth.claims.HasStarterKit);
            setStarterKitCreated(auth.claims.StarterKitCreated);
        }

        const role = auth.claims?.['http://schemas.microsoft.com/ws/2008/06/identity/claims/role'];
        setUserRole(role);
    }, [auth, navigate, setTitle]);

    // Cleanup banner on unmount
    useEffect(() => {
        return () => {
            setBanner('');
        };
    }, [setBanner]);

    // Handle banner passed via navigation state
    useEffect(() => {
        if (location.state && (location.state as any).banner) {
            const banner = (location.state as any).banner;
            setBanner(banner);

            navigate(location.pathname, {
                replace: true,
                state: {},
            });
        }
    }, [location.state, location.pathname, navigate, setBanner]);

    useEffect(() => {
        if (auth === null) return;

        const has = auth.claims.HasStarterKit;
        const created = auth.claims.StarterKitCreated;

        if (!has || !created) {
            setDisplayNavigationDashboard(true);
            return;
        }

        const createdDate = new Date(created);
        const now = new Date();
        const diffDays = (now.getTime() - createdDate.getTime()) / (1000 * 60 * 60 * 24);

        setDisplayNavigationDashboard(diffDays > 7);
    }, [auth]);


    if (auth === null) {
        return (
            <div>
                <Loader message="Loading dashboard ..." />
            </div>
        );
    }

    if (!auth.auth) return null;

    return (
        <div className="page-container w-100 pt-3">
            <div className="content-holder-desktop">
                <div className="content-inner-desktop">

                    {/* Starter Kit Welcome Banner */}
                    {hasStarterKit && starterKitCreated && (() => {
                        const created = new Date(starterKitCreated);
                        const now = new Date();
                        const diffDays = (now.getTime() - created.getTime()) / (1000 * 60 * 60 * 24);

                        if (diffDays <= 7) {
                            return (
                                <div className="starterkit-welcome-banner">
                                    <h4>Welcome to Quiz Builder</h4>
                                    <p>Your sample quizzes are ready to explore. This starter kit gives you a quick way to see how quizzes, questions, and answer choices fit together.</p>

                                    <p>To get started, try reviewing the sample quizzes or experimenting with different visual themes to personalize your workspace.</p>

                                    <div className="starter-kit-section">
                                        <div
                                            className="starter-kit-toggle"
                                            onClick={() => setShowOverview(!showOverview)}
                                            style={{ cursor: 'pointer' }}
                                        >
                                            <span className="starter-kit-link">
                                                {showOverview ? (
                                                    <>
                                                        <Icon name="chevronUp" /> Starter Kit Overview
                                                    </>
                                                ) : (
                                                    <>
                                                        <Icon name="chevronDown" /> Starter Kit Overview
                                                    </>
                                                )}
                                            </span>
                                        </div>

                                        {showOverview && (
                                            <div className="starter-kit-body">
                                                <p><strong>Algebra I Fundamentals (8 questions)</strong><br />
                                                    A polished, fully published quiz that demonstrates clean structure and math‑editing capabilities.</p>

                                                <p><strong>U.S. Geography (11 questions)</strong><br />
                                                    A multi‑subject example showing that Quiz Builder supports humanities and real‑world reasoning, not just STEM.</p>

                                                <p><strong>English Grammar (6 questions)</strong><br />
                                                    An unpublished draft that highlights error detection, unpublished questions, and how the platform guides you toward fixing issues.</p>
                                            </div>
                                        )}
                                    </div>

                                    <div
                                        className="dashboard-link"
                                        onClick={() => navigate("/quizbuilder/myquizzes")}
                                        style={{ cursor: "pointer", marginTop: "12px" }}
                                    >
                                        <span>Go to My Quizzes</span>
                                    </div>

                                    <div
                                        className="dashboard-link"
                                        onClick={() => navigate("/account/themes")}
                                        style={{ cursor: "pointer", marginTop: "8px" }}
                                    >
                                        <span>Explore Themes</span>
                                    </div>
                                </div>
                            );
                        }
                        return null;
                    })()}
                    {displayNavigationDashboard && (
                        <div className="dashboard-container row g-3">

                            {/* Instructor-only items */}
                            {userRole === "Instructor" && (
                                <>
                                    <div className="dashboard-item col-12 col-md-4 text-center">
                                        <div
                                            className="dashboard-link-inner"
                                            onClick={() => navigate("/quizbuilder/myquizzes")}
                                            style={{ cursor: "pointer", display: "inline-block" }}
                                        >
                                            <span className="w-100">My Quizzes</span>
                                        </div>
                                    </div>

                                    <div className="dashboard-item col-12 col-md-4 text-center">
                                        <div
                                            className="dashboard-link-inner"
                                            onClick={() => navigate("/quizbuilder/quizinfo")}
                                            style={{ cursor: "pointer", display: "inline-block" }}
                                        >
                                            <span className="w-100">Add New Quiz</span>
                                        </div>
                                    </div>

                                    <div className="dashboard-item col-12 col-md-4 text-center hide-small">
                                        {/* intentionally blank cell */}
                                    </div>
                                </>
                            )}

                            {/* Profile */}
                            <div className="dashboard-item col-12 col-md-4 text-center">
                                <div
                                    className="dashboard-link-inner"
                                    onClick={() => navigate("/Account/Profile")}
                                    style={{ cursor: "pointer", display: "inline-block" }}
                                >
                                    <span className="w-100">Profile</span>
                                </div>
                            </div>

                            {/* Change Password */}
                            <div className="dashboard-item col-12 col-md-4 text-center">
                                <div
                                    className="dashboard-link-inner"
                                    onClick={() => navigate("/Account/ChangePassword")}
                                    style={{ cursor: "pointer", display: "inline-block" }}
                                >
                                    <span className="w-100">Change Password</span>
                                </div>
                            </div>

                            {/* Themes */}
                            <div className="dashboard-item col-12 col-md-4 text-center">
                                <div
                                    className="dashboard-link-inner"
                                    onClick={() => navigate("/Account/Themes")}
                                    style={{ cursor: "pointer", display: "inline-block" }}
                                >
                                    <span className="w-100">Themes</span>
                                </div>
                            </div>

                        </div>
                    )}


                </div>
            </div>
        </div>
    );
}

export default Dashboard;
