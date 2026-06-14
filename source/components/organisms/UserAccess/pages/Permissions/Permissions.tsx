import PageContainer from "~/components/molecules/PageContainer";
import SettingsField from "~/components/molecules/SettingsField";
import { useAppDispatch, useAppSelector } from "~/store/hooks";
import InlineStack from "~/components/molecules/InlineStack";
import BlockStack from "~/components/molecules/BlockStack";
import Checkbox from "~/components/atoms/Checkbox";
import Divider from "~/components/atoms/Divider";
import Text from "~/components/atoms/Text";
import { __ } from "@wordpress/i18n";
import DOCS from "~/utils/docs";
import {
    selectUserAccess,
    updateUserAccess,
} from "~/store/features/userAccessSlice";

const Permissions = () => {
    const { edit_data } = useAppSelector(selectUserAccess);

    const dispatch = useAppDispatch();

    const handlePageToggle = (
        pageKey: (typeof ACCESS_TYPES)[number]["key"],
    ) => {
        const currentPages = edit_data?.pages || [];
        const currentPermissions = edit_data?.permissions || [];
        const isPageOn = currentPages.includes(pageKey);

        let newPages: string[];
        let newPermissions: string[];

        if (isPageOn) {
            newPages = currentPages.filter((p) => p !== pageKey);

            newPermissions = currentPermissions.filter((permKey) => {
                const perm = ACCESS_LISTS.find((a) => a.key === permKey);
                if (!perm?.allowed) return true;

                return perm.allowed.some((allowedPage) =>
                    newPages.includes(allowedPage),
                );
            });
        } else {
            newPages = [...currentPages, pageKey];

            const autoPermissions = ACCESS_LISTS.filter(
                (a) => a.allowed?.includes(pageKey),
            ).map((a) => a.key);

            newPermissions = [
                ...new Set([...currentPermissions, ...autoPermissions]),
            ];
        }

        dispatch(
            updateUserAccess({
                pages: newPages,
                permissions: newPermissions,
            }),
        );
    };

    const handlePermissionToggle = (
        permKey: (typeof ACCESS_LISTS)[number]["key"],
    ) => {
        const currentPermissions = edit_data?.permissions || [];

        const newPermissions = currentPermissions.includes(permKey)
            ? currentPermissions.filter((p) => p !== permKey)
            : [...currentPermissions, permKey];

        dispatch(updateUserAccess({ permissions: newPermissions }));
    };

    const getPermissionDisabledState = (permKey: string) => {
        const perm = ACCESS_LISTS.find((a) => a.key === permKey);
        if (!perm?.allowed) return false;
        const currentPages = edit_data?.pages || [];
        return !perm.allowed.some((allowedPage) =>
            currentPages.includes(allowedPage),
        );
    };

    const isRequiredPermission = (permKey: string) => {
        const perm = ACCESS_LISTS.find((a) => a.key === permKey);

        if (!perm?.required?.length) return false;

        const currentPages = edit_data?.pages || [];

        return perm.required.some((page) => currentPages.includes(page));
    };

    return (
        <PageContainer
            compact
            style={{
                margin: "0 auto",
            }}
            title={__("User Access Permissions", "ninja-drive")}
            docLink={DOCS?.USER_ACCESS?.link}
        >
            <SettingsField>
                <InlineStack gap={10}>
                    <Text
                        color="gray-700"
                        size="sm"
                        weight="medium"
                        style={{
                            marginRight: "10px",
                        }}
                    >
                        {__("Give Permissions", "ninja-drive")}
                    </Text>

                    {ACCESS_TYPES?.map(({ key, title }, index) => (
                        <Checkbox
                            key={key ?? index}
                            title={title}
                            rounded="sm"
                            checked={edit_data?.pages?.includes(key)}
                            onChange={() => handlePageToggle(key)}
                        />
                    ))}
                </InlineStack>

                <Divider width="100%" height="1px" />

                <BlockStack gap={15}>
                    {ACCESS_LISTS?.map(({ key, title }, index) => (
                        <Checkbox
                            key={key ?? index}
                            title={title}
                            rounded="sm"
                            checked={
                                edit_data?.permissions?.includes(key) ||
                                isRequiredPermission(key)
                            }
                            onChange={() => {
                                if (
                                    getPermissionDisabledState(key) ||
                                    isRequiredPermission(key)
                                )
                                    return;
                                handlePermissionToggle(key);
                            }}
                            disabled={
                                getPermissionDisabledState(key) ||
                                isRequiredPermission(key)
                            }
                        />
                    ))}
                </BlockStack>
            </SettingsField>
        </PageContainer>
    );
};

export default Permissions;

const ACCESS_TYPES: {
    key:
        | "file_manager"
        | "media_library"
        | "widget_builder"
        | "settings"
        | "user_access";
    title: string;
}[] = [
    {
        key: "file_manager",
        title: __("File Manager", "ninja-drive"),
    },
    {
        key: "media_library",
        title: __("Media Library", "ninja-drive"),
    },
    {
        key: "widget_builder",
        title: __("Widget Builder", "ninja-drive"),
    },
    {
        key: "settings",
        title: __("Settings", "ninja-drive"),
    },
    {
        key: "user_access",
        title: __("User Access", "ninja-drive"),
    },
];

const ACCESS_LISTS: {
    key:
        | "files.view"
        | "files.upload"
        | "files.download"
        | "files.preview"
        | "files.rename"
        | "files.delete"
        | "files.copy"
        | "files.move"
        | "files.share"
        | "folders.view"
        | "folders.create"
        | "accounts.connect"
        | "accounts.manage"
        | "settings.view"
        | "settings.manage"
        | "widgets.manage"
        | "users.view"
        | "users.manage";
    title: string;
    allowed?: (
        | "file_manager"
        | "media_library"
        | "widget_builder"
        | "settings"
        | "user_access"
    )[];
    required?: (
        | "file_manager"
        | "media_library"
        | "widget_builder"
        | "settings"
        | "user_access"
    )[];
}[] = [
    {
        key: "files.view",
        title: __("View Files", "ninja-drive"),
        allowed: [
            "file_manager",
            "media_library",
            "widget_builder",
            "user_access",
        ],
        required: ["file_manager", "media_library", "widget_builder"],
    },
    {
        key: "files.upload",
        title: __("Upload Files", "ninja-drive"),
        allowed: [
            "file_manager",
            "media_library",
            "widget_builder",
            "user_access",
            "settings",
        ],
    },
    {
        key: "files.download",
        title: __("Download Files", "ninja-drive"),
        allowed: [
            "file_manager",
            "media_library",
            "widget_builder",
            "user_access",
        ],
    },
    {
        key: "files.preview",
        title: __("Preview Files", "ninja-drive"),
        allowed: [
            "file_manager",
            "media_library",
            "widget_builder",
            "user_access",
        ],
    },
    {
        key: "files.rename",
        title: __("Rename Files", "ninja-drive"),
        allowed: [
            "file_manager",
            "media_library",
            "widget_builder",
            "user_access",
        ],
    },
    {
        key: "files.delete",
        title: __("Delete Files", "ninja-drive"),
        allowed: [
            "file_manager",
            "media_library",
            "widget_builder",
            "user_access",
        ],
    },
    {
        key: "files.copy",
        title: __("Copy Files", "ninja-drive"),
        allowed: [
            "file_manager",
            "media_library",
            "widget_builder",
            "user_access",
        ],
    },
    {
        key: "files.move",
        title: __("Move Files", "ninja-drive"),
        allowed: [
            "file_manager",
            "media_library",
            "widget_builder",
            "user_access",
        ],
    },
    {
        key: "files.share",
        title: __("Share Files", "ninja-drive"),
        allowed: [
            "file_manager",
            "media_library",
            "widget_builder",
            "user_access",
        ],
    },
    {
        key: "folders.view",
        title: __("View Folders", "ninja-drive"),
        allowed: [
            "file_manager",
            "media_library",
            "widget_builder",
            "settings",
            "user_access",
        ],
        required: [
            "file_manager",
            "media_library",
            "widget_builder",
            "user_access",
        ],
    },
    {
        key: "folders.create",
        title: __("Create Folders", "ninja-drive"),
        allowed: [
            "file_manager",
            "media_library",
            "widget_builder",
            "user_access",
            "settings",
        ],
    },
    {
        key: "accounts.connect",
        title: __("Connect Accounts", "ninja-drive"),
        allowed: [
            "file_manager",
            "media_library",
            "widget_builder",
            "user_access",
            "settings",
        ],
    },
    {
        key: "accounts.manage",
        title: __("Manage Accounts", "ninja-drive"),
        allowed: [
            "file_manager",
            "media_library",
            "widget_builder",
            "user_access",
            "settings",
        ],
    },
    {
        key: "settings.view",
        title: __("View Settings", "ninja-drive"),
        allowed: [
            "file_manager",
            "media_library",
            "widget_builder",
            "settings",
        ],
        required: [
            "file_manager",
            "media_library",
            "widget_builder",
            "settings",
        ],
    },
    {
        key: "settings.manage",
        title: __("Manage Settings", "ninja-drive"),
        allowed: ["settings"],
        required: ["settings"],
    },
    {
        key: "widgets.manage",
        title: __("Manage Widgets", "ninja-drive"),
        allowed: ["widget_builder"],
        required: ["widget_builder"],
    },
    {
        key: "users.view",
        title: __("View Users", "ninja-drive"),
        allowed: ["user_access"],
        required: ["user_access"],
    },
    {
        key: "users.manage",
        title: __("Manage Users", "ninja-drive"),
        allowed: ["user_access"],
        required: ["user_access"],
    },
];
