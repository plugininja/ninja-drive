import { TQueryArgs } from "~/hooks/useFiles";
import { File } from "~/types/file.types";

export type SearchType =
    | "all"
    | "folder"
    | "documents"
    | "code"
    | "images"
    | "audio"
    | "video"
    | "archive"
    | "binary";

export interface SearchBoxProps {
    id?: string;
    style?: React.CSSProperties;
    className?: string;
    isCompact?: boolean;
    fullWidth?: boolean;
    setIsCompact?: (isCompact: boolean) => void;
    placeholder?: string;
    activeFolder: string;
    fileType?: boolean;
    queryArgs: TQueryArgs;
    setQueryArgs: React.Dispatch<React.SetStateAction<TQueryArgs>>;
    resultProps?: Omit<SearchBoxResultProps, "queryArgs">;
}

export interface SearchBoxFilterProps {
    fileType?: boolean;
    queryArgs: TQueryArgs;
    setQueryArgs: React.Dispatch<React.SetStateAction<TQueryArgs>>;
    searchLocation: TQueryArgs["searchLocation"];
    setSearchLocation: React.Dispatch<
        React.SetStateAction<TQueryArgs["searchLocation"]>
    >;
}

export interface SearchBoxResultProps {
    files?: File[] | null;
    totalCount?: number;
    queryArgs?: TQueryArgs;
    loading?: boolean;
    openFolder?: (fileKey: string) => void;
    setIsCompact?: (isCompact: boolean) => void;
}
