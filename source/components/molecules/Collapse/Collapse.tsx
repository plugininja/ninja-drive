import { CollapseProps } from "./Collapse.type";

const Collapse = ({ collapse, children, style }: CollapseProps) => {
    return (
        <div
            style={{
                ...style,
                display: "grid",
                gridTemplateRows: collapse ? "0fr" : "1fr",
                transition: "grid-template-rows 0.3s ease",
            }}
        >
            <div
                style={{
                    overflow: "hidden",
                }}
            >
                {children}
            </div>
        </div>
    );
};

export default Collapse;
