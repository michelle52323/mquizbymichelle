import React from 'react';
import './loader.css';

interface LoaderProps {
    message: string;
    width?: number | "max";
    height?: number | "max";
    buttonReplacement?: boolean;
}

const Loader: React.FC<LoaderProps> = ({
    message,
    width = "max",
    height = "max",
    buttonReplacement = false
}) => {
    const resolvedWidth =
        width === "max" ? "100%" : `${width}px`;

    const resolvedHeight =
        height === "max" ? "100%" : `${height}px`;


    if (buttonReplacement) {
        return (
            <div className="loader-inline">
                <div className="spinner small spinner-dark"></div>
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
