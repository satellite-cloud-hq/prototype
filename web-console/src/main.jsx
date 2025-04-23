import { RouterProvider } from "react-router";
import { createRoot } from "react-dom/client";

import { router } from "./route.ts";

const rootElement = document.getElementById("root");
createRoot(rootElement).render(<RouterProvider router={router} />);
