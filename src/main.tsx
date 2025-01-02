import {StrictMode} from 'react'
import {createRoot} from 'react-dom/client'
import './index.css'
import Home from './components/Home.tsx'
import {BrowserRouter, Routes, Route} from "react-router";
import Participant from "@/components/Participant.tsx";

createRoot(document.getElementById('root')!).render(
    <StrictMode>
        <main className="w-full min-h-lvh flex flex-col justify-center items-center py-12 gap-12">
            <BrowserRouter>
                <Routes>
                    <Route path="/" element={<Home/>}/>
                    <Route path="participant/:id/:condition?/:videoIndex?" element={<Participant/>}/>
                </Routes>
            </BrowserRouter>
        </main>
    </StrictMode>,
)
