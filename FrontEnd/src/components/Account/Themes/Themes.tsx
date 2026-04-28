import React, { useState, useEffect } from "react";
import { useNavigate, useOutletContext } from 'react-router-dom';
import CheckAuth from '../../../components/Account/CheckAuth';
import { getApiBaseUrl } from '../../../helpers/config';
import { Dropdown } from "../../UserControls/Dropdown/Dropdown";
import ButtonGrid from "../../UserControls/ButtonGrid/ButtonGrid";

const hexToRgba = (hex: string, alpha = 1): string => {
    const r = parseInt(hex.slice(1, 3), 16);
    const g = parseInt(hex.slice(3, 5), 16);
    const b = parseInt(hex.slice(5, 7), 16);
    return `rgba(${r}, ${g}, ${b}, ${alpha})`;
};

type ThemeOption = {
    id: string;
    text: string;
    //sortOrder: number;
};

interface AuthResult {
    auth: boolean;
    username?: string;
    claims?: { FirstName?: string; ThemeId?: string };
}


const ThemeSelectorPage: React.FC = () => {


    const navigate = useNavigate();
    const API_BASE = getApiBaseUrl();

    const { setTitle, setBanner } = useOutletContext();

    useEffect(() => {
        setTitle('Themes');
    }, [setTitle]);


    const [auth, setAuth] = useState<AuthResult | null>(null);
    const [initialTheme, setInitialTheme] = useState<string>("1");

    const [selectedTheme, setSelectedTheme] = useState<string>("1");
    const [themes, setThemes] = useState<ThemeOption[]>([]);
    const [saveDisabled, setSaveDisabled] = useState(true);

    //const [userSaved, setUserSaved] = useState(false);
    const userSavedRef = React.useRef(false);

    const originalThemeRef = React.useRef<string | null>(null);
    const lastRequestedThemeRef = React.useRef<string | null>(null);



    useEffect(() => {
        async function hydrateAuth() {
            const result = await CheckAuth();
            setAuth(result);
            //console.log('CheckAuth result:', result);
        }
        hydrateAuth();
    }, []);

    //Set initial and selected page on page load
    useEffect(() => {
        if (!auth) return;

        // Same logic as layout.tsx, but only the ID
        const resolvedThemeId = parseInt(auth?.claims?.ThemeId ?? "1", 10);

        setInitialTheme(resolvedThemeId.toString());
        setSelectedTheme(resolvedThemeId.toString());

        // Capture the theme the user had when they entered the page
        if (originalThemeRef.current === null) {
            originalThemeRef.current = resolvedThemeId.toString();
        }


    }, [auth]);

    useEffect(() => {
        fetch(`${API_BASE}/api/theme/active`, {
            credentials: "include"
        })
            .then(res => res.json())
            .then(data => {
                setThemes(data.map(g => ({
                    id: g.id.toString(),
                    text: g.description
                })));
            });
    }, []);






    const handleSelect = (id: string, text: string) => {
        //console.log("Selected:", id);
        setSelectedTheme(id.toString());
    };


    //Apply theme variables when a theme is selected (temporarily changed)
    // useEffect(() => {
    //     if (!selectedTheme) return;

    //     fetch(`${API_BASE}/api/theme/${selectedTheme}/variables`, {
    //         credentials: "include",
    //         headers: { "Content-Type": "application/json" }
    //     })
    //         .then(res => {
    //             if (!res.ok) throw new Error(`Failed to fetch theme variables: ${res.status}`);
    //             return res.json();
    //         })
    //         .then((data: { description: string; color: string }[]) => {
    //             setSaveDisabled(selectedTheme === initialTheme);



    //             // Apply CSS variables
    //             data.forEach(({ description, color }) => {
    //                 document.documentElement.style.setProperty(`--${description}`, color);
    //             });

    //             const borderHex =
    //                 data.find(v => v.description === "textBoxBorderColor")?.color ?? "#dfdfdf";

    //             const borderRgba = hexToRgba(borderHex, 0.75);
    //             document.documentElement.style.setProperty("--textBoxShadowColorRgba", borderRgba);

    //             console.log("Theme variables applied successfully.");
    //         })
    //         .catch(err => {
    //             console.error("Error fetching theme variables:", err);
    //         });
    // }, [selectedTheme]);

    useEffect(() => {
        if (!selectedTheme) return;

        //setSaveDisabled(selectedTheme === initialTheme);
        applyThemeVariables(selectedTheme);
    }, [selectedTheme]);

    useEffect(() => {
        setSaveDisabled(selectedTheme === initialTheme);
    }, [selectedTheme, initialTheme]);





    const applyThemeVariables = async (themeId: string) => {
        lastRequestedThemeRef.current = themeId;
        const currentRequestId = themeId;

        try {
            const res = await fetch(`${API_BASE}/api/theme/${themeId}/variables`, {
                credentials: "include",
                headers: { "Content-Type": "application/json" }
            });

            if (!res.ok) throw new Error(`Failed to fetch theme variables: ${res.status}`);

            const data: { description: string; color: string }[] = await res.json();

            // If a newer theme was requested while this was in flight, abort
            if (lastRequestedThemeRef.current !== currentRequestId) {
                return;
            }

            data.forEach(({ description, color }) => {
                document.documentElement.style.setProperty(`--${description}`, color);
            });

            const borderHex =
                data.find(v => v.description === "textBoxBorderColor")?.color ?? "#dfdfdf";

            const borderRgba = hexToRgba(borderHex, 0.75);
            document.documentElement.style.setProperty("--textBoxShadowColorRgba", borderRgba);

        } catch (err) {
            console.error("Error applying theme variables:", err);
        }
    };



    const onSave = async () => {

        setBanner('');
        performSaveTheme();

    };

    const onSaveContinue = async () => {
        setBanner('');
        performSaveTheme();
        navigate("/dashboard");
    }



    const onCancel = async () => {
        //setBanner('');
        const result = await CheckAuth(); // or CheckAuth()
        setAuth(result);
        navigate("/dashboard");
    };



    const performSaveTheme = async () => {

        if (!selectedTheme) return;

        try {
            const res = await fetch(`${API_BASE}/api/theme/user-theme`, {
                method: "PUT",
                credentials: "include",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(selectedTheme) // send raw number
            });


            if (!res.ok) {
                throw new Error(`Failed to save theme: ${res.status}`);
            }

            // Show success banner
            setBanner('Theme successfully saved!');
            setInitialTheme(selectedTheme);
            userSavedRef.current = true;
            originalThemeRef.current = selectedTheme;


            applyThemeVariables(selectedTheme);

            //console.log("FIRST");
            setSaveDisabled(true);

        } catch (err) {
            console.error(err);
            setBanner('Unable to save theme.');
        }
    };


    useEffect(() => {

        return () => {

            setBanner('');
        };
    }, []);

    useEffect(() => {
        // If the user changes the theme after saving, this is a new unsaved preview
        if (selectedTheme !== initialTheme) {
            userSavedRef.current = false;
        }
    }, [selectedTheme]);



    useEffect(() => {

        return () => {

            //console.log("%%%%% Unmounting");
            //console.log("SECOND");
            //console.log("%%%%% Selected Theme: " + selectedTheme);
            //console.log("%%%%% Initial Theme: " + initialTheme);
            //console.log("%%%%% User Saved: " + userSavedRef.current);
            const previewActive = selectedTheme !== initialTheme;

            if (previewActive && !userSavedRef.current && originalThemeRef.current) {
                //console.log("%%%%% Revert");
                applyThemeVariables(originalThemeRef.current);
            }
        };
    }, [selectedTheme, initialTheme]);



    return (
        <form className="page-container ">
            <div className="content-holder-desktop" style={{ minHeight: "519px" }}>
                <div className="content-inner-desktop">
                    <div className=" mt-4">
                        <div className="row" >

                            {/* Customize Message */}
                            <div className="col-md-6 order-1 order-md-1">
                                <div className="mb-3">
                                    <h5>Customize the appearance of your app</h5>
                                    <p>Select from one of several pre-defined themes</p>
                                </div>
                            </div>

                            {/* Theme Dropdown */}
                            <div className="col-md-6 order-3 order-md-2">
                                <div className="mb-3">
                                    <label className="form-label-tight">Theme</label>

                                    <div className="form-element d-flex">
                                        <div className="dropdown-holder">
                                            <Dropdown
                                                options={themes}
                                                selectedId={selectedTheme}
                                                onSelect={handleSelect}
                                                maxHeight={280}
                                                width={170}
                                            />
                                        </div>

                                        <div className="button-holder ps-4">
                                            <button
                                                className="button static-large-button"
                                                type="button"
                                                onClick={() => setSelectedTheme(initialTheme)}
                                            >
                                                <span className="btn-text">Revert Theme</span>
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Sample Textbox */}
                            <div className="col-md-6 order-2 order-md-3">
                                <div className="mb-3">
                                    <label className="form-label">Textbox Label</label>
                                    <div className="form-element">
                                        <input
                                            type="text"
                                            className="form-control textbox textbox-text textbox-large"
                                            value="Sample Text"
                                            readOnly
                                        />
                                    </div>
                                </div>
                            </div>

                        </div>
                    </div>
                </div>
            </div>


            {/* Buttons Section */}
            <ButtonGrid
                buttons={[
                    {
                        text: "Cancel",
                        type: "button",
                        onClick: onCancel,
                        mobileSlot: 1,
                        desktopSlot: 3
                    },
                    {
                        text: "Save",
                        type: "button",
                        onClick: onSave,
                        mobileSlot: 2,
                        desktopSlot: 4,
                        isDisabled: saveDisabled
                    },
                    {
                        text: "Save & Continue",
                        type: "button",
                        onClick: onSaveContinue,
                        mobileSlot: 3,
                        desktopSlot: 5,
                        isDisabled: saveDisabled
                    }
                ]}
            />

        </form>
    );
};

export default ThemeSelectorPage;