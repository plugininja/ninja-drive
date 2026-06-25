import AccessTopbar from "./components/AccessTopbar";
import MainLayout from "~/ui/templates/MainLayout";
import AccessList from "./components/AccessList";
import { InlineStack } from "~/ui/molecules";
import { IconButton } from "~/ui/molecules";
import { Topbar } from "~/ui/molecules";
import { __ } from "@wordpress/i18n";
import { Button } from "~/ui/atoms";
import { Text } from "~/ui/atoms";
import {
    UserAccessQueryArgs,
} from "~features/user-access/types/userAccess";

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
                        selectedAccesses={[]}
                        setSelectedAccesses={() => {}}
                        onAdd={() => {}}
                        queryArgs={{} as UserAccessQueryArgs}
                        setQueryArgs={() => {}}
                    />

                    <AccessList
                        data={[]}
                        selectedAccesses={[]}
                        setSelectedAccesses={() => {}}
                        onAdd={() => {}}
                        loading={false}
                    />
                </MainLayout.Content>
            </MainLayout.ContentWrapper>
        </MainLayout>
    );
};

export default UserAccess;
