import { MODULE_LISTS } from "~features/widget-builder/constants/widget";
import SettingsField from "~/shared/molecules/SettingsField";
import { useCustomAlert } from "~/shared/molecules/Alert";
import { trimString } from "~kernel/utils/helpers";
import { SkeletonLoader } from "~/ui/molecules";
import { useNavigate } from "react-router-dom";
import { useState } from "@wordpress/element";
import { InlineStack } from "~/ui/molecules";
import { IconButton } from "~/ui/molecules";
import { BlockStack } from "~/ui/molecules";
import { Dropdown } from "~/ui/molecules";
import { Card } from "~/ui/molecules";
import { __ } from "@wordpress/i18n";
import { Button } from "~/ui/atoms";
import { Input } from "~/ui/atoms";
import { Text } from "~/ui/atoms";
import { Icon } from "~/ui/atoms";
import {
    useGetModulesQuery,
    useUpdateModuleMutation,
} from "~features/widget-builder/api/widgetApi";
import {
    ModuleConfig,
    ModuleKey,
} from "~features/widget-builder/types/widget.types";

const RecentModules = ({ width }: { width: string }) => {
    const [editingId, setEditingId] = useState<string | null>(null);
    const [editedTitle, setEditedTitle] = useState<string>("");
    const [updateModule] = useUpdateModuleMutation();
    const { data, isLoading, isFetching } = useGetModulesQuery({
        type: "all",
        search: "",
        order: "DESC",
        order_by: "updated_at",
        page: 1,
        per_page: 5,
        status: "all",
    });

    const navigate = useNavigate();

    const { showAlert } = useCustomAlert();

    const getItemTypeInfo = (type: ModuleKey, icon?: boolean) => {
        const widget = MODULE_LISTS.filter((w) => w?.key === type);

        return icon ? widget[0]?.icon : widget[0]?.title;
    };

    const handleEditTitle = async (widget: ModuleConfig) => {
        if (!widget?.id) return;

        if (!trimString(editedTitle)) {
            showAlert({
                toast: true,
                type: "error",
                text: __("Title cannot be empty.", "ninja-drive"),
                timer: 3000,
                timerProgressBar: true,
                showConfirmButton: false,
            });
            return;
        }

        try {
            const response = await updateModule({
                id: widget?.id,
                data: { ...widget, title: editedTitle },
                type: "rename",
            }).unwrap();

            setEditingId(null);
            setEditedTitle("");

            showAlert({
                toast: true,
                type: "success",
                text:
                    response?.message ||
                    __("Module title updated successfully.", "ninja-drive"),
                timer: 3000,
                timerProgressBar: true,
                showConfirmButton: false,
            });
        } catch (error: any) {
            showAlert({
                toast: true,
                type: "error",
                text:
                    error?.data?.message ||
                    __("Failed to update module title.", "ninja-drive"),
                timer: 3000,
                timerProgressBar: true,
                showConfirmButton: false,
            });
        }
    };

    const HEADER = [
        __("ID:", "ninja-drive"),
        __("Type & Name:", "ninja-drive"),
        __("Shortcode:", "ninja-drive"),
        __("Actions:", "ninja-drive"),
    ];

    const flexValues = ["0.5", "4", "3", "1"];

    return (
        <SettingsField
            style={{
                width: width,
            }}
        >
            <InlineStack
                gap={10}
                align="between"
                wrap={false}
                style={{
                    minWidth: 0,
                }}
            >
                <Text
                    color="gray-700"
                    weight="medium"
                    wrap={false}
                    ellipsis
                    style={{ minWidth: 0 }}
                >
                    {__("Recent Modules", "ninja-drive")}
                </Text>

                <Button
                    variant="outlined"
                    endIcon="arrow_forward"
                    endIconColor="gray-700"
                    style={{
                        whiteSpace: "nowrap",
                        color: "var(--pnpnd-gray-700)",
                    }}
                    onClick={() => navigate("/widget-builder")}
                >
                    {__("Full Report", "ninja-drive")}
                </Button>
            </InlineStack>

            <BlockStack>
                <InlineStack
                    padding={20}
                    style={{
                        borderRadius: "8px 8px 0px 0px",
                        minWidth: 0,
                    }}
                    className="bg-primary-light"
                >
                    {HEADER.map((header, index) => (
                        <InlineStack
                            key={header}
                            gap={10}
                            align={header === "Actions:" ? "end" : "start"}
                            style={{
                                flex: flexValues[index],
                                minWidth: 0,
                            }}
                        >
                            <Text
                                color="gray-700"
                                weight="medium"
                                wrap={false}
                                ellipsis
                                style={{
                                    minWidth: 0,
                                }}
                            >
                                {header}
                            </Text>
                        </InlineStack>
                    ))}
                </InlineStack>

                {isLoading || isFetching ? (
                    <BlockStack gap={2} marginTop={2}>
                        {Array.from({ length: 5 }).map((_, index) => (
                            <SkeletonLoader
                                key={index}
                                width="100%"
                                height="60px"
                            />
                        ))}
                    </BlockStack>
                ) : (
                    data?.data?.widgets.map((widget, index) => {
                        const { id, type, title } = widget;

                        return (
                            <InlineStack
                                key={id ?? index}
                                gap={10}
                                style={{
                                    minWidth: 0,
                                }}
                                className="pnpnd-dashboard-item-index-border"
                            >
                                <Text
                                    color="gray-700"
                                    wrap={false}
                                    ellipsis
                                    style={{
                                        flex: 0.5,
                                        minWidth: 0,
                                    }}
                                >
                                    {id}
                                </Text>

                                <InlineStack
                                    gap={10}
                                    wrap={false}
                                    style={{
                                        flex: 4,
                                        minWidth: 0,
                                    }}
                                >
                                    <div
                                        style={{
                                            flexShrink: 0,
                                        }}
                                    >
                                        <Card
                                            padding={10}
                                            background="primary-extralight"
                                            flex
                                            align="center"
                                            blockAlign="center"
                                            style={{
                                                borderRadius: "10px",
                                                flexShrink: 0,
                                            }}
                                        >
                                            <Icon
                                                name={getItemTypeInfo(
                                                    type,
                                                    true,
                                                )}
                                                color="primary"
                                                fontSize="xl"
                                            />
                                        </Card>
                                    </div>

                                    {editingId === id ? (
                                        <InlineStack gap={10}>
                                            <Input
                                                size="small"
                                                fullWidth={false}
                                                value={editedTitle}
                                                style={{ maxWidth: "100%" }}
                                                onChange={(value) => {
                                                    setEditedTitle(
                                                        String(value),
                                                    );
                                                }}
                                                onKeyDown={(e) => {
                                                    if (e.key === "Enter") {
                                                        handleEditTitle(widget);
                                                    }
                                                }}
                                            />

                                            <IconButton
                                                size="small"
                                                name="edit"
                                                variant="primary"
                                                color="white"
                                                onClick={() =>
                                                    handleEditTitle(widget)
                                                }
                                            />
                                        </InlineStack>
                                    ) : (
                                        <Text
                                            color="gray-700"
                                            size="sm"
                                            wrap={false}
                                            ellipsis
                                            style={{
                                                minWidth: 0,
                                            }}
                                        >
                                            {title}
                                        </Text>
                                    )}
                                </InlineStack>

                                <InlineStack
                                    style={{
                                        flex: 3,
                                        minWidth: 0,
                                    }}
                                >
                                    <Button
                                        variant="outlined"
                                        startIcon="content_copy"
                                        startIconColor="gray-700"
                                        textTransform="lowercase"
                                        style={{
                                            minWidth: 0,
                                            color: "var(--pnpnd-gray-700)",
                                        }}
                                    >
                                        <Text
                                            color="gray-700"
                                            size="sm"
                                            wrap={false}
                                            ellipsis
                                        >
                                            [ninja-drive
                                        </Text>{" "}
                                        id="{id}"]
                                    </Button>
                                </InlineStack>

                                <InlineStack
                                    align="end"
                                    style={{
                                        flex: 1,
                                        minWidth: 0,
                                    }}
                                >
                                    <Dropdown>
                                        <Dropdown.Trigger>
                                            <Icon
                                                name="more_vert"
                                                color="primary"
                                                fontSize="2xl"
                                                fontWeight="medium"
                                            />
                                        </Dropdown.Trigger>

                                        <Dropdown.Content>
                                            <Dropdown.MenuItem
                                                onClick={() =>
                                                    navigate(
                                                        `/widget-builder/${id}/source/my-drive`,
                                                    )
                                                }
                                            >
                                                <Icon
                                                    name="edit_square"
                                                    color="gray-500"
                                                />
                                                {__("Edit", "ninja-drive")}
                                            </Dropdown.MenuItem>

                                            <Dropdown.MenuItem
                                                onClick={() => {
                                                    if (editingId === id) {
                                                        setEditingId(null);
                                                        setEditedTitle("");
                                                    } else {
                                                        setEditingId(id);
                                                        setEditedTitle(title);
                                                    }
                                                }}
                                            >
                                                <Icon
                                                    name="edit"
                                                    color="gray-500"
                                                />
                                                {__("Rename", "ninja-drive")}
                                            </Dropdown.MenuItem>

                                            <Dropdown.MenuItem
                                            // onClick={() => {
                                            //     const previewModal =
                                            //         window.toast.show({
                                            //             variant: "modal",
                                            //             theme: "light",
                                            //             width: "95vw",
                                            //             height: "90vh",
                                            //             className: `ccpidb-module-wrapper ccpidb-${type}`,
                                            //             component: (
                                            //                 <Provider
                                            //                     store={
                                            //                         store
                                            //                     }
                                            //                 >
                                            //                     <PreviewModal
                                            //                         previewId={
                                            //                             id
                                            //                         }
                                            //                         onClose={() =>
                                            //                             window.toast.close(
                                            //                                 previewModal,
                                            //                             )
                                            //                         }
                                            //                     />
                                            //                 </Provider>
                                            //             ),
                                            //         });
                                            // }}
                                            >
                                                <Icon
                                                    name="visibility"
                                                    color="gray-500"
                                                />
                                                {__("Preview", "ninja-drive")}
                                            </Dropdown.MenuItem>
                                        </Dropdown.Content>
                                    </Dropdown>
                                </InlineStack>
                            </InlineStack>
                        );
                    })
                )}
            </BlockStack>
        </SettingsField>
    );
};

export default RecentModules;
