import "./index.css"
import { createRoot } from "react-dom/client"
import { GalleryApp } from "./gallery/GalleryApp"

createRoot(document.getElementById("root")!).render(<GalleryApp />)
