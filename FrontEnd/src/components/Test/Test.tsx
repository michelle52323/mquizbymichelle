import { useEffect, useState } from "react";

export default function Test() {
    const [message, setMessage] = useState("");

    useEffect(() => {
        setMessage("This is a test");
    }, []);

    return (
        <div style={{ padding: "2rem" }}>
            <h1>Frontend Test Page</h1>
            <p>{message}</p>
        </div>
    );
}
