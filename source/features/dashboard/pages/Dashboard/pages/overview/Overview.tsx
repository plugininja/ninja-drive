import DownloadLinks from "../DownloadLinks/DownloadLinks";
import CachedFiles from "../CachedFiles/CachedFiles";
import CachedCard from "../CachedFiles/CachedCard";
import ShareLinks from "../ShareLinks/ShareLinks";
import { PageContainer } from "~/ui/molecules";
import { MenuProvider } from "~/ui/molecules";
import { InlineStack } from "~/ui/molecules";
import RecentModules from "./RecentModules";

const Overview = () => {
    return (
        <PageContainer>
            <MenuProvider>
                <CachedCard />
            </MenuProvider>

            <InlineStack gap={10} blockAlign="stretch" wrap={false}>
                <CachedFiles width="45%" overview={true} />

                <RecentModules width="55%" />
            </InlineStack>

            <InlineStack gap={10} blockAlign="start" wrap={false}>
                <ShareLinks variant="small" width="55%" overview={true} />

                <DownloadLinks variant="small" width="45%" overview={true} />
            </InlineStack>
        </PageContainer>
    );
};

export default Overview;
