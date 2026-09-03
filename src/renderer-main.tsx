import "./index.css"
import { createRoot } from "react-dom/client"
import { ExtensionRendererApp } from "./ExtensionRendererApp"

createRoot(document.getElementById("root")!).render(<ExtensionRendererApp />)
