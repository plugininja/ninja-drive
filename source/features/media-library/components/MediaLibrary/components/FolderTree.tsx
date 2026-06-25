import TreeAction from "./TreeAction";
import { MenuKey } from "./Menus";

const FolderTree = ({ activeMenu }: { activeMenu: MenuKey }) => {

    return (
        <div style={{ padding: "15px", minWidth: 0 }}>
            <TreeAction
                files={
                    []
                }
                disabled={
                    false
                }
            />
        </div>
    );
};

export default FolderTree;
