import { useCallback, useEffect, useRef, useState } from "@wordpress/element";
import SearchBox from "~/components/organisms/SearchBox/SearchBox";
import { TQueryArgs, useFiles } from "~/hooks/useFiles";

const FileSearchDropdown = ({
    activeFolder,
    openFolder,
    setIsCompact,
    expandSearch,
}: {
    activeFolder: string;
    openFolder: (file_key: string) => void;
    setIsCompact: (isCompact: boolean) => void;
    expandSearch: (queryArgs: React.SetStateAction<TQueryArgs>) => void;
}) => {
    const [hasSearchText, setHasSearchText] = useState(false);

    const {
        files,
        loading,
        total_count,
        queryArgs,
        setQueryArgs: originalSetQueryArgs,
    } = useFiles("my-drive", !hasSearchText);

    const setQueryArgs = useCallback(
        (action: React.SetStateAction<TQueryArgs>) => {
            originalSetQueryArgs((prev) => {
                const next = typeof action === "function" ? action(prev) : action;
                setHasSearchText(!!next.search);
                return next;
            });
        },
        [originalSetQueryArgs],
    );

    const queryArgsRef = useRef(queryArgs);
    queryArgsRef.current = queryArgs;

    useEffect(() => {
        return () => {
            expandSearch(queryArgsRef.current);
        };
    }, []);

    return (
        <SearchBox
            isCompact={false}
            setIsCompact={setIsCompact}
            activeFolder={activeFolder}
            queryArgs={queryArgs}
            setQueryArgs={setQueryArgs}
            resultProps={{
                files,
                loading,
                openFolder,
                total_count,
            }}
        />
    );
};

export default FileSearchDropdown;
