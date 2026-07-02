import React, { useState, useEffect } from 'react';
import Icon from '../../../components/UserControls/Icons/icons';
import Loader from '../Loader/Loader';

type DropdownOption = {
    id: string;
    text: string;
};

type DropdownProps = {
    isLoading?: boolean;
    options: { id: string; text: string }[];
    selectedId?: string;
    onSelect: (id: string, text: string) => void;
    maxHeight?: number;
    width?: number;
};

export const Dropdown: React.FC<DropdownProps> = ({
    isLoading = false,
    options,
    selectedId,
    onSelect,
    maxHeight,
    width,
}) => {
    // const selectedText =
    //     options.find(opt => opt.id === selectedId)?.text || 'Select ...';
    const [isOpen, setIsOpen] = useState(false);

    const dropdownRef = React.useRef<HTMLDivElement>(null);


    const selectedText =
        isLoading
            ? "" // or null — it won't be shown anyway
            : options.find(opt => opt.id === selectedId)?.text || "Select ...";


    const handleSelect = (id: string, text: string) => {
        onSelect(id, text);
        setIsOpen(false);   // close after selecting
    };

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (
                dropdownRef.current &&
                !dropdownRef.current.contains(event.target as Node)
            ) {
                setIsOpen(false);
            }
        };

        document.addEventListener("mousedown", handleClickOutside);
        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, []);


    return (
        <div className="dropdown" ref={dropdownRef}>
            {/* <div className={`dropdown-value ${selectedId ? 'dropdown-value-populated' : ''}`} style={{width: width ?? 160}}>
                {selectedText}
            </div> */}
            <div
                className="dropdown-wrapper"
                style={{ pointerEvents: isLoading ? 'none' : 'auto' }}
            >
                <div
                    className={`dropdown-value ${selectedId ? 'dropdown-value-populated' : ''}`}
                    style={{ width: width ?? 160, opacity: isLoading ? 1 : 1 }}
                    onClick={() => setIsOpen(prev => !prev)}
                >
                    {isLoading ? (
                        <Loader message="Loading ..." buttonReplacement={true} buttonThemed={true} />
                    ) : (
                        <>
                            <div
                                style={{
                                    display: "flex",
                                    justifyContent: "space-between",
                                    alignItems: "center"
                                }}
                            >
                                <span className="ps-3">{selectedText}</span>
                                <span className="pe-2">
                                    <Icon name="chevronDown" />
                                </span>
                            </div>



                        </>
                    )}

                </div>
            </div>

            <div className="dropdown-content" style={{
                display: isOpen ? "block" : "none",
                maxHeight: maxHeight ?? 250,
                width: width ?? 160
            }}>
                {options.map(option => (
                    <a
                        key={option.id}
                        onClick={() => handleSelect(option.id, option.text)}
                        className={option.id === selectedId ? 'dropdown-item-selected' : ''}
                    >
                        {option.text}
                    </a>
                ))}
            </div>
        </div>
    );
};