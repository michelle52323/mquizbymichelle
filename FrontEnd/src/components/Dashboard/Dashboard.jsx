import { useOutletContext } from 'react-router-dom';
import { useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useState } from 'react';
import Icon from '../UserControls/Icons/icons';

import CheckAuth from '../../components/Account/CheckAuth';

function Dashboard() {
    const navigate = useNavigate();
    const location = useLocation();
    const { setTitle, setBanner } = useOutletContext();
    const [auth, setAuth] = useState(null);
    const [hasStarterKit, setHasStarterKit] = useState(false);
    const [starterKitCreated, setStarterKitCreated] = useState(null);

    const [showOverview, setShowOverview] = useState(false);

    useEffect(() => {
        async function hydrateAuth() {
            const result = await CheckAuth();
            setAuth(result);
        }
        hydrateAuth();
    }, []);

    useEffect(() => {
        if (auth === null) return;

        if (!auth.auth) {
            navigate("/signin"); // redirect if unauthenticated
        } else {
            setTitle("Welcome, " + auth.claims.FirstName);
            setHasStarterKit(auth.claims.HasStarterKit);
            setStarterKitCreated(auth.claims.StarterKitCreated);
        }
    }, [auth, navigate, setTitle]);

    useEffect(() => {

        return () => {

            setBanner('');

        };
    }, []);

    useEffect(() => {
        if (location.state?.banner) {
            setBanner(location.state.banner);
            navigate(location.pathname, {
                replace: true,
                state: {},
            });
        }
    }, [location.state?.banner, setBanner, navigate, location.pathname]);

    if (auth === null) return <div>Loading quizzes...</div>;
    if (!auth.auth) return null; // redirect already triggered

    {/* Starter kit welcome message */ }
    //console.log("HAS STARTER KIT: " + hasStarterKit);
    //console.log("STARTER KIT DATE: " + starterKitCreated);
    //console.log("parsed date:", new Date(starterKitCreated));





    return (
        <div className="page-container w-100 pt-3">
            <div className="content-holder-desktop" >
                <div className="content-inner-desktop">
                    {/* Starter kit welcome message */}
                    {/* Starter kit welcome message */}
                    {hasStarterKit && starterKitCreated && (() => {
                        const created = new Date(starterKitCreated);
                        const now = new Date();
                        const diffDays = (now - created) / (1000 * 60 * 60 * 24);

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

                </div>
            </div>


        </div>
    );

}

export default Dashboard;