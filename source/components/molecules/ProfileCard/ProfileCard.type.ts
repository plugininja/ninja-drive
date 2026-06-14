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
    connection_type?: "automatic" | "manual";
}

export interface ProfileCardFullInfoProps {
    account: Account;
    connection_type?: "automatic" | "manual";
}

export interface ProfileCardInfoProps {
    account: Account;
    connection_type?: "automatic" | "manual";
}
