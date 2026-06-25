import { SelectBox, InlineStack } from "~/ui/molecules";
import { Divider } from "~/ui/atoms";
import {
    TYPE_OPTIONS,
    LOCATION_OPTIONS,
    SCOPE_OPTIONS,
    SearchType,
    SearchScope,
    SearchLocation,
} from "../config/searchOptions";

type SearchFiltersProps = {
    types: SearchType[];
    scope: SearchScope;
    location: SearchLocation;
    onTypesChange: (types: SearchType[]) => void;
    onScopeChange: (scope: SearchScope) => void;
    onLocationChange: (location: SearchLocation) => void;
};

const SearchFilters = ({
    types,
    scope,
    location,
    onTypesChange,
    onScopeChange,
    onLocationChange,
}: SearchFiltersProps) => {
    return (
        <InlineStack
            padding="0 10px"
            gap={10}
            style={{ marginTop: 3 }}
            className="pn-search-box__filter"
        >
            <SelectBox
                size="extrasmall"
                multiple
                style={{ minWidth: "170px" }}
                options={TYPE_OPTIONS}
                value={types}
                onChange={(value) => {
                    if (value.length === 0) {
                        onTypesChange(["all"]);
                        return;
                    }

                    const filteredValue = value.filter((key) => key !== "all");

                    onTypesChange(
                        filteredValue.length === 0
                            ? ["all"]
                            : (filteredValue as SearchType[]),
                    );
                }}
            />

            <SelectBox
                size="extrasmall"
                style={{ minWidth: "100px" }}
                options={LOCATION_OPTIONS}
                value={[location]}
                onChange={(value) =>
                    onLocationChange(value[0] as SearchLocation)
                }
            />

            <SelectBox
                size="extrasmall"
                style={{ minWidth: "140px" }}
                options={SCOPE_OPTIONS}
                value={[scope]}
                onChange={(value) => onScopeChange(value[0] as SearchScope)}
            />

            <Divider />
        </InlineStack>
    );
};

export default SearchFilters;
