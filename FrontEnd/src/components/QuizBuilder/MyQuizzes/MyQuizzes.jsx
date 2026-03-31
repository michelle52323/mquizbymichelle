import { useEffect, useState } from 'react';
import { useNavigate, useOutletContext } from 'react-router-dom';
import { isMobileTouchDevice } from '../../../helpers/config';
import CheckAuth from '../../../components/Account/checkAuth';
import QuizListMobile from './MyQuizzesMobile';
import QuizListDesktop from './MyQuizzesDesktop';
import ButtonGrid from '../../UserControls/ButtonGrid/ButtonGrid';
import Icon from '../../UserControls/Icons/icons';

function MyQuizzes() {
    const navigate = useNavigate();
    const { setTitle, setBanner } = useOutletContext();
    const [auth, setAuth] = useState(null);

    useEffect(() => {

        return () => {

            setBanner('');

        };
    }, []);

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
            navigate("/signin");
        } else if (auth.claims["http://schemas.microsoft.com/ws/2008/06/identity/claims/role"] != "Instructor") {
            navigate("/dashboard")
        } else {
            setTitle("My Quizzes");
        }
    }, [auth, navigate, setTitle]);


    if (auth === null) return <div>Loading dashboard...</div>;
    if (!auth.auth) return null;

    //  Device-based layout rendering
    // return isMobileTouchDevice() ? <QuizListMobile /> : <QuizListDesktop />;
    return (

        <div className="page-container w-100">


            <div className={isMobileTouchDevice() ? "content-holder-mobile" : "content-holder-desktop"}>

                {/* MAIN CONTENT */}
                {isMobileTouchDevice() ? <QuizListMobile /> : <QuizListDesktop />}


            </div>

            {/* NAVIGATION BUTTON ROW */}
            <ButtonGrid
                buttons={[
                    {
                        text: "Quiz",
                        url: "/quizbuilder/quizinfo",
                        icon: <Icon name="add" />,
                        type: "button",
                        mobileSlot: 3,
                        desktopSlot: 5
                    }
                ]}
            />
        </div>


    );

}

export default MyQuizzes;