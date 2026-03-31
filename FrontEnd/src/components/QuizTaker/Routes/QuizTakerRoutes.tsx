import { Routes, Route } from "react-router-dom";
import Intro from "../Intro/Intro";
import Questions from "../Questions/Questions";

export default function QuizTakerRoutes() {
    return (
        <Routes>
            <Route path="intro" element={<Intro />} />
            <Route path="questions" element={<Questions />} />
            <Route path="questions/:questionId" element={<Questions />} />
        </Routes>
    );
}
