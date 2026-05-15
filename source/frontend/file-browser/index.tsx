import FileBrowser from "~/components/organisms/Modules/FileBrowser/FileBrowser";
import { ModuleConfig } from "../../types/widget.types";
import FrontendContainer from "../FrontendContainer";
import FrontendInit from "../FrontendInit";

const PreviewFileBrowser = ({ data }: { data: ModuleConfig }) => {
    return (
        <FrontendInit>
            <FrontendContainer data={data}>
                <FileBrowser data={data} />
            </FrontendContainer>
        </FrontendInit>
    );
};

export default PreviewFileBrowser;
