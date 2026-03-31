import React from 'react';
import './signinloader.css';

interface SignInLoaderProps {
    hasStarterKit?: boolean | null;
}

const SignInLoader: React.FC<SignInLoaderProps> = ({ hasStarterKit }) => {
    const message =
        hasStarterKit === false
            ? "Preparing your starter kit... This may take 30-60 seconds."
            : "Signing you in...";

    return (
        <div className="signin-loader-container">
            <div className="signin-loader-content">
                <div className="spinner-container">
                    <div className="spinner"></div>
                </div>

                <div className="signin-loader-message">{message}</div>
            </div>
        </div>
    );
};

export default SignInLoader;