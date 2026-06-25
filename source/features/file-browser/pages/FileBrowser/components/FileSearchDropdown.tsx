import SearchBoxWithHook from "~features/search/components/SearchBoxWithHook";

const FileSearchDropdown = ({
    activeFolder,
    openFolder,
    setIsCompact,
    expandSearch,
}: {
    activeFolder: string;
    openFolder: (file_key: string) => void;
    setIsCompact: (isCompact: boolean) => void;
    expandSearch: (queryArgs: any) => void;
}) => {
    return (
        <SearchBoxWithHook
            folder_id={activeFolder}
            isCompact={false}
            onSetCompact={setIsCompact}
            onOpenFolder={(file_key) => {
                openFolder(file_key);
            }}
            fileType
            onExpandSearch={(params) => {
                expandSearch((prev: any) => ({
                    ...prev,
                    search: params.search,
                    types: params.types,
                    search_scope:
                        params.scope === "current_folder"
                            ? "folder"
                            : "global",
                    search_location: params.location ?? "cache",
                    page: 1,
                }));
            }}
        />
    );
};

export default FileSearchDropdown;
