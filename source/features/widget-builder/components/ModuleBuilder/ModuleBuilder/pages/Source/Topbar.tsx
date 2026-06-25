import FilesViews from "~/shared/file-views/components/FilesViews/FilesViews";
import SearchBox from "~/shared/search/components/SearchBox/SearchBox";
import { TQueryArgs } from "~features/file-browser/hooks/useFiles";
import { toBoolean } from "~kernel/utils/functions";
import { userCan } from "~kernel/utils/permissions";
import Accounts from "~/shared/molecules/Accounts";
import { Topbar } from "~/ui/molecules";
import { Button } from "~/ui/atoms";
import { Icon } from "~/ui/atoms";
import clsx from "clsx";

const FileTopbar = ({
    style,
    refresh,
    activeFolder,
    expandSearch,
    createFolder,
    queryArgs,
    loading,
    children,
}: {
    style?: React.CSSProperties;
    refresh: () => void;
    activeFolder: string;
    queryArgs: TQueryArgs;
    expandSearch: (queryArgs: React.SetStateAction<TQueryArgs>) => void;
    createFolder: (activeFolderKey: string) => void;
    loading: boolean;
    children?: React.ReactNode;
}) => {
    const search = (
        <SearchBox
            activeFolder={activeFolder}
            isSuperCompact
            fullWidth={false}
            fileType={false}
            queryArgs={queryArgs}
            setQueryArgs={expandSearch}
        />
    );

    const actions = userCan("folders_create") && (
        <FilesViews.Actions isCompact onlyIcon createFolder={createFolder} />
    );

    const refreshButton = (
        <Button variant="primary" onClick={refresh}>
            <Icon
                name="autorenew"
                fontSize="lg"
                className={clsx(loading && "loading")}
            />
            Refresh
        </Button>
    );

    const profile = <Accounts />;

    const rightContents = [search, actions, refreshButton, profile];

    if (
        toBoolean(pnpnd.is_pro) &&
        !userCan("has_full_access") &&
        !userCan("accounts_manage") &&
        !userCan("accounts_connect")
    ) {
        rightContents.pop();
    }

    return (
        <Topbar
            padding="15px 0px"
            border={false}
            style={style}
            leftContents={[children]}
            rightContents={rightContents}
        />
    );
};

export default FileTopbar;
