import { StrictMode, Suspense, lazy } from "react";
import { createRoot } from "react-dom/client";
import { RouterProvider, createBrowserRouter } from "react-router-dom";
import { AdminLayout } from "./layouts/admin-layout";
import { DashboardPage } from "./pages/dashboard";
import { ContentListPage } from "./pages/content-list";
import "./index.css";

// Lazy-load the editor page so the heavy Tiptap bundle only loads when needed.
const ContentEditorPage = lazy(() =>
  import("./pages/content-editor").then((m) => ({ default: m.ContentEditorPage })),
);

const editorElement = (
  <Suspense fallback={<p className="text-muted-foreground">에디터 불러오는 중…</p>}>
    <ContentEditorPage />
  </Suspense>
);

const router = createBrowserRouter([
  {
    path: "/",
    element: <AdminLayout />,
    children: [
      { index: true, element: <DashboardPage /> },
      { path: "contents", element: <ContentListPage /> },
      { path: "contents/new", element: editorElement },
      { path: "contents/:id/edit", element: editorElement },
    ],
  },
]);

const rootElement = document.getElementById("root");
if (!rootElement) {
  throw new Error("Root element #root not found");
}

createRoot(rootElement).render(
  <StrictMode>
    <RouterProvider router={router} />
  </StrictMode>,
);
