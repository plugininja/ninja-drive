import BlockContainer from "../../components/BlockContainer.tsx";

export default function Edit({ attributes, setAttributes }) {
    return (
        <BlockContainer
            attributes={attributes}
            setAttributes={setAttributes}
            isPro={false}
        />
    );
}
