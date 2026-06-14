import InlineStack from "~/components/molecules/InlineStack";
import IconButton from "~/components/molecules/IconButton";
import Dropdown from "~/components/molecules/Dropdown";
import Button from "~/components/atoms/Button";
import { useFilesContext } from "./FilesViews";
import { toBoolean } from "~/utils/functions";
import Icon from "~/components/atoms/Icon";
import Text from "~/components/atoms/Text";
import { memo } from "@wordpress/element";

const MAX_ITEMS = 5;
const FIRST_ITEMS = 1;
const LAST_ITEMS = 3;

const BreadCrumbs = memo(() => {
    const { breadcrumbs, openFolder } = useFilesContext();
    const hasFullAccess = pnpnd?.current_user?.can?.has_full_access || false;

    let filteredBreadcrumbs = breadcrumbs;

    if (toBoolean(pnpnd.is_pro) && !hasFullAccess) {
        filteredBreadcrumbs = breadcrumbs.filter(
            (crumb) => crumb.file_key !== "home",
        );
    }

    return (
        <InlineStack wrap={false}>
            {filteredBreadcrumbs?.slice(0, FIRST_ITEMS).map((crumb, index) => (
                <InlineStack key={index} wrap={false}>
                    <Button
                        color="primary"
                        size="small"
                        startIcon="home"
                        textTransform="none"
                        startIconColor="primary"
                        style={{
                            whiteSpace: "nowrap",
                        }}
                        onClick={() => {
                            openFolder(crumb.file_key);
                        }}
                    >
                        {crumb.name}
                    </Button>

                    <Icon name="chevron_right" color="primary" fontSize="xl" />
                </InlineStack>
            ))}

            {filteredBreadcrumbs.length > MAX_ITEMS && (
                <Dropdown>
                    <Dropdown.Trigger>
                        <IconButton
                            variant="white"
                            size="extrasmall"
                            name="more_horiz"
                            color="primary"
                            border
                            borderColor="gray-200"
                        />
                    </Dropdown.Trigger>

                    <Dropdown.Content>
                        {filteredBreadcrumbs
                            .slice(FIRST_ITEMS, -LAST_ITEMS)
                            .map((crumb, index) => (
                                <Dropdown.MenuItem
                                    key={index}
                                    onClick={() => {
                                        openFolder(crumb.file_key);
                                    }}
                                >
                                    <InlineStack
                                        align="start"
                                        blockAlign="center"
                                        wrap={false}
                                    >
                                        <Icon
                                            name="chevron_right"
                                            fontSize="xl"
                                        />

                                        <Text wrap={false}>{crumb.name}</Text>
                                    </InlineStack>
                                </Dropdown.MenuItem>
                            ))}
                    </Dropdown.Content>
                </Dropdown>
            )}

            {filteredBreadcrumbs
                .slice(
                    filteredBreadcrumbs.length > MAX_ITEMS
                        ? -LAST_ITEMS
                        : FIRST_ITEMS,
                )
                .map((crumb, index) => (
                    <InlineStack key={index} wrap={false}>
                        <Button
                            title={crumb.name}
                            variant={
                                filteredBreadcrumbs.length > MAX_ITEMS
                                    ? index === LAST_ITEMS - 1
                                        ? "secondary"
                                        : "default"
                                    : index ===
                                      filteredBreadcrumbs.length -
                                          FIRST_ITEMS -
                                          1
                                    ? "outlined"
                                    : "default"
                            }
                            color="primary"
                            size="small"
                            startIcon="folder_open"
                            textTransform="none"
                            startIconColor="primary"
                            onClick={() => {
                                openFolder(crumb.file_key);
                            }}
                        >
                            <Text
                                size="sm"
                                wrap={false}
                                ellipsis
                                style={{
                                    maxWidth: "100px",
                                    minWidth: 0,
                                }}
                            >
                                {crumb.name}
                            </Text>
                        </Button>

                        {index !==
                            (filteredBreadcrumbs.length > MAX_ITEMS
                                ? LAST_ITEMS - 1
                                : filteredBreadcrumbs.length -
                                  FIRST_ITEMS -
                                  1) && (
                            <Icon
                                name="chevron_right"
                                color="primary"
                                fontSize="xl"
                            />
                        )}
                    </InlineStack>
                ))}
        </InlineStack>
    );
});

export default BreadCrumbs;
