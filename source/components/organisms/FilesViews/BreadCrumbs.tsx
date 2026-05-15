import InlineStack from "~/components/molecules/InlineStack";
import IconButton from "~/components/molecules/IconButton";
import { useFilesContext } from "./FilesViews";
import Dropdown from "~/components/molecules/Dropdown";
import { memo } from "@wordpress/element";
import Button from "~/components/atoms/Button";
import Icon from "~/components/atoms/Icon";
import Text from "~/components/atoms/Text";
import { toBoolean } from "~/utils/functions";

const MAX_ITEMS = 5;
const FIRST_ITEMS = 1;
const LAST_ITEMS = 3;

const BreadCrumbs = memo(() => {
    const { breadcrumbs, activeFolder, openFolder } = useFilesContext();
    const hasFullAccess = pnpnd?.currentUser?.can?.hasFullAccess || false;

    let filteredBreadcrumbs = breadcrumbs;

    if (toBoolean(pnpnd.isPro) && !hasFullAccess) {
        filteredBreadcrumbs = breadcrumbs.filter(
            (crumb) => crumb.fileKey !== "home",
        );
    }
    return (
        <InlineStack>
            {filteredBreadcrumbs?.slice(0, FIRST_ITEMS).map((crumb, index) => (
                <InlineStack key={index}>
                    <Button
                        size="small"
                        startIcon={"home"}
                        textTransform="none"
                        onClick={() => {
                            openFolder(crumb.fileKey);
                        }}
                        color="black"
                    >
                        {crumb.name}
                    </Button>
                    <Icon name="chevron_right" fontSize="xl" />
                </InlineStack>
            ))}

            {filteredBreadcrumbs.length > MAX_ITEMS && (
                <Dropdown>
                    <Dropdown.Trigger>
                        <IconButton
                            variant="outlined"
                            size="small"
                            name="more_horiz"
                        />
                    </Dropdown.Trigger>

                    <Dropdown.Content>
                        {filteredBreadcrumbs
                            .slice(FIRST_ITEMS, -LAST_ITEMS)
                            .map((crumb, index) => (
                                <Dropdown.MenuItem
                                    key={index}
                                    onClick={() => {
                                        openFolder(crumb.fileKey);
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
                    <InlineStack key={index}>
                        <Button
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
                            size="small"
                            startIcon="folder_open"
                            textTransform="none"
                            onClick={() => {
                                openFolder(crumb.fileKey);
                            }}
                            color="black"
                        >
                            {crumb.name}
                        </Button>

                        {index !==
                            (filteredBreadcrumbs.length > MAX_ITEMS
                                ? LAST_ITEMS - 1
                                : filteredBreadcrumbs.length -
                                  FIRST_ITEMS -
                                  1) && (
                            <Icon name="chevron_right" fontSize="xl" />
                        )}
                    </InlineStack>
                ))}
        </InlineStack>
    );
});

export default BreadCrumbs;
