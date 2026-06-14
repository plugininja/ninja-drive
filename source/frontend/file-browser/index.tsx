import FileBrowser from "~/components/organisms/Modules/FileBrowser/FileBrowser";
import { ModuleConfig } from "../../types/widget.types";
import FrontendContainer from "../FrontendContainer";
import { useState } from "@wordpress/element";
import FrontendInit from "../FrontendInit";

const PreviewFileBrowser = ({ data }: { data: ModuleConfig }) => {
    const [widgetData, setWidgetData] = useState<ModuleConfig>(data);

    return (
        <FrontendInit>
            <FrontendContainer data={widgetData} setWidgetData={setWidgetData}>
                <FileBrowser data={widgetData} />
            </FrontendContainer>
        </FrontendInit>
    );
};

export default PreviewFileBrowser;
