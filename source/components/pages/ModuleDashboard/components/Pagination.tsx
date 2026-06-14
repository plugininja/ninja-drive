import InlineStack from "~/components/molecules/InlineStack";
import IconButton from "~/components/molecules/IconButton";
import Dropdown from "~/components/molecules/Dropdown";
import Card from "~/components/molecules/Card";
import Button from "~/components/atoms/Button";
import { useState } from "@wordpress/element";
import Icon from "~/components/atoms/Icon";
import { __ } from "@wordpress/i18n";
import type { FC } from "react";

type PaginationProps = {
    variant?: "small" | "large";
    current_page: number;
    total_pages: number;
    onPageChange: (page: number) => void;
    className?: string;
};

const Pagination: FC<PaginationProps> = ({
    variant = "large",
    current_page,
    total_pages,
    onPageChange,
    className = "",
}) => {
    if (total_pages <= 1) return null;

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

    const range = getPaginationRange(current_page, total_pages);

    const hiddenPages = Array.from(
        { length: total_pages },
        (_, i) => i + 1,
    ).filter((p) => !range.includes(p));

    return (
        <InlineStack
            gap={5}
            align="center"
            blockAlign="center"
            className={className}
        >
            {variant === "large" ? (
                <Button
                    variant="secondary"
                    disabled={current_page === 1}
                    onClick={() => onPageChange(current_page - 1)}
                >
                    {__("Prev", "ninja-drive")}
                </Button>
            ) : (
                <IconButton
                    variant="secondary"
                    size="small"
                    name="chevron_backward"
                    disabled={current_page === 1}
                    onClick={() => onPageChange(current_page - 1)}
                />
            )}

            {range.map((page, index) =>
                page === DOTS ? (
                    <Dropdown key={index}>
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
                                    padding={5}
                                    rounded="sm"
                                    flex
                                    align="center"
                                    blockAlign="center"
                                    background={
                                        p === current_page
                                            ? "primary"
                                            : "secondary"
                                    }
                                    style={{ cursor: "pointer" }}
                                    className={
                                        p === current_page
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
                        variant={
                            page === current_page ? "primary" : "secondary"
                        }
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
                    disabled={current_page === total_pages}
                    onClick={() => onPageChange(current_page + 1)}
                >
                    {__("Next", "ninja-drive")}
                </Button>
            ) : (
                <IconButton
                    variant="secondary"
                    size="small"
                    name="chevron_forward"
                    disabled={current_page === total_pages}
                    onClick={() => onPageChange(current_page + 1)}
                />
            )}
        </InlineStack>
    );
};

export default Pagination;
