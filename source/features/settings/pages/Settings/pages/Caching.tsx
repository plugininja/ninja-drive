import { selectSettings } from "~features/settings/state/settingSlice";
import useSaveSettings from "~features/settings/hooks/useSaveSettings";
import { PageContainer, SkeletonLoader } from "~/ui/molecules";
import SettingsField from "~/shared/molecules/SettingsField";
import { useCustomAlert } from "~/shared/molecules/Alert";
import { useEffect, useState } from "@wordpress/element";
import { useAppSelector } from "~kernel/store/hooks";
import { InlineStack } from "~/ui/molecules";
import { Description } from "~/ui/molecules";
import { BlockStack } from "~/ui/molecules";
import { Switcher } from "~/ui/atoms";
import { Card } from "~/ui/molecules";
import { __ } from "@wordpress/i18n";
import { Button } from "~/ui/atoms";
import { Text } from "~/ui/atoms";
import { Icon } from "~/ui/atoms";
import {
    useDeleteCachedFileMutation,
    useGetDashboardDataQuery,
} from "~/features/dashboard";

export type CardsType = {
    key: "total" | "5xl" | "4xl" | "xl" | "lg" | "md";
    title: string;
    actionTitle: string;
    icon: string;
    color: "primary" | "success" | "purple" | "skyblue" | "warning" | "pink";
    bg:
        | "primary-extralight"
        | "success-50"
        | "skyblue-50"
        | "purple-50"
        | "warning-50"
        | "pink-50";
    border:
        | "primary-light"
        | "success-100"
        | "skyblue-100"
        | "purple-100"
        | "warning-100"
        | "pink-100";
    count?: number;
    size?: string;
};

const Caching = () => {
    const [CARDS, setCARDS] = useState<CardsType[]>([]);
    const { data } = useAppSelector(selectSettings);

    const {
        data: cache_data,
        isLoading,
        isFetching,
    } = useGetDashboardDataQuery({
        fields: "image_cache",
    });

    const [deleteCachedFile] = useDeleteCachedFileMutation();

    const { saveCaching } = useSaveSettings();

    const { showAlert } = useCustomAlert();

    const { image_caching } = data?.caching || {};

    const loading = isLoading || isFetching;

    useEffect(() => {
        if (cache_data?.data?.image_cache) {
            const updatedCards = STATIC_CARDS?.map((card) => {
                const match = cache_data?.data?.image_cache?.find(
                    (cache) => cache?.key === card?.key,
                );

                return {
                    ...card,
                    size: match?.size || "0 KB",
                    count: match?.count || 0,
                };
            });

            setCARDS(updatedCards as CardsType[]);
        }
    }, [cache_data, isLoading, isFetching]);

    const handleDeleteCache = (
        key: "total" | "5xl" | "4xl" | "xl" | "lg" | "md",
    ) => {
        showAlert({
            type: "error",
            title: __("Delete", "ninja-drive"),
            text: `${__(
                "Are you sure you want to delete cache for",
                "ninja-drive",
            )} ${key}?`,
            showCancelButton: true,
            confirmButtonText: __("Delete", "ninja-drive"),
            onConfirm: async () => {
                try {
                    const response = await deleteCachedFile({
                        type: key,
                    }).unwrap();

                    const updatedCards = STATIC_CARDS?.map((card) => {
                        const match = response?.data?.image_cache?.find(
                            (item) => item?.key === card?.key,
                        );

                        return {
                            ...card,
                            count: match?.count || 0,
                            size: match?.size || "0 KB",
                        };
                    });

                    setCARDS(updatedCards as CardsType[]);

                    showAlert({
                        toast: true,
                        type: "success",
                        text:
                            response?.message ||
                            __("Cache deleted successfully", "ninja-drive"),
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
                            __("Failed to delete cache", "ninja-drive"),
                        timer: 3000,
                        timerProgressBar: true,
                        showConfirmButton: false,
                    });
                }
            },
        });
    };

    return (
        <PageContainer compact style={{ margin: "0 auto" }}>
            <SettingsField
                description={__(
                    "Improve performance by caching images. This reduces the load on your server and speeds up image loading times.",
                    "ninja-drive",
                )}
                action={
                    <Switcher
                        title={__("Image Caching", "ninja-drive")}
                        checked={image_caching}
                        onChange={() =>
                            saveCaching("image_caching", !image_caching)
                        }
                    />
                }
            />

            {loading
                ? Array.from({ length: 6 }).map((_, index) => (
                      <SkeletonLoader key={index} width="100%" height="166px" />
                  ))
                : CARDS?.map(
                      (
                          {
                              key,
                              title,
                              actionTitle,
                              icon,
                              color,
                              bg,
                              border,
                              count,
                              size,
                          },
                          index,
                      ) => (
                          <Card
                              key={key ?? index}
                              background="white"
                              border="primary-light"
                              flex
                              blockAlign="center"
                              gap={20}
                          >
                              <Card
                                  padding={15}
                                  background={bg}
                                  border={border}
                                  rounded="md"
                                  style={{
                                      minWidth: "200px",
                                      width: "fit-content",
                                  }}
                              >
                                  <InlineStack
                                      align="between"
                                      blockAlign="start"
                                      gap={20}
                                      wrap={false}
                                  >
                                      <Text color="gray-700">{title}</Text>

                                      <Card
                                          padding={5}
                                          background="white"
                                          border="primary-light"
                                          flex
                                          align="center"
                                          blockAlign="center"
                                          style={{
                                              width: "35px",
                                              height: "35px",
                                              borderRadius: "6px",
                                          }}
                                      >
                                          <Icon
                                              name={icon}
                                              color="gray-700"
                                              fontSize="2xl"
                                          />
                                      </Card>
                                  </InlineStack>

                                  <Text size="2xl" weight="medium">
                                      {count}
                                  </Text>

                                  <InlineStack
                                      marginTop={5}
                                      gap={10}
                                      wrap={false}
                                  >
                                      <Text color="gray-700" size="sm">
                                          {__("File Size:", "ninja-drive")}
                                      </Text>

                                      <Card
                                          padding={5}
                                          background="white"
                                          border="primary-light"
                                          flex
                                          align="center"
                                          blockAlign="center"
                                          style={{
                                              width: "fit-content",
                                              borderRadius: "6px",
                                          }}
                                      >
                                          <Text
                                              color={color}
                                              size="sm"
                                              weight="medium"
                                          >
                                              {size}
                                          </Text>
                                      </Card>
                                  </InlineStack>
                              </Card>

                              <BlockStack gap={10}>
                                  <InlineStack gap={10}>
                                      <Text color="gray-700" weight="medium">
                                          {actionTitle}
                                      </Text>

                                      <Button
                                          variant="error"
                                          startIcon="delete"
                                          onClick={() => handleDeleteCache(key)}
                                      >
                                          {`${__(
                                              "Clear",
                                              "ninja-drive",
                                          )} ${key} ${__(
                                              "cache",
                                              "ninja-drive",
                                          )}`}
                                      </Button>
                                  </InlineStack>

                                  <Description text="Remove all Dropbox attachments currently integrated into your media library." />
                              </BlockStack>
                          </Card>
                      ),
                  )}
        </PageContainer>
    );
};

export default Caching;

export const STATIC_CARDS: CardsType[] = [
    {
        key: "total",
        title: __("Total In Cache", "ninja-drive"),
        actionTitle: __("Remove Total cached files", "ninja-drive"),
        icon: "imagesmode",
        color: "primary",
        bg: "primary-extralight",
        border: "primary-light",
    },
    {
        key: "5xl",
        title: __("Ration: 5xl", "ninja-drive"),
        actionTitle: __("Remove All 5xl cached files", "ninja-drive"),
        icon: "capture",
        color: "success",
        bg: "success-50",
        border: "success-100",
    },
    {
        key: "4xl",
        title: __("Ration: 4xl", "ninja-drive"),
        actionTitle: __("Remove All 4xl cached files", "ninja-drive"),
        icon: "photo_size_select_large",
        color: "purple",
        bg: "purple-50",
        border: "purple-100",
    },
    {
        key: "xl",
        title: __("Ration: Xl", "ninja-drive"),
        actionTitle: __("Remove All xl cached files", "ninja-drive"),
        icon: "picture_in_picture_large",
        color: "skyblue",
        bg: "skyblue-50",
        border: "skyblue-100",
    },
    {
        key: "lg",
        title: __("Ration: Lg", "ninja-drive"),
        actionTitle: __("Remove All lg cached files", "ninja-drive"),
        icon: "picture_in_picture_medium",
        color: "warning",
        bg: "warning-50",
        border: "warning-100",
    },
    {
        key: "md",
        title: __("Ration: Md", "ninja-drive"),
        actionTitle: __("Remove All md cached files", "ninja-drive"),
        icon: "picture_in_picture_small",
        color: "pink",
        bg: "pink-50",
        border: "pink-100",
    },
];
