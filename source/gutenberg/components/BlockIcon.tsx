import { toBoolean } from "~/utils/functions";
import Icon from "~/components/atoms/Icon";

const BlockIcon = ({ name, isPro }: { name: string; isPro: boolean }) => {
    return (
        <div className="pnpnd-top-level-wrapper pnpnd-block-icon-wrapper">

            <Icon name={name} fontSize="2xl" color="primary" />
        </div>
    );
};

export default BlockIcon;
