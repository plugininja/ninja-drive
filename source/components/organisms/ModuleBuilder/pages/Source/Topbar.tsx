import Accounts from "~/components/molecules/Accounts";
import SearchBox from "~/components/organisms/SearchBox/SearchBox";
import { TQueryArgs } from "~/hooks/useFiles";
import Button from "~/components/atoms/Button";
import Topbar from "~/components/molecules/Topbar";
import Icon from "~/components/atoms/Icon";
import clsx from "clsx";
import { toBoolean } from "~/utils/functions";

const FileTopbar = ({
    style,
    refresh,
    activeFolder,
    expandSearch,
    queryArgs,
    loading,
}: {
    style?: React.CSSProperties;
    refresh: () => void;
    activeFolder: string;
    queryArgs: TQueryArgs;
    expandSearch: (queryArgs: React.SetStateAction<TQueryArgs>) => void;
    loading: boolean;
}) => {
    const search = (
        <SearchBox
            activeFolder={activeFolder}
            isCompact
            fileType={false}
            queryArgs={queryArgs}
            setQueryArgs={expandSearch}
        />
    );

    const refreshButton = (
        <Button variant="outlined" onClick={refresh}>
            <Icon
                name="autorenew"
                fontSize="lg"
                className={clsx(loading && "loading")}
            />
            Refresh
        </Button>
    );

    const profile = <Accounts />;
    const rightContents = [refreshButton, profile];
    if (toBoolean(pnpnd.isPro) && !pnpnd?.currentUser?.can?.hasFullAccess) {
        rightContents.pop();
    }

    return (
        <Topbar
            style={style}
            leftContents={[search]}
            rightContents={rightContents}
        />
    );
};

export default FileTopbar;
