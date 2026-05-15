import { StatusProps } from "~/components/atoms/Status/Status.type";
import {
    BackgroundColor,
    BorderColor,
    BorderRadius,
    BorderStyle,
} from "~/types/styles";

interface SettingsField {
    id?: string;
    style?: React.CSSProperties;
    className?: string;
    title?: React.ReactNode;
    description?: string;
    docLink?: string;
    background?: BackgroundColor;
    border?: BorderColor;
    borderStyle?: BorderStyle;
    rounded?: BorderRadius;
    gap?: string | number;
    children?: React.ReactNode;
    isIgnoreChildren?: boolean;
    action?: React.ReactNode;
    secondaryAction?: React.ReactNode;
    statusProps?: StatusProps;
}

export interface SettingsFieldProps extends React.FC<SettingsField> {
    SubField: React.FC<SettingsSubFieldProps>;
}

export interface SettingsSubFieldProps extends SettingsField {
    depend?: boolean;
    dependOn?: string;
}
