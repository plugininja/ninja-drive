import InlineStack from "~/components/molecules/InlineStack";
import Text from "~/components/atoms/Text";
import DOCS from "~/utils/docs";
import { __ } from "@wordpress/i18n";
const Footer = () => {
    return (
        <InlineStack align="center">
            <Text align="center">
                {__(
                    "If you're having trouble to connecting your app",
                    "ninja-drive",
                )}
                -{" "}
                <Text
                    as="a"
                    color="primary"
                    className="cursor-pointer"
                    onClick={() =>
                        window.open(
                            DOCS.FILE_BROWSER.login.contactNowLink,
                            "_blank",
                        )
                    }
                >
                    {__("Contact now", "ninja-drive")}
                </Text>{" "}
                or{" "}
                <Text
                    as="a"
                    color="primary"
                    className="cursor-pointer"
                    onClick={() =>
                        window.open(
                            DOCS.FILE_BROWSER.login.bookAppointmentLink,
                            "_blank",
                        )
                    }
                >
                    {__("Book an appointment!", "ninja-drive")}
                </Text>
            </Text>
        </InlineStack>
    );
};

export default Footer;
