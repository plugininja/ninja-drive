import Notifications from "~/shared/notifications-ui/components/Notifications/Notifications";
import SearchBoxWithHook from "~features/search/components/SearchBoxWithHook";
import { TQueryArgs } from "~features/file-browser/hooks/useFiles";
import { toBoolean } from "~kernel/utils/functions";
import { userCan } from "~kernel/utils/permissions";
import Accounts from "~/shared/molecules/Accounts";
import { useState } from "@wordpress/element";
import { Topbar } from "~/ui/molecules";
import { Button } from "~/ui/atoms";
import { Icon } from "~/ui/atoms";
import clsx from "clsx";

const FileTopbar = ({
    refresh,
    activeFolder,
    openFolder,
    expandSearch,
    loading,
}: {
    refresh: () => void;
    activeFolder: string;
    openFolder: (file_key: string) => void;
    queryArgs: TQueryArgs;
    expandSearch: (queryArgs: React.SetStateAction<TQueryArgs>) => void;
    loading: boolean;
}) => {
    const [isCompact, setIsCompact] = useState(false);

    const search = (
        <SearchBoxWithHook
            folder_id={activeFolder}
            isCompact={isCompact}
            onSetCompact={setIsCompact}
            onOpenFolder={(file_key) => {
                openFolder(file_key);
                setIsCompact(false);
            }}
            fileType
            onExpandSearch={(params) => {
                expandSearch((prev: TQueryArgs) => ({
                    ...prev,
                    search: params.search || null,
                    types: params.types as TQueryArgs["types"],
                    search_scope:
                        params.scope === "current_folder" ? "folder" : "global",
                    search_location: params.location ?? "cache",
                    page: 1,
                }));
            }}
        />
    );

    const refreshButton = (
        <Button variant="primary" onClick={refresh}>
            <Icon
                name="autorenew"
                color="white"
                fontSize="lg"
                className={clsx(loading && "loading")}
            />
            Refresh
        </Button>
    );

    const notifications = userCan("has_full_access") && (
        <Notifications skip={loading} />
    );

    const profile = <Accounts />;

    const rightContents = [refreshButton, notifications, profile];

    if (
        toBoolean(pnpnd.is_pro) &&
        !userCan("has_full_access") &&
        !userCan("accounts_connect") &&
        !userCan("accounts_manage")
    ) {
        rightContents.pop();
    }

    return (
        <Topbar
            leftContents={[search]}
            rightContents={rightContents}
            border={false}
            style={{
                borderBottom: "1px solid var(--pnpnd-primary-light)",
            }}
        />
    );
};

export default FileTopbar;
