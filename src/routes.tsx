import { createBrowserRouter } from "react-router-dom";
import App from "./App";
import { PublicProfile } from "./components/PublicProfile";

export const router = createBrowserRouter([
  {
    path: "/",
    element: <App />,
  },
  {
    path: "/:username",
    element: <PublicProfile />,
  },
]);
