import EmbedDocumentsWrapper from "~/components/organisms/Modules/EmbedDocuments/EmbedDocumentsWrapper";
import { ModuleConfig } from "../../types/widget.types";
import FrontendContainer from "../FrontendContainer";
import { useState } from "@wordpress/element";
import FrontendInit from "../FrontendInit";

const PreviewEmbedDocuments = ({ data }: { data: ModuleConfig }) => {
    const [widgetData, setWidgetData] = useState<ModuleConfig>(data);

    return (
        <FrontendInit>
            <FrontendContainer data={widgetData} setWidgetData={setWidgetData}>
                <EmbedDocumentsWrapper data={widgetData} />
            </FrontendContainer>
        </FrontendInit>
    );
};

export default PreviewEmbedDocuments;
