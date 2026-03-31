import React from 'react';
import './loader.css';

interface LoaderProps {
    message: string;
    width?: number | "max";
    height?: number | "max";
}

const Loader: React.FC<LoaderProps> = ({
    message,
    width = "max",
    height = "max"
}) => {
    const resolvedWidth =
        width === "max" ? "100%" : `${width}px`;

    const resolvedHeight =
        height === "max" ? "100%" : `${height}px`;

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
