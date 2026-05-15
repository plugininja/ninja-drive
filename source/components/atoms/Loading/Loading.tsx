import { getFromLocalStorage } from "~/utils/localStorage";
import { PRELOADERS } from "~/constants/preloaders";
import { LoadingProps } from "./Loading.type";

const Loading = ({ id, className }: LoadingProps) => {
    const localLoader = getFromLocalStorage("pnpnd-preloader");

    const loaderNo = localLoader || 1;

    const findLoader = PRELOADERS.find((item) => item.id === loaderNo);

    const loader = findLoader ? findLoader.icon : PRELOADERS[0].icon;

    return <>{loader}</>;
};

export default Loading;
