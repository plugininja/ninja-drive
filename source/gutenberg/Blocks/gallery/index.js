import BlockIcon from "../../components/BlockIcon.tsx";
import { registerBlockType } from "@wordpress/blocks";
import metadata from "./block.json";
import Edit from "./edit.js";

registerBlockType(metadata.name, {
    icon: <BlockIcon name="imagesmode" />,
    edit: Edit,
});
