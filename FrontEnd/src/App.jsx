import { Routes, Route, Navigate } from 'react-router-dom';
import SignIn from './components/SignIn/SignIn.jsx';
import Register from './components/Account/Register/Register';
import ThemeSelectorPage from './components/Account/Themes/Themes';
import Profile from './components/Account/Profile/Profile';
import Dashboard from './components/Dashboard/Dashboard.jsx';
import MyQuizzes from './components/QuizBuilder/MyQuizzes/MyQuizzes.jsx'
import QuizInfo from './components/QuizBuilder/QuizInfo/QuizInfo'
import Questions from './components/QuizBuilder/Questions/Questions'
import Edit from './components/QuizBuilder/Questions/Edit/Edit'
import Add from './components/QuizBuilder/Questions/Add/Add'
import Review from './components/QuizBuilder/Review/Review'
import Intro from './components/QuizTaker/Intro/Intro'
import QuizTakerRoutes from './components/QuizTaker/Routes/QuizTakerRoutes'
import QuizProvider from './components/QuizTaker/QuizProvider/QuizProvider'
import ChangePasswordPage from './components/Account/ChangePassword/ChangePasswordPage.tsx'
import ForgotPassword from './components/Account/ForgotPassword/ForgotPassword'
import ResetPasswordPage from './components/Account/ForgotPassword/ResetPassword'

import Layout from './components/Layout.tsx';
import LoadCheckAuth from './components/LoadCheckAuth/LoadCheckAuth.jsx';
import FormFooterLink from './components/UserControls/FormFooterLink/FormFooterLink';

//Test pages
import Test from './components/Test/Test';
import TestAPI from './components/Test/TestAPI';

function App() {

    return (

        <Routes>

            {/* PUBLIC ROUTES */}
            <Route
                element={
                    <Layout
                        footerSlots={[
                            <FormFooterLink
                                text="Forgot Password?"
                                linkText="Click here to reset password"
                                linkUrl="/account/forgotpassword"
                            />,
                            <FormFooterLink
                                text="Interested in signing up?"
                                linkText="Register for Online Access"
                                linkUrl="/account/register"
                            />
                        ]}
                    />
                }
            >
                <Route index element={<Navigate to="/signin" replace />} />
                <Route path="signin" element={<SignIn />} />
            </Route>

            <Route
                element={
                    <Layout
                        footerSlots={[
                            <FormFooterLink
                                text="Already have an account?"
                                linkText="Sign in here"
                                linkUrl="/signin"
                            />
                        ]}
                    />
                }
            >
                <Route path="account/register" element={<Register />} />
            </Route>

            {/* FORGOT PASSWORD (when you build it) */}
            <Route
                element={
                    <Layout
                        footerSlots={[
                            <FormFooterLink
                                text="Already have an account?"
                                linkText="Sign in here"
                                linkUrl="/signin"
                            />,
                            <FormFooterLink
                                text="Interested in signing up?"
                                linkText="Register for Online Access"
                                linkUrl="/account/register"
                            />
                        ]}
                    />
                }
            >
                <Route index element={<Navigate to="/account/forgotpassword" replace />} />
                <Route path="account/forgotpassword" element={<ForgotPassword />} />
            </Route>






            {/* AUTHENTICATED ROUTES */}
            <Route element={<Layout />}>

                <Route path="dashboard" element={<Dashboard />} />
                <Route path="loadcheckauth" element={<LoadCheckAuth />} />

                <Route path="account/themes" element={<ThemeSelectorPage />} />
                <Route path="account/profile" element={<Profile />} />

                <Route path="account/changepassword" element={<ChangePasswordPage />} />
                <Route path="account/forgotpassword" element={<ForgotPassword />} />
                <Route path="account/resetpassword" element={<ResetPasswordPage />} />
                <Route path="account/resetpassword/:token" element={<ResetPasswordPage />} />

                <Route path="quizbuilder/myquizzes" element={<MyQuizzes />} />
                <Route path="quizbuilder/quizinfo" element={<QuizInfo />} />
                <Route path="quizbuilder/quizinfo/:id" element={<QuizInfo />} />

                <Route path="quizbuilder/questions" element={<Questions />} />
                <Route path="quizbuilder/questions/:id" element={<Questions />} />

                <Route path="quizbuilder/questions/edit" element={<Edit />} />
                <Route path="quizbuilder/questions/edit/:id" element={<Edit />} />

                <Route path="quizbuilder/questions/add" element={<Add />} />
                <Route path="quizbuilder/questions/add/:quizId" element={<Add />} />

                <Route path="quizbuilder/review" element={<Review />} />
                <Route path="quizbuilder/review/:id" element={<Review />} />



                {/* <Route path="quiz/intro" element={<Intro />} />
                <Route path="quiz/intro/:quizId" element={<Intro />} /> */}

                {/* <Route
                    path="quiz/*"
                    element={
                        <QuizProvider>
                            <QuizTakerRoutes />
                        </QuizProvider>
                    }
                /> */}
                <Route
                    path="quiz/:quizId/*"
                    element={
                        <QuizProvider>
                            <QuizTakerRoutes />
                        </QuizProvider>
                    }
                />



            </Route>

            <Route path="test/testAPI" element={<TestAPI />} />
            <Route path="test/test" element={<Test />} />

        </Routes>


    );
}



export default App;



