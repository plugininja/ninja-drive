import FilesViews from "~/components/organisms/FilesViews/FilesViews";
import SearchBox from "~/components/organisms/SearchBox/SearchBox";
import Accounts from "~/components/molecules/Accounts";
import Topbar from "~/components/molecules/Topbar";
import Button from "~/components/atoms/Button";
import { toBoolean } from "~/utils/functions";
import { TQueryArgs } from "~/hooks/useFiles";
import Icon from "~/components/atoms/Icon";
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

    const actions = pnpnd.current_user?.can?.folders_create && (
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
        !pnpnd?.current_user?.can?.has_full_access &&
        !pnpnd?.current_user?.can?.accounts_manage &&
        !pnpnd?.current_user?.can?.accounts_connect
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
