import React from 'react';
import './loader.css';

interface LoaderProps {
    message: string;
    width?: number | "max";
    height?: number | "max";
    buttonReplacement?: boolean;
    buttonThemed?: boolean;
}

const Loader: React.FC<LoaderProps> = ({
    message,
    width = "max",
    height = "max",
    buttonReplacement = false,
    buttonThemed=false                  //only applied if buttonReplacement is true
}) => {
    const resolvedWidth =
        width === "max" ? "100%" : `${width}px`;

    const resolvedHeight =
        height === "max" ? "100%" : `${height}px`;

    const buttonThemeClass = buttonThemed ? "spinner-button-themed" : "spinner-dark";

    if (buttonReplacement) {
        return (
            <div className="loader-inline">
                <div className={`spinner small ${buttonThemeClass}`}></div>
                {message && (
                    <div className="loader-message-shrink-text" style={{ marginLeft: "8px" }}>
                        {message}
                    </div>
                )}
            </div>

        );
    }


    return (
        <div
            className="loader-container"
            style={{
                width: resolvedWidth,
                height: resolvedHeight,
                display: "flex",
                justifyContent: "center",
                alignItems: "center"
            }}
        >
            <div className="loader-content">
                <div className="spinner-container">
                    <div className="spinner"></div>
                </div>

                <div className="loader-message">{message}</div>
            </div>
        </div>
    );

};

export default Loader;
