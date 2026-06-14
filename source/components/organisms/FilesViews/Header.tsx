import InlineStack from "~/components/molecules/InlineStack";
import SelectBox from "~/components/molecules/SelectBox";
import Checkbox from "~/components/atoms/Checkbox";
import { BackgroundColor } from "~/types/styles";
import { useFilesContext } from "./FilesViews";
import Button from "~/components/atoms/Button";
import Card from "~/components/molecules/Card";
import Text from "~/components/atoms/Text";
import { OrderBy } from "~/types/Types";
import { __ } from "@wordpress/i18n";

const Header = ({
    background = "white",
    marginTop = 30,
}: {
    background?: BackgroundColor;
    marginTop?: number;
}) => {
    const {
        isFileSelecting,
        layout,
        setLayout,
        selected_files,
        setIsFileSelecting,
        setSelectedFiles,
        files,
        sorting,
        setSorting,
    } = useFilesContext();
    const { order, order_by } = sorting;

    const isAllSelected = selected_files.length === files.length;

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
        <Card
            background={background}
            padding={12}
            marginTop={marginTop}
            rounded="md"
        >
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
                        value={[sorting.order_by]}
                        onChange={(value) =>
                            setSorting({
                                ...sorting,
                                order_by: value[0] as OrderBy,
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
                        {order === "ASC"
                            ? __("Ascending", "ninja-drive")
                            : __("Descending", "ninja-drive")}
                    </Button>
                </InlineStack>

                <InlineStack gap={14}>
                    {isFileSelecting && (
                        <InlineStack blockAlign="center" gap={10}>
                            <Checkbox
                                size="medium"
                                rounded="sm"
                                style={{
                                    marginLeft: "4px",
                                }}
                                checked={isAllSelected}
                                onChange={() => handleAllSelect()}
                            />

                            <Text
                                color="gray-800"
                                size="sm"
                                onClick={() => handleAllSelect()}
                                style={{ cursor: "pointer" }}
                            >
                                {isAllSelected
                                    ? __("Deselect All", "ninja-drive")
                                    : __("Select All", "ninja-drive")}
                            </Text>
                        </InlineStack>
                    )}

                    <InlineStack blockAlign="center" gap={10}>
                        <Checkbox
                            size="medium"
                            rounded="sm"
                            style={{
                                marginLeft: "4px",
                            }}
                            checked={isFileSelecting}
                            onChange={() => handleBulkSelect()}
                        />

                        <Text
                            color="gray-800"
                            size="sm"
                            onClick={() => handleBulkSelect()}
                            style={{ cursor: "pointer" }}
                        >
                            {isFileSelecting
                                ? `${selected_files.length} ${__(
                                      "selected",
                                      "ninja-drive",
                                  )}`
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
                        {layout === "list"
                            ? __("Grid View", "ninja-drive")
                            : __("List View", "ninja-drive")}
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
    { name: __("Created At", "ninja-drive"), value: "created_at" },
    { name: __("Updated At", "ninja-drive"), value: "updated_at" },
];
