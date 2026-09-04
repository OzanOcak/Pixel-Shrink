// src/App.tsx
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import MainLayout from "./components/mainlayout";
import InfoPage from "./pages/infopage";
import InfoPage2 from "./pages/infopage2";
import HomePage from "./pages/homepage";

const router = createBrowserRouter([
  {
    path: "/",
    element: <MainLayout />,
    children: [
      {
        index: true,
        element: <HomePage />,
      },
      {
        path: "info",
        element: <InfoPage />,
      },
      {
        path: "todos/:id",
        element: <InfoPage2 />,
      },
    ],
  },
]);

const App: React.FC = () => {
  return <RouterProvider router={router} />;
};

export default App;
