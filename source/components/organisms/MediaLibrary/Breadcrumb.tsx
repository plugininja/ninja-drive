import SkeletonLoader from "~/components/molecules/SkeletonLoader";
import { useAppDispatch, useAppSelector } from "~/store/hooks";
import InlineStack from "~/components/molecules/InlineStack";
import GridStack from "~/components/molecules/GridStack";
import Button from "~/components/atoms/Button";
import { File } from "~/types/file.types";
import useDevice from "~/hooks/useDevice";
import {
    selectMediaLibrary,
    setActiveFolder,
} from "~/store/features/mediaLibrarySlice";

const Breadcrumb = () => {
    const { folders, active_folder, loading } =
        useAppSelector(selectMediaLibrary);
    const dispatch = useAppDispatch();
    const device = useDevice();

    const handleFolderClick = (folder: File) => {
        PNPNDHelper.openUpgradePopUp();
    };

    if (loading) {
        return (
            <GridStack columns={"auto-fit"} gap={10}>
                {Array.from({
                    length:
                        device === "mobile" ? 5 : device === "tablet" ? 7 : 10,
                }).map((_, index) => (
                    <SkeletonLoader
                        key={index}
                        width="100%"
                        height="35px"
                        rounded="sm"
                    />
                ))}
            </GridStack>
        );
    }

    if (!folders || folders.length === 0) {
        return null;
    }

    return (
        <InlineStack
            gap={10}
            padding={10}
            style={{
                backgroundColor: "white",
                border: "1px solid #C3C4C7",
            }}
        >
            {folders?.map((folder) => (
                <Button
                    key={folder?.file_key}
                    variant={
                        active_folder?.file_key === folder?.file_key
                            ? "primary"
                            : "secondary"
                    }
                    size="extrasmall"
                    startIcon="folder"
                    onClick={() => handleFolderClick(folder)}
                    textTransform="none"
                >
                    {folder?.name}
                </Button>
            ))}
        </InlineStack>
    );
};

export default Breadcrumb;
