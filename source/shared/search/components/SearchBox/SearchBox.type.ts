import { TQueryArgs } from "~features/file-browser/hooks/useFiles";
import { File } from "~features/file-browser/types/file.types";
import {
    SearchType,
    SearchScope,
    SearchLocation,
} from "~features/search/config/searchOptions";

export type { SearchType, SearchScope, SearchLocation };

export interface SearchBoxProps {
    id?: string;
    style?: React.CSSProperties;
    className?: string;
    isCompact?: boolean;
    isSuperCompact?: boolean;
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
    search_location: SearchLocation;
    setSearchLocation: React.Dispatch<React.SetStateAction<SearchLocation>>;
}

export interface SearchBoxResultProps {
    files?: File[] | null;
    total_count?: number;
    queryArgs?: TQueryArgs;
    loading?: boolean;
    openFolder?: (file_key: string) => void;
    setIsCompact?: (isCompact: boolean) => void;
}
