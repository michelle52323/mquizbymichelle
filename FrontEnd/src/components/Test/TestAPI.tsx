import { useEffect, useState } from "react";
import { getApiBaseUrl } from "../../helpers/config";
import "./test.css";

interface TestDto {
    id: number;
    description: string;
    color: string;
}

export default function TestAPI() {
    const [colors, setColors] = useState<TestDto[]>([]);
    const [showHex, setShowHex] = useState<Record<number, boolean>>({});
    const API_BASE = getApiBaseUrl();

    useEffect(() => {
        async function load() {
            try {
                const response = await fetch(`${API_BASE}/api/test/colors`);
                const data = await response.json();
                setColors(data);

                // initialize toggle state for each item
                const initialState: Record<number, boolean> = {};
                data.forEach((item: TestDto) => {
                    initialState[item.id] = false;
                });
                setShowHex(initialState);

            } catch (err) {
                console.error("Error calling API:", err);
            }
        }

        load();
    }, [API_BASE]);

    function toggleHex(id: number) {
        setShowHex(prev => ({
            ...prev,
            [id]: !prev[id]
        }));
    }

    return (
        <div className="test-container">
            <h1>API Color Test</h1>

            {colors.map((item) => (
                <div key={item.id} className="color-wrapper">
                    <div
                        className="color-block"
                        style={{ backgroundColor: item.color }}
                    >
                        {showHex[item.id] && (
                            <span className="label">{item.color}</span>
                        )}
                    </div>

                    <button
                        className="toggle-button"
                        onClick={() => toggleHex(item.id)}
                    >
                        {showHex[item.id] ? "Hide Hex" : "Show Hex"}
                    </button>
                </div>
            ))}
        </div>
    );
}
