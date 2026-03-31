import React, { useMemo } from 'react';
import './password-meter.css';

interface PasswordStrengthMeterProps {
    password: string;
}

function PasswordStrengthMeter({ password }: PasswordStrengthMeterProps) {

    const { score, label, color } = useMemo(() => {

        // Blank password → inactive state
        if (!password || password.length === 0) {
            return {
                score: -1,          // special case
                label: "",
                color: "lightgray"
            };
        }

        let s = 0;

        if (password.length >= 8) s++;
        if (/[A-Z]/.test(password)) s++;
        if (/[0-9]/.test(password)) s++;
        if (/[^A-Za-z0-9]/.test(password)) s++;


        // length‑based overrides
        if (password.length === 1) {
            s = 0;
        }
        else if (password.length <=3) {
            s = Math.min(s, 1);
        }
        else if (password.length <= 5) {
            s = Math.min(s, 2);
        }


        const labels = ["Very Weak", "Weak", "Fair", "Good", "Strong"];
        const colors = ["#d9534f", "#f0ad4e", "#f7e463", "#5bc0de", "#5cb85c"];

        return {
            score: s,
            label: labels[s],
            color: colors[s]
        };
    }, [password]);

    // Width logic:
    // - score = -1 → empty bar
    // - score = 0 → 20%
    // - score = 1 → 40%
    // - score = 2 → 60%
    // - score = 3 → 80%
    // - score = 4 → 100%
    const width =
        score === -1
            ? "0%"
            : `${((score + 1) / 5) * 100}%`;

    return (
        <div className="strength-meter-casing">
            <div id="strengthMeter">
                <div
                    className="strength-level"
                    style={{
                        width,
                        backgroundColor: color,
                        transition: "width 0.3s ease"
                    }}
                ></div>
            </div>

            {/* Only show text if password has content */}
            {score >= 0 && (
                <p id="strengthText">{label}</p>
            )}
        </div>
    );
}

export default PasswordStrengthMeter;
