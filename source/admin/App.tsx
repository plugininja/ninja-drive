import Dashboard from "~/components/pages/ModuleDashboard/Dashboard";
import { Navigate, Route, Routes } from "react-router-dom";
import Builder from "~/components/pages/ModuleBuilder/Builder";
import FileBrowser from "~/components/pages/FileBrowser/FileBrowser";
import SettingsRoute from "~/Routes/SettingsRoute";
import Settings from "~/components/pages/Settings/Settings";
import AuthRoute from "~/Routes/AuthRoute";
import Login from "~/components/organisms/Login/Login";

const App = () => {
    return (
        <Routes>
            <Route
                path="*"
                element={<Navigate to="/file-browser/my-drive" replace />}
            />

            <Route
                path="/login"
                element={
                    <AuthRoute>
                        <SettingsRoute>
                            <Login />
                        </SettingsRoute>
                    </AuthRoute>
                }
            />

            <Route
                path="/file-browser/:menuKey"
                element={
                    <AuthRoute>
                        <FileBrowser />
                    </AuthRoute>
                }
            />

            <Route
                path="/settings/:menuKey"
                element={
                    <AuthRoute skipAuthGuard>
                        <SettingsRoute>
                            <Settings />
                        </SettingsRoute>
                    </AuthRoute>
                }
            />

            <Route
                path="/widget-builder"
                element={
                    <AuthRoute>
                        <Dashboard />
                    </AuthRoute>
                }
            />

            <Route
                path="/widget-builder/:widgetId/:widgetMenu/:menuKey?"
                element={
                    <AuthRoute>
                        <Builder />
                    </AuthRoute>
                }
            />
        </Routes>
    );
};

export default App;
