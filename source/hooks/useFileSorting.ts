import { useEffect, useRef, useState } from "@wordpress/element";
import { OrderBy } from "../types/Types";

export const useFileSorting = () => {
    type TSortingType = {
        editData: { sortingType: { label: string; value: OrderBy } };
    };
    const [sortingType, setSortingType] = useState<TSortingType>({
        editData: {
            sortingType: JSON.parse(
                localStorage.getItem("idbox-file-sorting-type") as string
            ) || {
                label: "Sort By: Modified",
                value: "modified",
            },
        },
    });
    const [sortingOrder, setSortingOrder] = useState<"ASC" | "DESC">(
        (localStorage.getItem("pnpnd-file-sorting-order") as "ASC" | "DESC") ||
            "ASC"
    );
    const firstRender = useRef(true);
    useEffect(() => {
        if (!firstRender.current) {
            // dispatch(
            //   sortFiles({
            //     // sortBy: sortingType.editData.sortingType.value,
            //     sortOrder: sortingOrder,
            //   })
            // );
        } else {
            firstRender.current = false;
        }
    }, [sortingOrder, sortingType]);

    useEffect(() => {
        localStorage.setItem("pnpnd-file-sorting-order", sortingOrder);
    }, [sortingOrder]);

    const handleSortingSelection = (val: {
        sortingType: { label: string; value: string };
    }) => {
        setSortingType({
            editData: {
                sortingType: {
                    label: `Sort By: ${val.sortingType.label}`,
                    value: val.sortingType.value as OrderBy,
                },
            },
        });
        localStorage.setItem(
            "idbox-file-sorting-type",
            JSON.stringify({
                label: `Sort By: ${val.sortingType.label}`,
                value: val.sortingType.value,
            })
        );
    };
    return {
        setSortingType,
        setSortingOrder,
        sortingType,
        sortingOrder,
        handleSortingSelection,
    };
};
