import { __ } from "@wordpress/i18n";
import { useEffect, useState } from "@wordpress/element";
import OfferIcon from "~/assets/icons/OfferIcon";
import InlineStack from "~/components/molecules/InlineStack";
import Text from "~/components/atoms/Text";

const SALE_END_TIME = new Date("2026-01-26T23:59:59").getTime();

const OfferBar = () => {
    const [timeLeft, setTimeLeft] = useState(SALE_END_TIME - Date.now());

    useEffect(() => {
        const interval = setInterval(() => {
            const diff = SALE_END_TIME - Date.now();
            setTimeLeft(diff > 0 ? diff : 0);
        }, 1000);

        return () => clearInterval(interval);
    }, []);

    const formatTime = (ms: number) => {
        const totalSeconds = Math.floor(ms / 1000);
        const h = Math.floor(totalSeconds / 3600);
        const m = Math.floor((totalSeconds % 3600) / 60);
        const s = totalSeconds % 60;

        return `${h}h ${m}m ${s}s`;
    };

    const handleClick = () => {
        window.open(
            "https://plugininja.com/google-drive-pricing/?utm_source=wordpress-admin&utm_medium=notification&utm_campaign=google-drive-pricing-offer&utm_content=offer-bar",
            "_blank",
        );
    };

    return (
        <InlineStack
            gap={5}
            align="center"
            className="pnpnd-offerbar"
            onClick={handleClick}
        >
            <OfferIcon className="pnpnd-offerbar-offer-icon-left" />

            <Text
                weight="semibold"
                style={{
                    color: "#000e25",
                }}
            >
                {__("3-Day Sale Almost Over! Save", "ninja-drive")}
            </Text>

            <InlineStack>
                <Text
                    weight="semibold"
                    style={{
                        color: "#FF2601",
                    }}
                >
                    {__("Up to 80% Off", "ninja-drive")}
                </Text>

                <Text
                    weight="semibold"
                    style={{
                        color: "#000e25",
                    }}
                >
                    {__("-before it's gone End in", "ninja-drive")}
                </Text>
            </InlineStack>

            <Text weight="bold" className="pnpnd-offerbar-time">
                {formatTime(timeLeft)}
            </Text>

            <OfferIcon className="pnpnd-offerbar-offer-icon-right" />
        </InlineStack>
    );
};

export default OfferBar;
