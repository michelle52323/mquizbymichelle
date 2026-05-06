import React, { useState, useEffect } from 'react';
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
    const selectedText =
    isLoading
        ? "" // or null — it won't be shown anyway
        : options.find(opt => opt.id === selectedId)?.text || "Select ...";


    const handleSelect = (id: string, text: string) => {
        onSelect(id, text);
    };

    return (
        <div className="dropdown">
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
                >
                    {isLoading ? <Loader message="Loading ..." buttonReplacement={true} buttonThemed={true} /> : selectedText}
                </div>
            </div>

            <div className="dropdown-content" style={{
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