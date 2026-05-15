import type { TAppDispatch, TRootState } from "./store";
import { useDispatch, useSelector } from "react-redux";

export const useAppSelector = useSelector.withTypes<TRootState>();
export const useAppDispatch = useDispatch.withTypes<TAppDispatch>();
