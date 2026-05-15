import "../../widget-builder/widget-builder.js";

(function ($) {
    "use strict";

    const rerenderModules = () => {
        if (window.pnpndRenderModules) {
            window.pnpndRenderModules();
        }
    };

    const IntegrationManager = {
        integrations: {},
        initialized: false,

        /**
         * Register a new integration
         */
        register(name, integration) {
            if (typeof integration.init !== "function") {
                return;
            }

            this.integrations[name] = {
                instance: integration,
                enabled: integration.isEnabled ? integration.isEnabled() : true,
                priority: integration.priority || 10,
            };
        },

        /**
         * Initialize all registered integrations
         */
        initAll() {
            if (this.initialized) return;

            // Sort by priority
            const sorted = Object.entries(this.integrations).sort(
                ([, a], [, b]) => a.priority - b.priority,
            );

            sorted.forEach(([name, { instance, enabled }]) => {
                if (enabled) {
                    try {
                        instance.init();
                    } catch (error) {
                    }
                }
            });

            this.initialized = true;
        },

        /**
         * Get a specific integration
         */
        get(name) {
            return this.integrations[name]?.instance;
        },
    };

    const ElementorIntegration = {
        name: "elementor",
        priority: 20,

        isEnabled() {
            return (
                typeof elementor !== "undefined" ||
                window.pnpnd?.settings?.integrations?.activeIntegrations?.includes(
                    "elementor",
                ) === true
            );
        },

        init() {
            if (
                typeof elementor === "undefined" ||
                !elementor?.channels?.editor
            ) {
                return;
            }

            this.initPromotion();

            $(document).on(
                "click",
                ".pnpnd-configure-widget, [data-event='pnpnd_elementor_settings']",
                function (e) {
                    e.preventDefault();

                    const widgetDataField = window.parent.jQuery(
                        '[data-setting="widget_data"]',
                    );

                    console.dir(widgetDataField);

                    if (!widgetDataField.length) {
                        console.error("Widget data field not found");
                        return;
                    }

                    let widgetData = {};
                    try {
                        widgetData = JSON.parse(widgetDataField.val() || "{}");
                    } catch (err) {
                        console.error("Failed to parse widget data:", err);
                        widgetData = {};
                    }

                    const isProWidget =
                        widgetData?.is_pro === true ||
                        widgetData?.is_pro === "true";

                    if (!window.pnpnd?.isPro && isProWidget) {
                        if (window.PNPNDHelper?.openUpgradePopUp) {
                            window.PNPNDHelper.openUpgradePopUp();
                        } else {
                            console.error(
                                "Upgrade popup function not available",
                            );
                        }
                    } else {
                        ElementorIntegration.initModuleBuilder();
                    }
                },
            );

            $(document).on(
                "change",
                '[data-setting="select_shortcode"]',
                function (e) {
                    const widgetDataField = window.parent.jQuery(
                        '[data-setting="widget_data"]',
                    );
                    if (!widgetDataField.length) {
                        console.error("Widget data field not found");
                        return;
                    }

                    let widgetData = {};
                    try {
                        widgetData = JSON.parse(widgetDataField.val() || "{}");
                    } catch (err) {
                        console.error("Failed to parse widget data:", err);
                        widgetData = {};
                    }

                    const selectedShortcode = $(this).val();

                    widgetData.id = selectedShortcode;
                    widgetData.type = widgetData.type || "file-browser";

                    widgetDataField.val(JSON.stringify(widgetData));
                    widgetDataField.trigger("input");
                },
            );

            window.elementor.channels.editor.off("pnpnd_elementor_settings");
            window.elementor.channels.editor.on(
                "pnpnd_elementor_settings",
                ElementorIntegration.initModuleBuilder,
            );

            $(window).on("elementor/editor/element-rendered", function () {
                window.pnpndRenderModules();
            });
        },

        initModuleBuilder() {
            const widgetDataField = window.parent.jQuery(
                '[data-setting="widget_data"]',
            );

            if (!widgetDataField.length) {
                return;
            }

            let widgetData = {};

            try {
                widgetData = JSON.parse(widgetDataField.val() || "{}");
            } catch (err) {
                console.error("Failed to parse widget data:", err);
                widgetData = {};
            }

            const widgetBuilder =
                window.parent.PNPNDHelper || window.PNPNDHelper;

            if (
                !widgetBuilder ||
                typeof widgetBuilder.openModuleBuilder !== "function"
            ) {
                return;
            }

            widgetBuilder.openModuleBuilder({
                id: widgetData.id || "file-browser",
                type: widgetData.type || "file-browser",
                integration: "elementor",
                onSave: (key, data) => {
                    const { id, type } = data;

                    widgetDataField.val(
                        JSON.stringify({
                            id,
                            type,
                            is_pro: widgetData.is_pro || false,
                        }),
                    );
                    widgetDataField.trigger("input");
                },
            });
        },

        initPromotion() {
            if (typeof parent === "undefined" || !parent.document) {
                return;
            }

            parent.document.addEventListener("mousedown", function (e) {
                const promotionElements = parent.document.querySelectorAll(
                    ".elementor-element--promotion",
                );

                if (promotionElements.length === 0) return;

                for (let i = 0; i < promotionElements.length; i++) {
                    if (!promotionElements[i].contains(e.target)) continue;

                    const dialog = parent.document.querySelector(
                        "#elementor-element--promotion__dialog",
                    );

                    if (!dialog) continue;

                    const iconElement =
                        promotionElements[i].querySelector(".icon > i");
                    if (!iconElement) continue;

                    const iconClass = iconElement.classList.toString();

                    if (iconClass.includes("pnpnd-icon-pro")) {
                        e.stopImmediatePropagation();

                        const actionButtons = dialog.querySelector(
                            ".dialog-buttons-action",
                        );
                        if (actionButtons) {
                            actionButtons.style.display = "none";
                        }

                        if (!dialog.querySelector(".pnpnd-dialog-action")) {
                            const upgradeLink = document.createElement("a");
                            const upgradeText = document.createTextNode(
                                wp?.i18n?.__?.("Upgrade Now", "ninja-drive") ||
                                    "Upgrade Now",
                            );
                            upgradeLink.setAttribute(
                                "href",
                                window.PNPNDHelper?.upgradeUrl || "#",
                            );
                            upgradeLink.setAttribute("target", "_blank");
                            upgradeLink.setAttribute(
                                "rel",
                                "noopener noreferrer",
                            );
                            upgradeLink.classList.add(
                                "elementor-button",
                                "go-pro",
                                "dialog-button",
                                "dialog-action",
                                "pnpnd-dialog-action",
                            );
                            upgradeLink.appendChild(upgradeText);

                            if (actionButtons) {
                                actionButtons.insertAdjacentHTML(
                                    "afterend",
                                    upgradeLink.outerHTML,
                                );
                            }
                        } else {
                            const upgradeBtn = dialog.querySelector(
                                ".pnpnd-dialog-action",
                            );
                            if (upgradeBtn) {
                                upgradeBtn.style.display = "";
                            }
                        }
                    } else {
                        const actionButtons = dialog.querySelector(
                            ".dialog-buttons-action",
                        );
                        if (actionButtons) {
                            actionButtons.style.display = "";
                        }

                        const upgradeBtn = dialog.querySelector(
                            ".pnpnd-dialog-action",
                        );
                        if (upgradeBtn) {
                            upgradeBtn.style.display = "none";
                        }
                    }
                    break;
                }
            });
        },
    };

    const ContactForm7Integration = {
        name: "contactForm7",
        priority: 15,

        isEnabled() {
            return (
                window.pnpnd?.settings?.integrations?.activeIntegrations?.includes(
                    "contactForm7",
                ) === true
            );
        },

        init() {
            this.selectFolder();
        },

        selectFolder() {
            $(document).off("click", "#pnpnd-form-uploader-config-cf7");
            $(document).on(
                "click",
                "#pnpnd-form-uploader-config-cf7",
                function (e) {
                    e.preventDefault();

                    if (
                        !window.PNPNDHelper ||
                        typeof window.PNPNDHelper !== "function"
                    ) {
                        console.error("Widget builder not available");
                        return;
                    }

                    window.PNPNDHelper.openModuleBuilder({
                        rootId: "tag-generator-panel-google_drive",
                        id: "file-uploader",
                        title: "Select Google Drive Folder for File Uploads",
                        integration: "contactForm7",
                        onSave: (key, data) => {
                            const dataField = document.getElementById(
                                "tag-generator-panel-google_drive-data",
                            );

                            if (!dataField) {
                                console.error("Data field not found");
                                return;
                            }

                            if (!data || !data.id) {
                                console.error("Invalid data received");
                                return;
                            }

                            dataField.value = data.id;
                            dataField.dispatchEvent(
                                new Event("change", { bubbles: true }),
                            );
                        },
                    });
                },
            );
        },
    };

    IntegrationManager.register("elementor", ElementorIntegration);
    IntegrationManager.register("contactForm7", ContactForm7Integration);

    $(function () {
        IntegrationManager.initAll();
    });
})(jQuery);
