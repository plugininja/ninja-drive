import { useLocation, useNavigate } from "react-router-dom";
import { useCallback, useMemo } from "@wordpress/element";

export const DEFAULT_SORT = "name";
export const DEFAULT_ORDER = "ASC";

const useQueryParams = () => {
    const location = useLocation();
    const navigate = useNavigate();

    const queryParams = useMemo(() => {
        return new URLSearchParams(location.search);
    }, [location.search]);

    const getQueryParam = useCallback(
        (key: string): string | null => {
            return queryParams.get(key);
        },
        [queryParams],
    );

    const getAllQueryParams = useCallback(() => {
        const params: { [key: string]: string } = {};
        queryParams.forEach((value, key) => {
            params[key] = value;
        });
        return params;
    }, [queryParams]);

    const updateQueryParams = useCallback(
        (newParams: { [key: string]: string | null }) => {
            const updatedParams = new URLSearchParams(location.search);

            Object.entries(newParams).forEach(([key, value]) => {
                if (value === null) {
                    updatedParams.delete(key);
                } else {
                    updatedParams.set(key, value);
                }
            });

            navigate(`?${updatedParams.toString()}`, { replace: true });
        },
        [location.search, navigate],
    );

    return {
        getQueryParam,
        getAllQueryParams,
        updateQueryParams,
    };
};

export default useQueryParams;
