import React from "react";
import { useNavigate } from 'react-router-dom';
import { isMobileTouchDevice } from '../../../helpers/config';
interface ButtonConfig {
    text: string | React.ReactNode
    icon?: React.ReactNode;
    url?: string;
    onClick?: () => void;
    type?: "button" | "submit";
    value?: string;
    mobileSlot: number;
    desktopSlot: number;
    isDisabled?: boolean;
    isVisible?: boolean;
}

interface ButtonGridProps {
    buttons: ButtonConfig[];
    handleSave?: () => void; // optional handler for Save
}

const ButtonGrid: React.FC<ButtonGridProps> = ({ buttons, handleSave }) => {

    const navigate = useNavigate();

    // Utility to render slots
    const renderSlots = (slotCount: number, isMobile: boolean) => {
        const slots: React.ReactNode[] = [];

        for (let i = 1; i <= slotCount; i++) {
            const btn = buttons.find(b =>
                isMobile ? b.mobileSlot === i : b.desktopSlot === i
            );




            if (!btn) {
                slots.push(<div key={i} className="spacer-slot"></div>);
                continue;
            }

            const isDisabled = btn.isDisabled ?? false;
            const isVisible = btn.isVisible ?? true;
            const baseClass = isDisabled ? "button-disabled" : "button";
            const shrinkClass = btn.text.length > 12 ? "button-shrink-text" : "";


            // If button is not visible → spacer
            if (!isVisible) {
                slots.push(<div key={i} className="spacer-slot"></div>);
                continue;
            }


            const handleClick = () => {
                if (btn.onClick) {
                    btn.onClick();
                } else if (btn.url) {
                    //window.location.href = btn.url;
                    navigate(btn.url);
                }
            };

            slots.push(
                <div key={i} className="button-grid-item">
                    <button
                        className={`${baseClass} ${shrinkClass}`}
                        onClick={btn.type === "button" ? handleClick : undefined}
                        form="page-form"
                        name="action"
                        type={btn.type || "submit"}
                        value={btn.value}
                        formNoValidate={btn.text === "Cancel" ? true : undefined}
                        disabled={isDisabled}
                    >
                        {btn.icon ? (
                            (btn.icon?.props?.name === "leftArrow" || btn.icon?.props?.name === "add") ? (
                                <div className="back-button">
                                    {btn.icon}
                                    {btn.text}
                                </div>
                            ) : (
                                <div className="next-button">
                                    {btn.text}
                                    {btn.icon}
                                </div>
                            )
                        ) : (
                            <span className="btn-text">{btn.text}</span>
                        )}
                    </button>
                </div>
            );
        }

        return <div className="button-grid">{slots}</div>;
    };

    return (
        <div className={`${isMobileTouchDevice() ? 'button-grid-holder-mobile' : 'button-grid-holder-desktop'}`}>
            <div id="button-grid-desktop">
                {renderSlots(5, false)}
            </div>
            <div id="button-grid-mobile">
                {renderSlots(3, true)}
            </div>
        </div>
    );
};

export default ButtonGrid;