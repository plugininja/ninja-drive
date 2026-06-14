import InlineStack from "~/components/molecules/InlineStack";
import BlockStack from "~/components/molecules/BlockStack";
import IconButton from "~/components/molecules/IconButton";
import { useLocalStorage } from "~/hooks/useLocalStorage";
import LogoIcon from "~/components/atoms/Logo/LogoIcon";
import Dropdown from "~/components/molecules/Dropdown";
import { STORAGE_KEYS } from "~/constants/storageKeys";
import Tooltip from "~/components/atoms/Tooltip";
import Card from "~/components/molecules/Card";
import { formatFileSize } from "~/utils/file";
import { toBoolean } from "~/utils/functions";
import Logo from "~/components/atoms/Logo";
import Icon from "~/components/atoms/Icon";
import Text from "~/components/atoms/Text";
import { __ } from "@wordpress/i18n";
import DOCS from "~/utils/docs";
import clsx from "clsx";
import {
    createContext,
    useCallback,
    useContext,
    useState,
} from "@wordpress/element";
import {
    SidebarBottomProps,
    SidebarContextType,
    SidebarDropdownItemProps,
    SidebarItemProps,
    SidebarMenuProps,
    SidebarProps,
} from "./Sidebar.type";

const SidebarContext = createContext<SidebarContextType | undefined>(undefined);

const useSidebar = () => {
    const context = useContext(SidebarContext);

    if (!context) throw new Error("Sidebar context missing");

    return context;
};

const SIDEBAR_MIN_WIDTH = 255;
const SIDEBAR_MAX_WIDTH = 1000;

const Sidebar = ({
    id,
    style,
    className,
    border = true,
    children,
    defaultCollapsed = false,
    localStorageKey = STORAGE_KEYS.fileBrowserSidebar,
}: SidebarProps) => {
    const [collapsed, setCollapsed] = useLocalStorage<boolean>(
        localStorageKey,
        defaultCollapsed,
    );
    const [width, setWidth] = useState<number>(SIDEBAR_MIN_WIDTH);
    const [isResizing, setIsResizing] = useState(false);

    const toggle = () => {
        const newState = !collapsed;
        setCollapsed(newState);
    };

    const startResize = useCallback(
        (e: React.MouseEvent<HTMLDivElement>) => {
            e.preventDefault();
            setIsResizing(true);

            const startX = e.clientX;
            const startWidth = width;

            const onMouseMove = (event: MouseEvent) => {
                let newWidth = startWidth + (event.clientX - startX);
                if (newWidth < SIDEBAR_MIN_WIDTH) newWidth = SIDEBAR_MIN_WIDTH;
                if (newWidth > SIDEBAR_MAX_WIDTH) newWidth = SIDEBAR_MAX_WIDTH;
                setWidth(newWidth);
            };

            const onMouseUp = () => {
                setIsResizing(false);

                document.removeEventListener("mousemove", onMouseMove);
                document.removeEventListener("mouseup", onMouseUp);
            };

            document.addEventListener("mousemove", onMouseMove);
            document.addEventListener("mouseup", onMouseUp);
        },
        [width],
    );

    return (
        <SidebarContext.Provider value={{ collapsed }}>
            <BlockStack
                id={id}
                style={{
                    ...style,
                    width: collapsed ? 92 : width,
                    flexShrink: 0,
                    transition:
                        collapsed || !isResizing ? "width 0.25s ease" : "none",
                }}
                className={clsx(
                    "pn-sidebar",
                    border && "pn-sidebar--border",
                    collapsed && "pn-sidebar--collapsed",
                    className,
                )}
            >
                <InlineStack
                    align={collapsed ? "center" : "end"}
                    blockAlign="start"
                    gap={5}
                    className="pn-sidebar__header"
                >
                    <a href={"https://plugininja.com/"} target="_blank">
                        {collapsed ? (
                            <LogoIcon className="pnpnd-logo-icon" />
                        ) : (
                            <Logo />
                        )}
                    </a>

                    <Card
                        padding="4px 8px"
                        rounded="sm"
                        border="primary-extralight"
                        style={{
                            width: "fit-content",
                            height: "fit-content",
                            opacity: collapsed ? 0 : 1,
                            transition: "opacity 0.25s ease",
                        }}
                    >
                        <Text color="primary" size="sm" weight="medium">
                            {pnpnd.version}
                        </Text>
                    </Card>
                </InlineStack>

                <IconButton
                    variant={collapsed ? "primary" : "white"}
                    name="keyboard_tab_rtl"
                    size="small"
                    color={collapsed ? "white" : "primary"}
                    fontSize="lg"
                    rounded="md"
                    border
                    borderColor="gray-200"
                    className="pn-sidebar--toggle"
                    onClick={toggle}
                />

                {children}

                {!collapsed &&
                    localStorageKey === STORAGE_KEYS.fileBrowserSidebar && (
                        <div
                            className="pn-sidebar__resizer"
                            onMouseDown={startResize}
                        />
                    )}
            </BlockStack>
        </SidebarContext.Provider>
    );
};

Sidebar.Menu = ({ children }: SidebarMenuProps) => (
    <BlockStack gap={10} className="pn-sidebar__menu">
        {children}
    </BlockStack>
);

Sidebar.Item = ({
    title,
    icon,
    iconUrl,
    iconSize,
    active = false,
    background = "white",
    border = "white",
    borderStyle = "none",
    size = "large",
    rounded = "lg",
    iconButtonVariant = "secondary",
    iconRounded = "md",
    iconBorderStyle = "solid",
    iconBorderColor = "secondary",
    statusProps,
    isDropdown = false,
    onClick,
}: SidebarItemProps) => {
    const { collapsed } = useSidebar();

    return (
        <Tooltip
            title={title as string}
            placement="right"
            wrap="no-wrap"
            arrow
            className="w-full"
            disabled={!collapsed}
        >
            <Card
                padding={!collapsed ? "6px 12px 6px 6px" : "6px"}
                background={active ? "primary-extralight" : background}
                rounded={rounded}
                border={border}
                borderStyle={borderStyle}
                className={clsx(
                    "pn-sidebar__menu-item",
                    size === "small" && collapsed && "w-fit",
                    isDropdown && !active && "hover-light",
                )}
                statusProps={statusProps}
                onClick={onClick}
            >
                <InlineStack
                    gap={collapsed ? 0 : 10}
                    wrap={false}
                    align={collapsed ? "center" : "start"}
                >
                    <IconButton
                        variant={active ? "white" : iconButtonVariant}
                        size={size === "large" ? "small" : "extrasmall"}
                        rounded={iconRounded}
                        name={icon}
                        iconUrl={iconUrl}
                        fontSize={iconSize}
                        color="primary"
                        borderStyle={iconBorderStyle}
                        borderColor={iconBorderColor}
                        style={{
                            flexShrink: 0,
                        }}
                    />

                    {!collapsed && (
                        <Text
                            color={"black"}
                            size="md"
                            weight="medium"
                            wrap={false}
                            className="pn-sidebar__menu-item-title"
                        >
                            {title}
                        </Text>
                    )}
                </InlineStack>
            </Card>
        </Tooltip>
    );
};

Sidebar.DropdownItem = ({
    childrenItems,
    activeKey,
    disabled = false,
}: SidebarDropdownItemProps) => {
    const { collapsed } = useSidebar();
    const activeChildren = childrenItems?.filter(
        (item) => item.key === activeKey,
    );

    const accessEnabled =
        pnpnd?.current_user?.can?.has_full_access && toBoolean(pnpnd.is_pro);

    return (
        <Dropdown outSideClick={false}>
            <Dropdown.Trigger
                openStatus={
                    disabled ? false : accessEnabled ? collapsed : false
                }
                disabled={!accessEnabled}
            >
                <Sidebar.Item
                    active
                    title={activeChildren?.[0]?.title || "Menu"}
                    icon={activeChildren?.[0]?.icon}
                    iconUrl={activeChildren?.[0]?.iconUrl}
                    iconUrl={activeChildren?.[0]?.iconUrl}
                    iconSize={activeChildren?.[0]?.iconSize}
                    iconBorderStyle="solid"
                    statusProps={activeChildren?.[0]?.statusProps}
                    isDropdown
                    border="primary-extralight"
                    borderStyle="solid"
                    rounded="md"
                    iconRounded="sm"
                />

                {accessEnabled && !collapsed && (
                    <Dropdown.TriggerArrow
                        style={{
                            position: "absolute",
                            top: "50%",
                            right: "10px",
                            transform: "translateY(-50%)",
                        }}
                        arrowColor="primary"
                        arrowSize="2xl"
                    />
                )}
            </Dropdown.Trigger>

            <Dropdown.Content
                rounded="md"
                border
                shadow={true}
                position={{
                    top: "110%",
                    left: collapsed ? "-10%" : "0",
                }}
                style={{
                    width: collapsed ? "50px" : "100%",
                    minWidth: "fit-content",
                    padding: collapsed ? "5px" : "10px",
                    borderRadius: "10px",
                    display: "flex",
                    flexDirection: "column",
                    gap: "10px",
                }}
            >
                {childrenItems?.map((item) => (
                    <Sidebar.Item
                        key={item.key}
                        active={item.key === activeKey}
                        borderStyle="solid"
                        size="large"
                        rounded="md"
                        iconButtonVariant="white"
                        iconRounded="sm"
                        iconBorderColor="secondary"
                        iconBorderStyle="solid"
                        isDropdown
                        border="primary-extralight"
                        {...item}
                    />
                ))}
            </Dropdown.Content>
        </Dropdown>
    );
};

Sidebar.ModuleMenu = ({ style, children }: SidebarMenuProps) => (
    <BlockStack
        style={{
            height: "100%",
            // overflowX: "auto",
            scrollbarWidth: "none",
            ...style,
        }}
        className="pn-sidebar__menu"
    >
        {children}
    </BlockStack>
);

Sidebar.ModuleItem = ({
    title,
    icon,
    active = false,
    connectorActive = false,
    onClick,
}: SidebarItemProps) => {
    const { collapsed } = useSidebar();

    return (
        <BlockStack>
            <Tooltip
                title={title as string}
                placement="right"
                wrap="no-wrap"
                arrow
                className="pn-sidebar__menu-item pn-sidebar__menu-item--widget flex-center"
                visible={collapsed}
            >
                <Card
                    flex
                    direction="col"
                    blockAlign="center"
                    gap={10}
                    padding={collapsed ? 8 : "20px 15px 15px 15px"}
                    background={active ? "primary" : "primary-light"}
                    onClick={onClick}
                >
                    <IconButton
                        variant="white"
                        size={collapsed ? "small" : "medium"}
                        rounded="md"
                        name={icon}
                    />

                    {!collapsed && (
                        <Text color={active ? "white" : "black"} size="sm">
                            {title}
                        </Text>
                    )}
                </Card>
            </Tooltip>

            <BlockStack
                className={clsx(
                    "pn-sidebar__menu-item--connector",
                    connectorActive &&
                        "pn-sidebar__menu-item--connector--active",
                )}
            >
                <span />
            </BlockStack>
        </BlockStack>
    );
};

Sidebar.Bottom = ({
    children,
    helpCenter = true,
    storage,
    total,
    used,
}: SidebarBottomProps) => {
    const { collapsed } = useSidebar();

    return (
        <>
            <BlockStack
                align="center"
                inlineAlign="center"
                gap={10}
                className={clsx(
                    "pn-sidebar__bottom-collapsed",
                    collapsed && "pn-sidebar__bottom-collapsed-active",
                )}
            >
                {storage && (
                    <Tooltip
                        title={`${formatFileSize(
                            used || 0,
                        )} of ${formatFileSize(total || 0)}`}
                        wrap="no-wrap"
                        placement="right"
                    >
                        <IconButton
                            variant="secondary"
                            name="cloud"
                            rounded="md"
                        />
                    </Tooltip>
                )}

                {helpCenter && (
                    <Tooltip
                        title={__("Help Center", "ninja-drive")}
                        wrap="no-wrap"
                        placement="right"
                    >
                        <IconButton
                            variant="secondary"
                            name="contact_support"
                            rounded="md"
                            onClick={() =>
                                window.open(
                                    DOCS.supportLink,
                                    "_blank",
                                    "noreferrer",
                                )
                            }
                        />
                    </Tooltip>
                )}
            </BlockStack>

            <BlockStack
                gap={10}
                className="pn-sidebar__bottom pn-sidebar__fade"
            >
                {children}
            </BlockStack>
        </>
    );
};

Sidebar.HelpCenter = () => {
    return (
        <InlineStack
            gap={8}
            wrap={false}
            align="between"
            style={{
                cursor: "pointer",
            }}
            onClick={() =>
                window.open(DOCS.supportLink, "_blank", "noreferrer")
            }
        >
            <InlineStack gap={8} wrap={false}>
                <Icon name="contact_support" fontSize="xl" />

                <Text>{__("Help Center", "ninja-drive")}</Text>
            </InlineStack>

            <Icon name="open_in_new" fontSize="lg" />
        </InlineStack>
    );
};

Sidebar.UpgradePro = ({
    style,
    className,
}: {
    style?: React.CSSProperties;
    className?: string;
}) => (
    <InlineStack
        gap={8}
        wrap={false}
        onClick={() => window.open(pnpnd.upgrade_url, "_blank", "noreferrer")}
        style={{ ...style, cursor: "pointer" }}
        className={className}
    >
        <Icon name="crown" color="primary" fontSize="xl" />

        <Text color="primary">{__("Upgrade to Pro", "ninja-drive")}</Text>
    </InlineStack>
);

export default Sidebar;
