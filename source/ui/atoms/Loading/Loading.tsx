import { PRELOADERS } from "~kernel/constants/preloaders";
import { LoadingProps } from "./Loading.type";

const Loading = ({ id, className }: LoadingProps) => {
    const loaderNo = pnpnd?.settings?.appearance?.preloader ?? 1;

    const findLoader = PRELOADERS.find((item) => item.id === loaderNo);

    const loader = findLoader ? findLoader.icon : PRELOADERS[0].icon;

    return <>{loader}</>;
};

export default Loading;
