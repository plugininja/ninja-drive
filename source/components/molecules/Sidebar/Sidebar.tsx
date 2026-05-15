import { useLocalStorage } from "~/hooks/useLocalStorage";
import { STORAGE_KEYS } from "~/constants/storageKeys";
import { formatFileSize, toBoolean } from "~/utils/functions";
import InlineStack from "~/components/molecules/InlineStack";
import BlockStack from "~/components/molecules/BlockStack";
import IconButton from "~/components/molecules/IconButton";
import { __ } from "@wordpress/i18n";
import Dropdown from "~/components/molecules/Dropdown";
import Tooltip from "~/components/atoms/Tooltip";
import DOCS from "~/utils/docs";
import Logo from "~/components/atoms/Logo";
import Icon from "~/components/atoms/Icon";
import Card from "~/components/molecules/Card";
import Text from "~/components/atoms/Text";
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
                    width: collapsed ? 98 : width,
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
                    gap={5}
                    className="pn-sidebar__header"
                >
                    {!collapsed && (
                        <a href={"https://plugininja.com/"} target="_blank">
                            <Logo />
                        </a>
                    )}

                    <IconButton
                        variant={collapsed ? "primary" : "secondary"}
                        name="keyboard_tab_rtl"
                        size="small"
                        color={collapsed ? "white" : "primary"}
                        fontSize="lg"
                        rounded="md"
                        className="pn-sidebar__header--toggle"
                        onClick={toggle}
                    />
                </InlineStack>

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
    svgIcon,
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
                        svgIcon={svgIcon}
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
}: SidebarDropdownItemProps) => {
    const { collapsed } = useSidebar();
    const activeChildren = childrenItems?.filter(
        (item) => item.key === activeKey,
    );

    const accessDisabled =
        pnpnd?.currentUser?.can?.hasFullAccess && toBoolean(pnpnd.isPro);

    return (
        <Dropdown outSideClick={false}>
            <Dropdown.Trigger
                openStatus={accessDisabled ? false : collapsed}
                disabled={accessDisabled}
            >
                <Sidebar.Item
                    active
                    title={activeChildren?.[0]?.title || "Menu"}
                    icon={activeChildren?.[0]?.icon}
                    iconUrl={activeChildren?.[0]?.iconUrl}
                    svgIcon={activeChildren?.[0]?.svgIcon}
                    iconSize={activeChildren?.[0]?.iconSize}
                    iconBorderStyle="solid"
                    statusProps={activeChildren?.[0]?.statusProps}
                    isDropdown
                    border="primary-extralight"
                    borderStyle="solid"
                    rounded="md"
                    iconRounded="md"
                />

                {!accessDisabled && !collapsed && (
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
                style={{
                    width: collapsed ? "50px" : "100%",
                    minWidth: "fit-content",
                    padding: collapsed ? "5px" : "10px",
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
                        size={"large"}
                        rounded="md"
                        iconButtonVariant="white"
                        iconRounded="md"
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

                <Text size="sm" weight="medium">
                    v {pnpnd.version}
                </Text>
            </BlockStack>

            <BlockStack
                gap={10}
                className="pn-sidebar__bottom pn-sidebar__fade"
            >
                {children}

                <InlineStack
                    gap={5}
                    align="between"
                    wrap={false}
                    style={{ paddingLeft: "5px", paddingRight: "5px" }}
                >
                    <Text size="sm" weight="medium">
                        {__("Version", "ninja-drive")}
                    </Text>

                    <Text size="sm" weight="medium">
                        {pnpnd.version}
                    </Text>
                </InlineStack>
            </BlockStack>
        </>
    );
};

Sidebar.HelpCenter = () => {
    return (
        <InlineStack
            gap={8}
            wrap={false}
            className="pn-sidebar__bottom-help-center"
            onClick={() =>
                window.open(DOCS.supportLink, "_blank", "noreferrer")
            }
            align="between"
        >
            <InlineStack gap={8} wrap={false}>
                <Icon name="contact_support" fontSize="xl" />

                <Text className="pn-sidebar__bottom-help-center-title">
                    {__("Help Center", "ninja-drive")}
                </Text>
            </InlineStack>

            <Icon name="open_in_new" fontSize="lg" />
        </InlineStack>
    );
};

Sidebar.UpgradePro = () => (
    <InlineStack
        gap={8}
        wrap={false}
        className="pn-sidebar__bottom-upgrade-pro"
        onClick={() => window.open(pnpnd.upgradeUrl, "_blank", "noreferrer")}
    >
        <Icon name="crown" fontSize="xl" />

        <Text className="pn-sidebar__bottom-upgrade-pro-title">
            {__("Upgrade to Pro", "ninja-drive")}
        </Text>
    </InlineStack>
);

export default Sidebar;
