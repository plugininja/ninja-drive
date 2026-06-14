import { UserAccess as UserAccessType } from "~/types/userAccess";
import InlineStack from "~/components/molecules/InlineStack";
import MainLayout from "~/components/templates/MainLayout";
import IconButton from "~/components/molecules/IconButton";
import AccessTopbar from "./components/AccessTopbar";
import Topbar from "~/components/molecules/Topbar";
import AccessList from "./components/AccessList";
import Button from "~/components/atoms/Button";
import { useState } from "@wordpress/element";
import Text from "~/components/atoms/Text";
import { __ } from "@wordpress/i18n";

const UserAccess = () => {
    const title = (
        <InlineStack gap={10}>
            <IconButton
                variant="white"
                rounded="md"
                name="passkey"
                color="primary"
                border
                borderColor="gray-200"
                fontSize="2xl"
                style={{
                    backgroundColor: "var(--pnpnd-gray-50)",
                }}
            />

            <Text color="gray-700" weight="semibold">
                {__("User Access", "ninja-drive")}
            </Text>
        </InlineStack>
    );

    const [selectedAccesses, setSelectedAccesses] = useState<UserAccessType[]>(
        [],
    );

    return (
        <MainLayout>
            <MainLayout.ContentWrapper>
                <Topbar leftContents={[title]} />

                <MainLayout.Content>
                    <InlineStack gap={10} align="between">
                        <InlineStack gap={5}>
                            <Text color="gray-700" weight="semibold">
                                {__("All User Access", "ninja-drive")}
                            </Text>

                            <Text color="gray-600" size="sm">
                                (0 {__("items", "ninja-drive")})
                            </Text>
                        </InlineStack>

                        <Button
                            variant="outlined"
                            size="small"
                            startIcon="info"
                            href=""
                            target="_blank"
                        >
                            {__("Documentation", "ninja-drive")}
                        </Button>
                    </InlineStack>

                    <AccessTopbar
                        data={[]}
                        selectedAccesses={selectedAccesses}
                        setSelectedAccesses={setSelectedAccesses}
                        onAdd={() => {}}
                    />

                    <AccessList
                        data={[]}
                        selectedAccesses={selectedAccesses}
                        setSelectedAccesses={setSelectedAccesses}
                        onAdd={() => {}}
                        loading={false}
                    />
                </MainLayout.Content>
            </MainLayout.ContentWrapper>
        </MainLayout>
    );
};

export default UserAccess;
