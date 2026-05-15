import ContactForm7Icon from "~/assets/icons/ContactForm7Icon";
import { ElementorIcon } from "~/assets/icons/ElementorIcon";
import FluentFormsIcon from "~/assets/icons/FluentFormsIcon";
import FormidableFormsIcon from "~/assets/icons/FormidableFormsIcon";
import GutenBergIcon from "~/assets/icons/GutenBergIcon";
import NinjaFormsIcon from "~/assets/icons/NinjaFormsIcon";
import WPFormsIcon from "~/assets/icons/WPFormsIcon";
import Card from "~/components/molecules/Card";

const IntegrationIcon = ({
    id,
}: {
    id:
        | "elementor"
        | "gutenberg"
        | "contactForm7"
        | "wpforms"
        | "ninjaForms"
        | "fluentForms"
        | "formidableForms";
}) => {
    return (
        <Card
            padding={5}
            background="white"
            flex
            align="center"
            blockAlign="center"
            widthFull={false}
            style={{
                borderRadius: "6px",
            }}
            className="pnpnd-integration-icon"
        >
            {id === "elementor" && <ElementorIcon />}
            {id === "gutenberg" && <GutenBergIcon />}
            {id === "contactForm7" && <ContactForm7Icon />}
            {id === "wpforms" && <WPFormsIcon />}
            {id === "ninjaForms" && <NinjaFormsIcon />}
            {id === "fluentForms" && <FluentFormsIcon />}
            {id === "formidableForms" && <FormidableFormsIcon />}
        </Card>
    );
};

export default IntegrationIcon;
