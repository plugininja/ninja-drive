import { Card } from "~/ui/molecules";
import {
    classicEditorIcon,
    contactForm7Icon,
    eddIcon,
    elementorFormIcon,
    elementorIcon,
    fluentFormsIcon,
    formidableFormsIcon,
    gravityFormsIcon,
    gutenBergIcon,
    masterStudyLmsIcon,
    mediaLibraryIcon,
    ninjaFormsIcon,
    tutorLmsIcon,
    wooCommerceIcon,
    wpFormsIcon,
} from "~kernel/utils/icons";

const iconMap: Record<string, string> = {
    media_library: mediaLibraryIcon,
    classic_editor: classicEditorIcon,
    gutenberg: gutenBergIcon,
    elementor: elementorIcon,
    woocommerce: wooCommerceIcon,
    easy_digital_downloads: eddIcon,
    tutor_lms: tutorLmsIcon,
    elementor_form_upload: elementorFormIcon,
    contact_form_7: contactForm7Icon,
    wp_forms: wpFormsIcon,
    ninja_forms: ninjaFormsIcon,
    fluent_forms: fluentFormsIcon,
    gravity_form: gravityFormsIcon,
    formidable_forms: formidableFormsIcon,
    master_study_lms: masterStudyLmsIcon,
};

const IntegrationIcon = ({
    id,
}: {
    id:
        | "media_library"
        | "classic_editor"
        | "gutenberg"
        | "elementor"
        | "woocommerce"
        | "easy_digital_downloads"
        | "tutor_lms"
        | "elementor_form_upload"
        | "contact_form_7"
        | "wp_forms"
        | "ninja_forms"
        | "fluent_forms"
        | "gravity_form"
        | "formidable_forms"
        | "master_study_lms";
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
            <img
                src={iconMap[id]}
                alt={id}
                style={{ width: "14px", height: "14px" }}
            />
        </Card>
    );
};

export default IntegrationIcon;
