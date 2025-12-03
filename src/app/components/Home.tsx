import { Route, Routes, BrowserRouter as Router } from "react-router-dom";
import Sidebar from "./Sidebar";
import styles from "../css/Home.module.scss";
import Masks from "./Masks_page";
import Chat from "./Chat";

export default function Home() {
    return (
        <Router>
            <div className={styles.container}>
                <div className={styles.sidebar}>
                  <Sidebar />  
                </div>
                
                <div className={styles.content}>
                    <Routes>
                        <Route path="/" element={<Masks />} />
                        <Route path="/chat" element={<Chat />} />

                    </Routes>
                </div>
            </div>
        </Router>

    );
}
