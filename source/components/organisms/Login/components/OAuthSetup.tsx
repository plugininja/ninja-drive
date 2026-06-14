import { useCustomAlert } from "~/components/molecules/Alert";
import { selectSettings } from "~/store/features/settingSlice";
import { useAppSelector } from "~/store/hooks";
import { useState } from "@wordpress/element";
import { __ } from "@wordpress/i18n";

const OAuthSetup = () => {
    const { data } = useAppSelector(selectSettings);
    const { redirect_uri } = data?.accounts || {};

    const [activeStep, setActiveStep] = useState<number | null>(1);

    const { showAlert } = useCustomAlert();

    const toggleStep = (stepNumber: number) => {
        setActiveStep(activeStep === stepNumber ? null : stepNumber);
    };

    const copyToClipboard = async () => {
        try {
            await navigator.clipboard.writeText(redirect_uri || "");

            showAlert({
                toast: true,
                type: "success",
                text: __("Copied to clipboard!", "ninja-drive"),
                timer: 3000,
                timerProgressBar: true,
                showConfirmButton: false,
            });
        } catch (error) {
            console.error(error);

            showAlert({
                toast: true,
                type: "error",
                text: __("Failed to copy link.", "ninja-drive"),
                timer: 3000,
                timerProgressBar: true,
                showConfirmButton: false,
            });
        }
    };

    const steps = [
        {
            number: 1,
            title: __("Create a Google Cloud Project", "ninja-drive"),
            content: (
                <ol className="pnpnd-accordion-card__list">
                    <li>
                        {__("Go to the", "ninja-drive")}{" "}
                        <a
                            href="https://console.cloud.google.com/"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="pnpnd-accordion-card__link"
                        >
                            {__("Google Cloud Console", "ninja-drive")}
                        </a>
                    </li>

                    <li>
                        {__(
                            'Click the project dropdown at the top and select "New Project"',
                            "ninja-drive",
                        )}
                    </li>

                    <li>
                        {__(
                            "Give your project a name and click Create",
                            "ninja-drive",
                        )}
                    </li>

                    <li>
                        {__("Select your newly created project", "ninja-drive")}
                    </li>
                </ol>
            ),
        },

        {
            number: 2,
            title: __("Enable Google Drive API", "ninja-drive"),
            content: (
                <ol className="pnpnd-accordion-card__list">
                    <li>
                        {__("Go to APIs & Services → Library", "ninja-drive")}
                    </li>

                    <li>{__("Search for Google Drive API", "ninja-drive")}</li>

                    <li>{__("Click Enable", "ninja-drive")}</li>
                </ol>
            ),
        },

        {
            number: 3,
            title: __("Create OAuth Credentials", "ninja-drive"),
            content: (
                <ol className="pnpnd-accordion-card__list">
                    <li>
                        {__(
                            "Go to APIs & Services → Credentials",
                            "ninja-drive",
                        )}
                    </li>

                    <li>
                        {__(
                            "Click Create Credentials → OAuth Client ID",
                            "ninja-drive",
                        )}
                    </li>

                    <li>
                        {__(
                            "If prompted, configure the consent screen",
                            "ninja-drive",
                        )}
                    </li>

                    <li>
                        {__(
                            "Select application type as Web Application",
                            "ninja-drive",
                        )}
                    </li>
                </ol>
            ),
        },

        {
            number: 4,
            title: __("Add Redirect URI", "ninja-drive"),
            content: (
                <>
                    <ol className="pnpnd-accordion-card__list">
                        <li>
                            {__(
                                "Under Authorized Redirect URIs click Add URI",
                                "ninja-drive",
                            )}
                        </li>

                        <li>
                            {__("Paste the redirect URL below", "ninja-drive")}
                        </li>
                    </ol>

                    <div className="pnpnd-copy-field">
                        <code className="pnpnd-copy-field__url">
                            {redirect_uri}
                        </code>

                        <button
                            type="button"
                            className="pnpnd-copy-field__button"
                            onClick={copyToClipboard}
                        >
                            {__("Copy", "ninja-drive")}
                        </button>
                    </div>
                </>
            ),
        },

        {
            number: 5,
            title: __("Paste Credentials", "ninja-drive"),
            content: (
                <ol className="pnpnd-accordion-card__list">
                    <li>{__("Copy Client ID", "ninja-drive")}</li>

                    <li>{__("Copy Client Secret", "ninja-drive")}</li>

                    <li>
                        {__(
                            "Paste both credentials into the fields",
                            "ninja-drive",
                        )}
                    </li>

                    <li>{__("Click Sign in With Google", "ninja-drive")}</li>
                </ol>
            ),
        },
    ];

    return (
        <div className="pnpnd-oauth-setup">
            <div className="pnpnd-oauth-accordion">
                {steps.map((step) => {
                    const isActive = activeStep === step.number;

                    return (
                        <div
                            key={step.number}
                            className={`pnpnd-accordion-card ${
                                isActive ? "pnpnd-active" : ""
                            }`}
                        >
                            <button
                                type="button"
                                className="pnpnd-accordion-card__header"
                                onClick={() => toggleStep(step.number)}
                            >
                                <div className="pnpnd-accordion-card__left">
                                    <div className="pnpnd-accordion-card__badge">
                                        {step.number}
                                    </div>

                                    <h3 className="pnpnd-accordion-card__title">
                                        {step.title}
                                    </h3>
                                </div>

                                <span className="pnpnd-accordion-card__icon">
                                    {isActive ? "−" : "+"}
                                </span>
                            </button>

                            {isActive && (
                                <div className="pnpnd-accordion-card__body">
                                    {step.content}
                                </div>
                            )}
                        </div>
                    );
                })}
            </div>
        </div>
    );
};

export default OAuthSetup;
