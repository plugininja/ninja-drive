import { Account } from "~/types/Types";
import { Size } from "~/types/styles";

export interface ProfileCardProps {
    id?: string;
    style?: React.CSSProperties;
    className?: string;
    accounts: Account[];
    fullInfo?: boolean;
    title?: string;
    addAccount?: boolean;
    small?: boolean;
    connectionType?: "automatic" | "manual";
}

export interface ProfileCardFullInfoProps {
    account: Account;
    connectionType?: "automatic" | "manual";
}

export interface ProfileCardInfoProps {
    account: Account;
    connectionType?: "automatic" | "manual";
}
