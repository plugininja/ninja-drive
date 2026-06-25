import Gallery from "~features/widget-builder/components/Modules/Gallery/Gallery";
import { ModuleConfig } from "~/features/widget-builder";
import FrontendContainer from "../FrontendContainer";
import { useState } from "@wordpress/element";
import FrontendInit from "../FrontendInit";

const PreviewGallery = ({ data }: { data: ModuleConfig }) => {
    const [widgetData, setWidgetData] = useState<ModuleConfig>(data);

    return (
        <FrontendInit>
            <FrontendContainer data={widgetData} setWidgetData={setWidgetData}>
                <Gallery data={widgetData} />
            </FrontendContainer>
        </FrontendInit>
    );
};

export default PreviewGallery;
