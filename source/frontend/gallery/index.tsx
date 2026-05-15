import Gallery from "~/components/organisms/Modules/Gallery/Gallery";
import { ModuleConfig } from "../../types/widget.types";
import FrontendContainer from "../FrontendContainer";
import FrontendInit from "../FrontendInit";

const PreviewGallery = ({ data }: { data: ModuleConfig }) => {
    return (
        <FrontendInit>
            <FrontendContainer data={data}>
                <Gallery data={data} />
            </FrontendContainer>
        </FrontendInit>
    );
};

export default PreviewGallery;
