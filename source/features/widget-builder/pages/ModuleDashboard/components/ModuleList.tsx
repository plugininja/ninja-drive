import { useModulePreview } from "~features/widget-builder/components/modals/ModulePreview";
import ModuleContextMenu, { MODULE_ACTIONS } from "./ModuleContextMenu";
import { useCustomAlert } from "~/shared/molecules/Alert";
import IntegrationIcon from "./IntegrationIcon";
import { useContextMenu } from "~/ui/molecules";
import ModuleLocations from "./ModuleLocations";
import { useNavigate } from "react-router-dom";
import { Status, Switcher } from "~/ui/atoms";
import { useState } from "@wordpress/element";
import { InlineStack } from "~/ui/molecules";
import { BlockStack } from "~/ui/molecules";
import { IconButton } from "~/ui/molecules";
import { toBoolean } from "~/kernel/utils";
import { Dropdown } from "~/ui/molecules";
import { Card } from "~/ui/molecules";
import { Checkbox } from "~/ui/atoms";
import { __ } from "@wordpress/i18n";
import { Tooltip } from "~/ui/atoms";
import { Divider } from "~/ui/atoms";
import { Button } from "~/ui/atoms";
import { Input } from "~/ui/atoms";
import { Text } from "~/ui/atoms";
import { Icon } from "~/ui/atoms";
import {
    useDeleteModuleMutation,
    useDuplicateModuleMutation,
    useUpdateModuleMutation,
} from "~features/widget-builder/api/widgetApi";
import {
    MODULE_LIST_HEADERS,
    MODULE_LISTS,
} from "~features/widget-builder/constants/widget";
import {
    ModuleConfig,
    ModuleKey,
} from "~features/widget-builder/types/widget.types";

const ModuleList = ({
    widgets,
    selectedModules,
    setSelectedModules,
}: {
    widgets: ModuleConfig[];
    selectedModules: ModuleConfig[];
    setSelectedModules: React.Dispatch<React.SetStateAction<ModuleConfig[]>>;
}) => {
    const [editingId, setEditingId] = useState<string | null>(null);
    const [editedTitle, setEditedTitle] = useState<string>("");
    const flexValues = [0.3, 0.4, 2, 1.5, 0.7, 1.8, 0.6, 1.2, 0.6];
    const [updateModule] = useUpdateModuleMutation();
    const [duplicateModule] = useDuplicateModuleMutation();
    const [deleteModule] = useDeleteModuleMutation();

    const { show } = useContextMenu();
    const { showAlert } = useCustomAlert();
    const { openPreview } = useModulePreview();

    const navigate = useNavigate();

    const handleSelect = (widget: ModuleConfig) => {
        const isSelected = selectedModules.some(
            (item) => item.id === widget.id,
        );

        if (isSelected) {
            setSelectedModules((prev) =>
                prev.filter((item) => item.id !== widget.id),
            );
        } else {
            setSelectedModules((prev) => [...prev, widget]);
        }
    };

    const allSelected =
        widgets.length > 0 && selectedModules.length === widgets.length;

    const getItemTypeInfo = (type: ModuleKey, icon?: boolean) => {
        const widget = MODULE_LISTS.filter((widget) => widget?.key === type);

        return icon ? widget[0]?.icon : widget[0]?.title;
    };

    const handleCopy = (id: string) => {
        navigator.clipboard.writeText(`[ninja-drive id="${id}"]`);

        showAlert({
            toast: true,
            type: "success",
            text: __("Shortcode id copied to clipboard", "ninja-drive"),
            timer: 3000,
            timerProgressBar: true,
            showConfirmButton: false,
        });
    };

    const handleUpdate = async (
        widget: ModuleConfig,
        action: "rename" | "status",
    ) => {
        try {
            const result = await updateModule({
                id: widget.id,
                data:
                    action === "rename"
                        ? { ...widget, title: editedTitle }
                        : widget,
                type: action === "rename" ? "rename" : "status",
            }).unwrap();

            showAlert({
                toast: true,
                type: "success",
                text:
                    result?.message || action === "status"
                        ? __("Shortcode updated successfully", "ninja-drive")
                        : __("Shortcode renamed successfully", "ninja-drive"),
                timer: 3000,
                timerProgressBar: true,
                showConfirmButton: false,
            });
        } catch (error: any) {
            showAlert({
                toast: true,
                type: "error",
                text:
                    error?.data?.message || action === "rename"
                        ? __("Failed to rename widget", "ninja-drive")
                        : __("Failed to update widget", "ninja-drive"),
                timer: 3000,
                timerProgressBar: true,
                showConfirmButton: false,
            });
        }
    };

    const handleDuplicate = (id: string) => {
        const selectedIds = selectedModules?.map((item) => item.id);

        const allIds = [...new Set([id, ...(selectedIds || [])])];

        showAlert({
            type: "question",
            title: __("Duplicate", "ninja-drive"),
            text:
                allIds.length > 1
                    ? __(
                          "Are you sure you want to duplicate these widgets?",
                          "ninja-drive",
                      )
                    : __(
                          "Are you sure you want to duplicate this widget?",
                          "ninja-drive",
                      ),
            showCancelButton: true,
            confirmButtonText: __("Duplicate", "ninja-drive"),
            onConfirm: async () => {
                try {
                    const result = await duplicateModule({
                        id: allIds,
                    }).unwrap();

                    showAlert({
                        toast: true,
                        type: "success",
                        text:
                            result?.message ||
                            __(
                                "Shortcode duplicated successfully",
                                "ninja-drive",
                            ),
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
                            __("Failed to duplicate widget", "ninja-drive"),
                        timer: 3000,
                        timerProgressBar: true,
                        showConfirmButton: false,
                    });
                }
            },
        });
    };

    const handleDelete = (id: string) => {
        const selectedIds = selectedModules?.map((item) => item.id);

        const allIds = [...new Set([id, ...(selectedIds || [])])];

        showAlert({
            type: "error",
            title: __("Delete", "ninja-drive"),
            text:
                allIds.length > 1
                    ? __(
                          "Are you sure you want to delete these widgets?",
                          "ninja-drive",
                      )
                    : __(
                          "Are you sure you want to delete this widget?",
                          "ninja-drive",
                      ),
            showCancelButton: true,
            confirmButtonText: __("Delete", "ninja-drive"),
            onConfirm: async () => {
                try {
                    const result = await deleteModule({
                        id: allIds,
                    }).unwrap();

                    showAlert({
                        toast: true,
                        type: "success",
                        text:
                            result?.message ||
                            __("Shortcode deleted successfully", "ninja-drive"),
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
                            __("Failed to delete widget", "ninja-drive"),
                        timer: 3000,
                        timerProgressBar: true,
                        showConfirmButton: false,
                    });
                }
            },
        });
    };

    const handleAction = (key: string, id: string, title?: string) => {
        switch (key) {
            case "edit":
                navigate(`/widget-builder/${id}/source/my-drive`);
                break;
            case "rename":
                setEditingId(id);
                setEditedTitle(title || "");
                break;
            case "preview":
                openPreview({
                    data: widgets.find(
                        (item) => item.id === id,
                    ) as ModuleConfig,
                });
                break;
            case "duplicate":
                handleDuplicate(id);
                break;
            case "delete":
                handleDelete(id);
                break;
            default:
                break;
        }
    };

    return (
        <BlockStack marginTop={15} className="pnpnd-widget-list">
            <InlineStack className="pnpnd-widget-list__header">
                {MODULE_LIST_HEADERS.map(({ key, title }, index) => (
                    <InlineStack
                        key={index}
                        gap={5}
                        align={key === "action" ? "end" : "start"}
                        style={{ flex: flexValues[index], minWidth: 0 }}
                    >
                        {key === "checkbox" ? (
                            <Checkbox
                                rounded="sm"
                                checked={allSelected}
                                onChange={() =>
                                    setSelectedModules(
                                        allSelected ? [] : widgets,
                                    )
                                }
                            />
                        ) : (
                            <Text
                                color="gray-900"
                                size="sm"
                                weight="semibold"
                                wrap={false}
                                ellipsis
                            >
                                {title}
                            </Text>
                        )}
                    </InlineStack>
                ))}
            </InlineStack>

            {widgets?.map((widget, index) => {
                const {
                    id,
                    type,
                    title,
                    status,
                    integration,
                    created_at,
                    locations,
                } = widget as ModuleConfig;

                const isChecked = selectedModules.some(
                    (item) => item.id === id,
                );
                const is_editing = editingId === id;

                return (
                    <InlineStack
                        key={index}
                        gap={5}
                        className="pnpnd-widget-list__row"
                        onContextMenu={(e) => {
                            e.preventDefault();
                            show(
                                "widget-menu",
                                e as React.MouseEvent<HTMLElement>,
                                {
                                    id: id,
                                    title: title,
                                },
                            );
                        }}
                    >
                        <InlineStack style={{ flex: flexValues[0] }}>
                            <Checkbox
                                rounded="sm"
                                checked={isChecked}
                                onChange={() => handleSelect(widget)}
                            />
                        </InlineStack>

                        <Text
                            color="gray-700"
                            size="sm"
                            weight="semibold"
                            wrap={false}
                            ellipsis
                            style={{
                                flex: flexValues[1],
                                minWidth: 0,
                            }}
                        >
                            {id}
                        </Text>

                        <InlineStack
                            gap={10}
                            wrap={false}
                            style={{ flex: flexValues[2], minWidth: 0 }}
                        >
                            {editingId === id ? (
                                <Input
                                    size="small"
                                    style={{
                                        maxWidth: "250px",
                                    }}
                                    autoFocus
                                    value={editedTitle}
                                    onChange={(value) =>
                                        setEditedTitle(String(value))
                                    }
                                    onKeyDown={(e) => {
                                        if (e.key === "Enter") {
                                            handleUpdate(widget, "rename");
                                            setEditingId(null);
                                        } else if (e.key === "Escape") {
                                            setEditingId(null);
                                        }
                                    }}
                                />
                            ) : (
                                <Text
                                    color="gray-700"
                                    size="sm"
                                    weight="medium"
                                    wrap={false}
                                    ellipsis
                                    style={{
                                        minWidth: 0,
                                    }}
                                >
                                    {widget.title}
                                </Text>
                            )}

                            <IconButton
                                size="small"
                                name={is_editing ? "check" : "border_color"}
                                color="primary"
                                fontSize={is_editing ? "2xl" : "lg"}
                                onClick={() => {
                                    if (editingId === id) {
                                        handleUpdate(widget, "rename");
                                        setEditingId(null);
                                    } else {
                                        setEditingId(id);
                                        setEditedTitle(title);
                                    }
                                }}
                            />
                        </InlineStack>

                        <InlineStack
                            gap={10}
                            wrap={false}
                            style={{ flex: flexValues[3], minWidth: 0 }}
                        >
                            <div
                                style={{
                                    position: "relative",
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
                                    }}
                                >
                                    <Icon
                                        name={getItemTypeInfo(type, true)}
                                        color="primary"
                                        fontSize="xl"
                                    />
                                </Card>

                                {integration && (
                                    <IntegrationIcon id={integration as any} />
                                )}
                            </div>

                            <Text
                                color="gray-700"
                                size="sm"
                                wrap={false}
                                ellipsis
                                style={{
                                    minWidth: 0,
                                }}
                            >
                                {getItemTypeInfo(type)}
                            </Text>
                        </InlineStack>

                        <Switcher
                            style={{ flex: flexValues[4], minWidth: 0 }}
                            checked={status === "active"}
                            onChange={(checked) =>
                                handleUpdate(
                                    {
                                        ...widget,
                                        status: checked ? "active" : "inactive",
                                    },
                                    "status",
                                )
                            }
                        />

                        <InlineStack
                            style={{ flex: flexValues[5], minWidth: 0 }}
                        >
                            <Button
                                variant="outlined"
                                size="small"
                                startIcon="content_copy"
                                style={{
                                    minWidth: 0,
                                }}
                                onClick={() => handleCopy(id)}
                            >
                                <InlineStack
                                    gap={4}
                                    wrap={false}
                                    style={{
                                        minWidth: 0,
                                    }}
                                >
                                    <Text
                                        color="gray-700"
                                        size="sm"
                                        style={{ flexShrink: 0 }}
                                    >
                                        [
                                    </Text>

                                    <Text
                                        color="gray-700"
                                        size="sm"
                                        wrap={false}
                                        ellipsis
                                        textTransform="lowercase"
                                        style={{
                                            minWidth: 0,
                                        }}
                                    >
                                        ninja-drive
                                    </Text>

                                    <Text
                                        color="gray-700"
                                        size="sm"
                                        style={{ flexShrink: 0 }}
                                        textTransform="lowercase"
                                    >
                                        {" "}
                                        id="{id}"]
                                    </Text>
                                </InlineStack>
                            </Button>
                        </InlineStack>

                        <InlineStack
                            style={{ flex: flexValues[6], minWidth: 0 }}
                        >
                            <Tooltip
                                component={
                                    <ModuleLocations locations={locations} />
                                }
                                placement="top"
                                arrow
                                arrowSize={10}
                                background="white"
                                border="secondary"
                                shadow
                            >
                                <Card
                                    padding={9}
                                    background="gray-50"
                                    border="gray-200"
                                    flex
                                    align="center"
                                    blockAlign="center"
                                    style={{
                                        minWidth: "42px",
                                        height: "42px",
                                        borderRadius: "10px",
                                        cursor: "pointer",
                                    }}
                                >
                                    <Text
                                        color="gray-700"
                                        size="sm"
                                        weight="medium"
                                    >
                                        {locations?.length || 0}
                                    </Text>
                                </Card>
                            </Tooltip>
                        </InlineStack>

                        <Text
                            color="gray-700"
                            size="sm"
                            wrap={false}
                            ellipsis
                            style={{
                                flex: flexValues[7],
                                minWidth: 0,
                            }}
                        >
                            {created_at}
                        </Text>

                        <InlineStack
                            gap={10}
                            wrap={false}
                            align="end"
                            style={{ flex: flexValues[8] }}
                        >
                            <Button
                                variant="primary"
                                size="extrasmall"
                                startIcon="edit"
                                iconSize="xs"
                                style={{ flexShrink: 0 }}
                                onClick={() => {

                                    navigate(
                                        `/widget-builder/${id}/source/my-drive`,
                                    );
                                }}
                            >
                                {__("Edit", "ninja-drive")}
                            </Button>

                            <Dropdown>
                                <Dropdown.Trigger>
                                    <Icon
                                        name="more_vert"
                                        color="gray-700"
                                        fontSize="2xl"
                                        fontWeight="medium"
                                        style={{
                                            cursor: "pointer",
                                            userSelect: "none",
                                        }}
                                    />
                                </Dropdown.Trigger>

                                <Dropdown.Content
                                    style={{
                                        padding: 0,
                                    }}
                                >
                                    {MODULE_ACTIONS.map(
                                        (
                                            { key, title: actionTitle, icon },
                                            index,
                                        ) => {
                                            const first = index === 0;
                                            const last =
                                                index ===
                                                MODULE_ACTIONS.length - 1;

                                            return (
                                                <BlockStack key={key ?? index}>
                                                    <Dropdown.MenuItem
                                                        onClick={() => {
                                                            handleAction(
                                                                key,
                                                                id,
                                                                title,
                                                            );
                                                        }}
                                                        style={{
                                                            padding: "8px 13px",
                                                            borderRadius: first
                                                                ? "8px 8px 0 0"
                                                                : last
                                                                ? "0 0 8px 8px"
                                                                : 0,
                                                        }}
                                                        className={
                                                            last
                                                                ? "hover-error-50"
                                                                : "hover-secondary"
                                                        }
                                                    >
                                                        <Icon
                                                            name={icon}
                                                            color={
                                                                last
                                                                    ? "error"
                                                                    : "black"
                                                            }
                                                        />

                                                        <Text
                                                            color={
                                                                last
                                                                    ? "error"
                                                                    : "black"
                                                            }
                                                            size="sm"
                                                        >
                                                            {actionTitle}
                                                        </Text>

                                                    </Dropdown.MenuItem>

                                                    {!last && <Divider />}
                                                </BlockStack>
                                            );
                                        },
                                    )}
                                </Dropdown.Content>
                            </Dropdown>
                        </InlineStack>
                    </InlineStack>
                );
            })}

            <ModuleContextMenu onMenuClick={handleAction} />
        </BlockStack>
    );
};

export default ModuleList;
