import UserAccessAdd from "~/components/organisms/UserAccess/UserAccess";
import FileBrowser from "~/components/pages/FileBrowser/FileBrowser";
import Dashboard from "~/components/pages/ModuleDashboard/Dashboard";
import UserAccess from "~/components/pages/UserAccess/UserAccess";
import Builder from "~/components/pages/ModuleBuilder/Builder";
import Settings from "~/components/pages/Settings/Settings";
import { Navigate, Route, Routes } from "react-router-dom";
import Login from "~/components/organisms/Login/Login";
import SettingsRoute from "~/Routes/SettingsRoute";
import AuthRoute from "~/Routes/AuthRoute";

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

            <Route
                path="/user-access/:access_id/:accessMenu/:menuKey?"
                element={
                    <AuthRoute>
                        <UserAccessAdd />
                    </AuthRoute>
                }
            />
        </Routes>
    );
};

export default App;
