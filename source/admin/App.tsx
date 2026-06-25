import ModuleDashboard from "~features/widget-builder/pages/ModuleDashboard/Dashboard";
import FileBrowser from "~features/file-browser/pages/FileBrowser/FileBrowser";
import UserAccess from "~features/user-access/pages/UserAccess/UserAccess";
import Builder from "~features/widget-builder/pages/ModuleBuilder/Builder";
import Dashboard from "~features/dashboard/pages/Dashboard/Dashboard";
import SettingsRoute from "~features/settings/routes/SettingsRoute";
import Settings from "~features/settings/pages/Settings/Settings";
import { Navigate, Route, Routes } from "react-router-dom";
import AuthRoute from "~features/auth/routes/AuthRoute";
import Login from "~features/auth/ui/Login/Login";

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
                        <ModuleDashboard />
                    </AuthRoute>
                }
            />

            <Route
                path="/widget-builder/:widget_id/:widgetMenu/:menuKey?"
                element={
                    <AuthRoute>
                        <Builder />
                    </AuthRoute>
                }
            />

            <Route
                path="/user-access"
                element={
                    <AuthRoute>
                        <UserAccess />
                    </AuthRoute>
                }
            />

            <Route path="/dashboard/:menuKey" element={<Dashboard />} />
        </Routes>
    );
};

export default App;
