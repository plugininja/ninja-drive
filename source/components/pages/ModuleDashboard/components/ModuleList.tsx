import ModuleContextMenu, { MODULE_ACTIONS } from "./ModuleContextMenu";
import { MODULE_LIST_HEADERS, MODULE_LISTS } from "~/constants/widget";
import { useContextMenu } from "~/components/molecules/ContextMenu";
import { ModuleConfig, ModuleKey } from "~/types/widget.types";
import { useModulePreview } from "~/components/organisms/modals/ModulePreview";
import { useCustomAlert } from "~/components/molecules/Alert";
import InlineStack from "~/components/molecules/InlineStack";
import BlockStack from "~/components/molecules/BlockStack";
import IconButton from "~/components/molecules/IconButton";
import ModuleLocations from "./ModuleLocations";
import IntegrationIcon from "./IntegrationIcon";
import { useNavigate } from "react-router-dom";
import { useState } from "@wordpress/element";
import Checkbox from "~/components/atoms/Checkbox";
import Dropdown from "~/components/molecules/Dropdown";
import Switcher from "~/components/atoms/Switcher";
import Divider from "~/components/atoms/Divider";
import Tooltip from "~/components/atoms/Tooltip";
import Status from "~/components/atoms/Status";
import Button from "~/components/atoms/Button";
import Input from "~/components/atoms/Input";
import { __ } from "@wordpress/i18n";
import Text from "~/components/atoms/Text";
import Card from "~/components/molecules/Card";
import Icon from "~/components/atoms/Icon";
import {
    useDeleteModuleMutation,
    useDuplicateModuleMutation,
    useUpdateModuleMutation,
} from "~/store/api/widgetApi";

const ModuleList = ({
    widgets,
    selectedModules,
    setSelectedModules,
    isPro = false,
}: {
    widgets: ModuleConfig[];
    selectedModules: ModuleConfig[];
    setSelectedModules: React.Dispatch<React.SetStateAction<ModuleConfig[]>>;
    isPro?: boolean;
}) => {
    const [editingId, setEditingId] = useState<string | null>(null);
    const [editedTitle, setEditedTitle] = useState<string>("");
    const flexValues = [0.3, 0.4, 2, 1.2, 0.6, 1.7, 0.6, 1];
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
                    result?.message ||
                    action === "rename"
                        ? __("Shortcode renamed successfully", "ninja-drive")
                        : __("Shortcode updated successfully", "ninja-drive"),
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
                    action === "rename"
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
                    ? __("Are you sure you want to duplicate these widgets?", "ninja-drive")
                    : __("Are you sure you want to duplicate this widget?", "ninja-drive"),
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
                            __("Shortcode duplicated successfully", "ninja-drive"),
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
                    ? __("Are you sure you want to delete these widgets?", "ninja-drive")
                    : __("Are you sure you want to delete this widget?", "ninja-drive"),
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
                            result?.message || __("Shortcode deleted successfully", "ninja-drive"),
                        timer: 3000,
                        timerProgressBar: true,
                        showConfirmButton: false,
                    });
                } catch (error: any) {
                    showAlert({
                        toast: true,
                        type: "error",
                        text: error?.data?.message ||                             __("Failed to delete widget", "ninja-drive"),
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

                <Text
                    size="sm"
                    weight="semibold"
                    style={{
                        width: "80px",
                    }}
                >
                    {__("Action:", "ninja-drive")}
                </Text>
            </InlineStack>

            {widgets.map((widget, index) => {
                const {
                    id,
                    type,
                    title,
                    status,
                    integration,
                    createdAt,
                    locations,
                } = widget as ModuleConfig;

                const isChecked = selectedModules.some(
                    (item) => item.id === id,
                );
                const isEditing = editingId === id;

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
                        <Checkbox
                            rounded="sm"
                            style={{ flex: 0.3 }}
                            checked={isChecked}
                            onChange={() => handleSelect(widget)}
                        />

                        <Text
                            size="sm"
                            weight="semibold"
                            wrap={false}
                            ellipsis
                            style={{
                                flex: 0.4,
                                minWidth: 0,
                            }}
                        >
                            {id}
                        </Text>

                        <InlineStack
                            gap={10}
                            wrap={false}
                            style={{ flex: 2, minWidth: 0 }}
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
                                name={isEditing ? "check" : "edit_square"}
                                color="primary"
                                fontSize={isEditing ? "2xl" : "lg"}
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
                            style={{ flex: 1.2, minWidth: 0 }}
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
                            style={{ flex: 0.6, minWidth: 0 }}
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

                        <InlineStack style={{ flex: 1.7, minWidth: 0 }}>
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
                                    <Text size="sm" style={{ flexShrink: 0 }}>
                                        [
                                    </Text>

                                    <Text
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

                        <InlineStack style={{ flex: 0.6, minWidth: 0 }}>
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
                                    background="primary-extralight"
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
                                        color="primary"
                                        size="sm"
                                        weight="medium"
                                    >
                                        {locations?.length || 0}
                                    </Text>
                                </Card>
                            </Tooltip>
                        </InlineStack>

                        <Text
                            size="sm"
                            wrap={false}
                            ellipsis
                            style={{
                                flex: 1,
                                minWidth: 0,
                            }}
                        >
                            {createdAt}
                        </Text>

                        <InlineStack
                            gap={10}
                            wrap={false}
                            style={{ width: "80px" }}
                        >
                            <Button
                                variant="primary"
                                size="extrasmall"
                                startIcon="edit"
                                iconSize="xs"
                                style={{ flexShrink: 0 }}
                                onClick={() =>
                                    navigate(
                                        `/widget-builder/${id}/source/my-drive`,
                                    )
                                }
                            >
                                {__("Edit", "ninja-drive")}
                            </Button>

                            <Dropdown>
                                <Dropdown.Trigger>
                                    <Icon
                                        name="more_vert"
                                        color="primary"
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
                                                    <Status
                                                        size="extrasmall"
                                                        placement="right-center"
                                                        right={5}
                                                    >
                                                        <Dropdown.MenuItem
                                                            onClick={() => {
                                                                handleAction(
                                                                    key,
                                                                    id,
                                                                    title,
                                                                );
                                                            }}
                                                            style={{
                                                                padding:
                                                                    "8px 13px",
                                                                borderRadius:
                                                                    first
                                                                        ? "8px 8px 0 0"
                                                                        : last
                                                                        ? "0 0 8px 8px"
                                                                        : 0,
                                                            }}
                                                            className={
                                                                last
                                                                    ? "hover-errorprimary-extralight"
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
                                                    </Status>

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

            <ModuleContextMenu onMenuClick={handleAction} isPro={isPro} />
        </BlockStack>
    );
};

export default ModuleList;
