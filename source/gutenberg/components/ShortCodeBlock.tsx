import { useGetModulesQuery } from "~/store/api/widgetApi";
import { useEffect, useState } from "@wordpress/element";
import { BlockContainerProps } from "./BlockContainer";
import SelectBox from "~/components/molecules/SelectBox";
import useDebounce from "~/hooks/useDebounce";
import { __ } from "@wordpress/i18n";

type OptionValue = {
    name?: string;
    value: string;
};

const ShortCodeBlock = ({
    attributes,
    setAttributes,
}: {
    attributes: BlockContainerProps["attributes"];
    setAttributes: BlockContainerProps["setAttributes"];
}) => {
    const [searchTerm, setSearchTerm] = useState("");
    const [debouncedSearchTerm, setDebouncedSearchTerm] = useState("");
    const [options, setOptions] = useState<OptionValue[]>([]);
    const [selectedOption, setSelectedOption] = useState<string | number>();

    useDebounce(
        () => {
            setDebouncedSearchTerm(searchTerm);
        },
        [searchTerm],
        500,
    );

    const { data, isFetching, isLoading } = useGetModulesQuery(
        {
            search: debouncedSearchTerm,
            type:
                attributes?.type === "widget"
                    ? "all"
                    : attributes?.type || "all",
        },
        {
            refetchOnMountOrArgChange: true,
            skip: !attributes?.type,
        },
    );

    useEffect(() => {
        if (data?.data?.widgets) {
            const newOptions: OptionValue[] = data.data.widgets.map(
                (widget) => ({
                    name: `${widget?.id}: ${widget?.title}`,
                    value: `${widget?.id}: ${widget?.title}`,
                }),
            );
            setOptions(newOptions);
        } else {
            setOptions([]);
        }
    }, [data]);

    const handleSearchChange = (newSearchTerm: string) => {
        setSearchTerm(newSearchTerm);
    };

    return (
        <SelectBox
            options={options}
            value={[String(selectedOption || __("Search for a widget...", "ninja-drive"))]}
            onChange={(selected) => {
                setSelectedOption(selected[0]);
                setAttributes({
                    id: selected[0].split(":")[0],
                    type: "widget",
                });
            }}
            placeholder={__("Search for a widget...", "ninja-drive")}
            loading={isFetching || isLoading}
            onSearch={handleSearchChange}
            searchable
        />
    );
};

export default ShortCodeBlock;
