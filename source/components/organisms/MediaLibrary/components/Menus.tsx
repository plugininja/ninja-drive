import { useContext, createContext } from "@wordpress/element";
import { selectAuth } from "~/store/features/authSlice";
import LogoIcon from "~/components/atoms/Logo/LogoIcon";
import Accounts from "~/components/molecules/Accounts";
import { useAppSelector } from "~/store/hooks";
import Card from "~/components/molecules/Card";
import Icon from "~/components/atoms/Icon";
import Text from "~/components/atoms/Text";
import { __ } from "@wordpress/i18n";
import clsx from "clsx";

export type MenuKey = "media_library" | "account" | "trash_bin";

type MenusContextType = {
    setActive: (active: MenuKey) => void;
};

const MenusContext = createContext<MenusContextType | undefined>(undefined);

const useMenus = () => {
    const context = useContext(MenusContext);

    if (!context) throw new Error("Menus context missing");

    return context;
};

const Menus = ({
    setActive,
    children,
}: {
    setActive: (active: MenuKey) => void;
    children: React.ReactNode;
}) => {
    return (
        <MenusContext.Provider value={{ setActive }}>
            <div
                style={{
                    position: "relative",
                    width: "100%",
                    height: "100%",
                }}
            >
                {children}
            </div>
        </MenusContext.Provider>
    );
};

Menus.MediaLibrary = ({ active }: { active: boolean }) => {
    const { setActive } = useMenus();

    return (
        <Card
            padding="10px 15px"
            background={active ? "primary" : "primary-extralight"}
            borderStyle="none"
            rounded="none"
            style={{
                height: "50px",
            }}
            className="pnpnd-media-library-sidebar__media-library"
            onClick={() => {
                setActive("media_library");
            }}
        >
            <i
                className={clsx(
                    "dashicons dashicons-admin-media",
                    active && "text-white",
                )}
            />

            <Text size="md" color={active ? "white" : "black"}>
                {__("Media Library", "ninja-drive")}
            </Text>
        </Card>
    );
};

Menus.Account = ({ active }: { active: boolean }) => {
    const { active_account } = useAppSelector(selectAuth);
    const { setActive } = useMenus();

    return (
        <Card
            padding="10px 15px"
            background={active ? "primary" : "primary-extralight"}
            borderStyle="none"
            rounded="none"
            style={{
                height: "50px",
            }}
            className="pnpnd-media-library-sidebar__account"
            onClick={() => {
                if (pnpnd.is_pro !== "1") {
                    PNPNDHelper.openUpgradePopUp();
                    return;
                }
                PNPNDHelper.openUpgradePopUp();
            }}
        >
            <div
                style={{ minWidth: 0 }}
                className="pnpnd-media-library-sidebar__account-info"
            >
                <div
                    style={{
                        flexShrink: 0,
                    }}
                    className="pnpnd-media-library-sidebar__account-logo"
                >
                    {active ? <LogoIcon /> : <LogoIcon />}
                </div>

                <Text
                    size="md"
                    color={active ? "white" : "black"}
                    wrap={false}
                    ellipsis
                    style={{ width: "100%" }}
                >
                    {active_account?.name}
                </Text>
            </div>

            {pnpnd?.current_user?.can?.has_full_access ||
            pnpnd?.current_user?.can?.accounts_connect ||
            pnpnd?.current_user?.can?.accounts_manage ? (
                <Accounts
                    position={{
                        left: "0",
                        right: "auto",
                    }}
                    arrowColor={active ? "white" : "black"}
                    media_library
                />
            ) : null}
        </Card>
    );
};

Menus.TrashBin = ({ active }: { active: boolean }) => {
    const { setActive } = useMenus();

    return (
        <Card
            padding="10px 15px"
            background={active ? "error" : "error-100"}
            borderStyle="none"
            rounded="none"
            style={{
                height: "50px",
            }}
            className="pnpnd-media-library-sidebar__trash-bin"
            onClick={() => {
                PNPNDHelper.openUpgradePopUp();
            }}
        >
            <Icon
                name="delete"
                color={active ? "white" : "error"}
                fontSize="lg"
            />

            <Text size="md" color={active ? "white" : "error"}>
                {__("Trash Bin", "ninja-drive")}
            </Text>
        </Card>
    );
};

export default Menus;
