import Notifications from "~/components/organisms/Notifications/Notifications";
import SearchBox from "~/components/organisms/SearchBox/SearchBox";
import { useEffect, useState } from "@wordpress/element";
import { TQueryArgs, useFiles } from "~/hooks/useFiles";
import Accounts from "~/components/molecules/Accounts";
import Topbar from "~/components/molecules/Topbar";
import Button from "~/components/atoms/Button";
import { toBoolean } from "~/utils/functions";
import Icon from "~/components/atoms/Icon";
import clsx from "clsx";

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
    openFolder: (file_key: string) => void;
    queryArgs: TQueryArgs;
    expandSearch: (queryArgs: React.SetStateAction<TQueryArgs>) => void;
    loading: boolean;
}) => {
    const [isCompact, setIsCompact] = useState(false);
    const {
        files,
        loading: isSearchLoading,
        queryArgs: searchQueryArgs,
        setQueryArgs: setSearchQueryArgs,
    } = useFiles(activeFolder);

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

    const notifications = pnpnd?.current_user?.can?.has_full_access && (
        <Notifications skip={loading} />
    );

    const profile = <Accounts />;

    const rightContents = [refreshButton, notifications, profile];

    if (
        toBoolean(pnpnd.is_pro) &&
        !pnpnd?.current_user?.can?.has_full_access &&
        !pnpnd?.current_user?.can?.accounts_connect &&
        !pnpnd?.current_user?.can?.accounts_manage
    ) {
        rightContents.pop();
    }

    return <Topbar leftContents={[search]} rightContents={rightContents} />;
};

export default FileTopbar;
