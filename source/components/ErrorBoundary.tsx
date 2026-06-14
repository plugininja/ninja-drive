import { Component } from "@wordpress/element";
import { __ } from "@wordpress/i18n";

interface ErrorBoundaryProps {
    children: React.ReactNode;
    fallback?: React.ReactNode;
}

interface ErrorBoundaryState {
    hasError: boolean;
}

class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
    constructor(props: ErrorBoundaryProps) {
        super(props);
        this.state = { hasError: false };
    }

    static getDerivedStateFromError(_: Error): ErrorBoundaryState {
        return { hasError: true };
    }

    componentDidCatch(error: Error, info: React.ErrorInfo) {
        console.error("Error caught:", error, info);
    }

    render() {
        const { hasError } = this.state;
        const { fallback, children } = this.props;

        if (hasError) {
            return (
                fallback ?? <h2>{__("Something went wrong", "ninja-drive")}</h2>
            );
        }

        return children;
    }
}

export default ErrorBoundary;
