import { Card, Dropdown, IconButton, InlineStack } from "~/ui/molecules";
import { Button, Icon, Text } from "~/ui/atoms";
import { __ } from "@wordpress/i18n";
import type { FC } from "react";

type PaginationProps = {
    variant?: "small" | "large";
    current_page: number;
    total_pages: number;
    onPageChange: (page: number) => void;
    style?: React.CSSProperties;
    className?: string;
};

const MAX_VISIBLE = 4;

const Pagination: FC<PaginationProps> = ({
    variant = "large",
    current_page,
    total_pages,
    onPageChange,
    style,
    className = "",
}) => {
    if (total_pages <= 1) return null;

    const DOTS = "...";

    const getPaginationRange = (
        current: number,
        total: number,
    ): (number | string)[] => {
        if (total <= MAX_VISIBLE) {
            return Array.from({ length: total }, (_, i) => i + 1);
        }

        let start = current - 1;
        let end = current + 2;

        if (start < 1) {
            start = 1;
            end = MAX_VISIBLE;
        }

        if (end > total) {
            end = total;
            start = total - MAX_VISIBLE + 1;
        }

        const pages = Array.from(
            { length: end - start + 1 },
            (_, i) => start + i,
        );

        const result: (number | string)[] = [];

        if (pages[0] > 1) {
            result.push(DOTS);
        }

        result.push(...pages);

        if (pages[pages.length - 1] < total) {
            result.push(DOTS);
        }

        return result;
    };

    const range = getPaginationRange(current_page, total_pages);

    const visibleNumbers = range.filter((r) => r !== DOTS) as number[];

    const hiddenPages = Array.from(
        { length: total_pages },
        (_, i) => i + 1,
    ).filter((p) => !visibleNumbers.includes(p));

    const firstVisible = visibleNumbers[0];
    const leftHidden = hiddenPages.filter((p) => p < firstVisible);

    const lastVisible = visibleNumbers[visibleNumbers.length - 1];
    const rightHidden = hiddenPages.filter((p) => p > lastVisible);

    return (
        <InlineStack
            gap={5}
            align="center"
            blockAlign="center"
            style={style}
            className={className}
        >
            {variant === "large" ? (
                <Button
                    variant="outlined"
                    disabled={current_page === 1}
                    onClick={() => onPageChange(current_page - 1)}
                >
                    {__("Prev", "ninja-drive")}
                </Button>
            ) : (
                <IconButton
                    variant="outlined"
                    size="small"
                    name="chevron_backward"
                    disabled={current_page === 1}
                    onClick={() => onPageChange(current_page - 1)}
                />
            )}

            {range.map((page, index) =>
                page === DOTS ? (
                    <Dropdown key={`dots-${index}`}>
                        <Dropdown.Trigger>
                            <Icon
                                name="more_horiz"
                                fontSize="xl"
                                fontWeight="semibold"
                                style={{
                                    cursor: "pointer",
                                    userSelect: "none",
                                }}
                            />
                        </Dropdown.Trigger>

                        <Dropdown.Content
                            position={{
                                bottom: "170%",
                                left: 0,
                            }}
                            style={{
                                display: "flex",
                                flexDirection: "column",
                                gap: "4px",
                                maxHeight: "300px",
                                overflowY: "auto",
                                scrollbarWidth: "none",
                            }}
                        >
                            {(index === 0 ? leftHidden : rightHidden).map(
                                (p) => (
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
                                                : "primary-extralight"
                                        }
                                        style={{
                                            cursor: "pointer",
                                            minWidth: "32px",
                                            height: "32px",
                                        }}
                                        className={
                                            p === current_page
                                                ? "text-white"
                                                : "text-black"
                                        }
                                        onClick={() => onPageChange(p)}
                                    >
                                        <Text size="sm">{p}</Text>
                                    </Card>
                                ),
                            )}
                        </Dropdown.Content>
                    </Dropdown>
                ) : (
                    <Button
                        key={page}
                        variant={page === current_page ? "primary" : "outlined"}
                        size={variant === "small" ? "small" : "medium"}
                        onClick={() => onPageChange(Number(page))}
                    >
                        {page}
                    </Button>
                ),
            )}

            {variant === "large" ? (
                <Button
                    variant="outlined"
                    disabled={current_page === total_pages}
                    onClick={() => onPageChange(current_page + 1)}
                >
                    {__("Next", "ninja-drive")}
                </Button>
            ) : (
                <IconButton
                    variant="outlined"
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

export const PAGE_OPTIONS: { name: string; value: string }[] = [
    { name: __("5/Page", "ninja-drive"), value: "5" },
    { name: __("10/Page", "ninja-drive"), value: "10" },
    { name: __("20/Page", "ninja-drive"), value: "20" },
    { name: __("50/Page", "ninja-drive"), value: "50" },
    { name: __("100/Page", "ninja-drive"), value: "100" },
];
