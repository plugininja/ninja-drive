import EmbedDocumentsWrapper from "~/components/organisms/Modules/EmbedDocuments/EmbedDocumentsWrapper";
import { ModuleConfig } from "../../types/widget.types";
import FrontendContainer from "../FrontendContainer";
import FrontendInit from "../FrontendInit";

const PreviewEmbedDocuments = ({ data }: { data: ModuleConfig }) => {
    return (
        <FrontendInit>
            <FrontendContainer data={data}>
                <EmbedDocumentsWrapper data={data} />
            </FrontendContainer>
        </FrontendInit>
    );
};

export default PreviewEmbedDocuments;
