import UpgradeBanner from "~/components/organisms/UpgradeBanner";
import MainLayout from "~/components/templates/MainLayout";
import BlockStack from "~/components/molecules/BlockStack";
import Loading from "~/components/atoms/Loading";
import { __ } from "@wordpress/i18n";

const UserAccess = () => {

    return (
        <MainLayout>
            <MainLayout.ContentWrapper>
                <MainLayout.Content>
                    <UpgradeBanner />
                </MainLayout.Content>
            </MainLayout.ContentWrapper>
        </MainLayout>
    );
};

export default UserAccess;
