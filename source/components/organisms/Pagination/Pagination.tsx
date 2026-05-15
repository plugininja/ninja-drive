import { useState } from "@wordpress/element";
import { __ } from "@wordpress/i18n";
import Button from "~/components/atoms/Button";
import Card from "~/components/molecules/Card";
import Dropdown from "~/components/molecules/Dropdown";
import Icon from "~/components/atoms/Icon";
import IconButton from "~/components/molecules/IconButton";
import InlineStack from "~/components/molecules/InlineStack";

type PaginationProps = {
    variant?: "small" | "large";
    currentPage: number;
    totalPages: number;
    onPageChange: (page: number) => void;
    className?: string;
};

const Pagination: React.FC<PaginationProps> = ({
    variant = "large",
    currentPage,
    totalPages,
    onPageChange,
    className = "",
}) => {
    if (totalPages <= 1) return null;

    const DOTS = "...";

    const [openDot, setOpenDot] = useState(false);

    const getPaginationRange = (
        current: number,
        total: number,
    ): (number | string)[] => {
        const range: (number | string)[] = [];

        if (total <= 4) return Array.from({ length: total }, (_, i) => i + 1);

        const lastTwo = [total - 1, total];

        if (current <= 2) {
            range.push(current);
            if (current + 1 < total - 2) range.push(current + 1);
            range.push(DOTS);
            range.push(...lastTwo);
            return range;
        }

        if (current >= total - 1) {
            const prevTwo = [total - 3, total - 2].filter((p) => p > 0);
            range.push(...prevTwo);
            range.push(DOTS);
            range.push(...lastTwo);
            return range;
        }

        range.push(current);
        if (current + 1 < total - 2) range.push(current + 1);
        range.push(DOTS);
        range.push(...lastTwo);
        return range;
    };

    const range = getPaginationRange(currentPage, totalPages);

    const hiddenPages = Array.from(
        { length: totalPages },
        (_, i) => i + 1,
    ).filter((p) => !range.includes(p));

    return (
        <InlineStack
            gap={5}
            align="center"
            blockAlign="center"
            className={className}
            margin={"10px 0px"}
        >
            {variant === "large" ? (
                <Button
                    variant="secondary"
                    disabled={currentPage === 1}
                    onClick={() => onPageChange(currentPage - 1)}
                >
                    {__("Prev", "ninja-drive")}
                </Button>
            ) : (
                <IconButton
                    variant="secondary"
                    size="small"
                    name="chevron_backward"
                    disabled={currentPage === 1}
                    onClick={() => onPageChange(currentPage - 1)}
                />
            )}

            {range.map((page, idx) =>
                page === DOTS ? (
                    <Dropdown key={`dots-${idx}`}>
                        <Dropdown.Trigger>
                            <Icon
                                name="more_horiz"
                                fontSize="xl"
                                fontWeight="semibold"
                                style={{ cursor: "pointer" }}
                                onClick={() => setOpenDot(!openDot)}
                            />
                        </Dropdown.Trigger>

                        <Dropdown.Content
                            style={{
                                display: "flex",
                                flexDirection: "column",
                                gap: "4px",
                                maxHeight: "300px",
                                overflowY: "auto",
                                scrollbarWidth: "none",
                            }}
                        >
                            {hiddenPages.map((p) => (
                                <Card
                                    key={p}
                                    padding={2}
                                    rounded="sm"
                                    flex
                                    align="center"
                                    blockAlign="center"
                                    background={
                                        p === currentPage
                                            ? "primary"
                                            : "secondary"
                                    }
                                    style={{ cursor: "pointer" }}
                                    className={
                                        p === currentPage
                                            ? "text-white"
                                            : "text-black"
                                    }
                                    onClick={() => {
                                        onPageChange(p);
                                        setOpenDot(false);
                                    }}
                                >
                                    {p}
                                </Card>
                            ))}
                        </Dropdown.Content>
                    </Dropdown>
                ) : (
                    <Button
                        key={page}
                        variant={page === currentPage ? "primary" : "secondary"}
                        size={variant === "small" ? "small" : "medium"}
                        onClick={() => onPageChange(Number(page))}
                    >
                        {page}
                    </Button>
                ),
            )}

            {variant === "large" ? (
                <Button
                    variant="secondary"
                    disabled={currentPage === totalPages}
                    onClick={() => onPageChange(currentPage + 1)}
                >
                    {__("Next", "ninja-drive")}
                </Button>
            ) : (
                <IconButton
                    variant="secondary"
                    size="small"
                    name="chevron_forward"
                    disabled={currentPage === totalPages}
                    onClick={() => onPageChange(currentPage + 1)}
                />
            )}
        </InlineStack>
    );
};

export default Pagination;
