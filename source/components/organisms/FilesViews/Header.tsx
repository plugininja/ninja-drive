import { __ } from "@wordpress/i18n";
import InlineStack from "~/components/molecules/InlineStack";
import { useFilesContext } from "./FilesViews";
import SelectBox from "~/components/molecules/SelectBox";
import Checkbox from "~/components/atoms/Checkbox";
import { OrderBy } from "~/types/Types";
import Button from "~/components/atoms/Button";
import Text from "~/components/atoms/Text";
import Card from "~/components/molecules/Card";

const Header = () => {
    const {
        isFileSelecting,
        layout,
        setLayout,
        selectedFiles,
        setIsFileSelecting,
        setSelectedFiles,
        files,
        sorting,
        setSorting,
    } = useFilesContext();
    const { order, orderBy } = sorting;

    const isAllSelected = selectedFiles.length === files.length;

    const handleBulkSelect = () => {
        setIsFileSelecting(!isFileSelecting);
        setSelectedFiles([]);
    };

    const handleAllSelect = () => {
        if (isAllSelected) {
            setSelectedFiles([]);
        } else {
            setSelectedFiles(files);
        }
    };

    return (
        <Card background="white" padding={12} marginTop={30} rounded="md">
            <InlineStack align="between" gap={6}>
                <InlineStack gap={6}>
                    <SelectBox
                        size="small"
                        prefix={
                            <Text size="sm" weight="medium">
                                {__("Sort by:", "ninja-drive")}
                            </Text>
                        }
                        options={SORT_BY}
                        value={[sorting.orderBy]}
                        onChange={(value) =>
                            setSorting({
                                ...sorting,
                                orderBy: value[0] as OrderBy,
                            })
                        }
                    />

                    <Button
                        variant="outlined"
                        size="small"
                        startIcon={
                            order === "ASC" ? "arrow_upward" : "arrow_downward"
                        }
                        onClick={() =>
                            setSorting({
                                ...sorting,
                                order: order === "ASC" ? "DESC" : "ASC",
                            })
                        }
                    >
                        {order === "ASC" ? __("Ascending", "ninja-drive") : __("Descending", "ninja-drive")}
                    </Button>
                </InlineStack>

                <InlineStack gap={14}>
                    {isFileSelecting && (
                        <InlineStack blockAlign="center" gap={6}>
                            <Checkbox
                                size="medium"
                                rounded="sm"
                                style={{
                                    marginLeft: "4px",
                                }}
                                checked={isAllSelected}
                                onChange={() => handleAllSelect()}
                            />

                            <Text as="span" size="xs" weight="medium">
                                {isAllSelected ? __("Deselect All", "ninja-drive") : __("Select All", "ninja-drive")}
                            </Text>
                        </InlineStack>
                    )}

                    <InlineStack blockAlign="center" gap={6}>
                        <Checkbox
                            size="medium"
                            rounded="sm"
                            style={{
                                marginLeft: "4px",
                            }}
                            checked={isFileSelecting}
                            onChange={() => handleBulkSelect()}
                        />
                        <Text as="span" size="xs" weight="medium">
                            {isFileSelecting
                                ? `${selectedFiles.length} ${__("selected", "ninja-drive")}`
                                : __("Bulk Select", "ninja-drive")}
                        </Text>
                    </InlineStack>

                    <Button
                        variant="outlined"
                        size="small"
                        startIcon={layout === "list" ? "grid_view" : "dehaze"}
                        onClick={() =>
                            setLayout(layout === "list" ? "grid" : "list")
                        }
                    >
                        {layout === "list" ? __("Grid View", "ninja-drive") : __("List View", "ninja-drive")}
                    </Button>
                </InlineStack>
            </InlineStack>
        </Card>
    );
};

export default Header;

export const SORT_BY = [
    { name: __("Name", "ninja-drive"), value: "name" },
    { name: __("Size", "ninja-drive"), value: "size" },
    { name: __("Created At", "ninja-drive"), value: "createdAt" },
    { name: __("Updated At", "ninja-drive"), value: "updatedAt" },
];
