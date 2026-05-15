import Notifications from "~/components/organisms/Notifications/Notifications";
import { useEffect, useState } from "@wordpress/element";
import { TQueryArgs, useFiles } from "~/hooks/useFiles";
import Accounts from "~/components/molecules/Accounts";
import SearchBox from "~/components/organisms/SearchBox/SearchBox";
import Button from "~/components/atoms/Button";
import Topbar from "~/components/molecules/Topbar";
import { toBoolean } from "~/utils/functions";

const FileTopbar = ({
    refresh,
    activeFolder,
    openFolder,
    queryArgs,
    expandSearch,
    loading,
}: {
    refresh: () => void;
    activeFolder: string;
    openFolder: (fileKey: string) => void;
    queryArgs: TQueryArgs;
    expandSearch: (queryArgs: React.SetStateAction<TQueryArgs>) => void;
    loading: boolean;
}) => {
    const [isCompact, setIsCompact] = useState(false);
    const {
        files,
        loading: isSearchLoading,
        totalCount,
        queryArgs: searchQueryArgs,
        setQueryArgs: setSearchQueryArgs,
    } = useFiles("my-drive");

    useEffect(() => {
        if (isCompact) {
            expandSearch(searchQueryArgs);
        }
    }, [isCompact]);

    const search = (
        <SearchBox
            isCompact={isCompact}
            setIsCompact={setIsCompact}
            activeFolder={activeFolder}
            queryArgs={!isCompact ? searchQueryArgs : queryArgs}
            setQueryArgs={!isCompact ? setSearchQueryArgs : expandSearch}
            resultProps={{
                files: files,
                loading: isSearchLoading,
                openFolder: openFolder,
                totalCount: totalCount,
            }}
        />
    );

    const refreshButton = (
        <Button
            variant="primary"
            onClick={refresh}
            startIcon="autorenew"
            loading={loading}
        >
            Refresh
        </Button>
    );

    const notifications = <Notifications skip={loading} />;

    const profile = <Accounts />;
    const rightContents = [refreshButton, notifications, profile];
    if (toBoolean(pnpnd.isPro) && !pnpnd?.currentUser?.can?.hasFullAccess) {
        rightContents.pop();
    }
    return <Topbar leftContents={[search]} rightContents={rightContents} />;
};

export default FileTopbar;
