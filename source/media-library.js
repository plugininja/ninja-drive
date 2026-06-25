import App from "./features/media-library/components/MediaLibrary/App.tsx";
import { CustomAlertProvider } from "~/shared/molecules/Alert/Alert.tsx";
import AuthRoute from "./features/auth/routes/AuthRoute.tsx";
import MainRoute from "./kernel/routes/MainRoute.tsx";
import { createRoot } from "@wordpress/element";
import { store } from "~kernel/store/store.ts";
import { HashRouter } from "react-router-dom";
import { Provider } from "react-redux";

class PNPNDMedia {
    constructor() {
        this.$ = jQuery;
    }

    ready() {
        this.initModule();
    }

    initModule() {
        if (
            pnpnd.pagenow === "upload.php" ||
            pnpnd.pagenow === "post.php" ||
            pnpnd.pagenow === "admin.php"
        ) {
            if (
                this.$('#posts-filter input[name="mode"][value="list"]')
                    .length &&
                this.$("#posts-filter .media").length
            ) {
                this.pageType = "upload-list";
            } else if (this.$("#wp-media-grid").length) {
                this.pageType = "upload-grid";
            }
        }

        if (
            this.$('.upload-php #posts-filter input[name="mode"][value="list"]')
                .length
        ) {
            // this.initTree();
        } else {
            if (this.pageType !== "upload-list") {
                this.initFilter();
            }

            if (
                typeof wp !== "undefined" &&
                wp.media?.view?.AttachmentsBrowser
            ) {
                const $this = this;
                wp.media.view.AttachmentsBrowser.prototype.on(
                    "ready",
                    function () {
                        $this.initTree();
                        if ($this.pageType !== "upload-list") {
                            $this.addAttachmentClass();
                        }
                    },
                );
            }
        }

        let featuredImageController = wp?.media?.controller?.FeaturedImage;

        if (featuredImageController) {
            const $this = this;
            wp.media.controller.FeaturedImage = featuredImageController.extend({
                updateSelection: function () {
                    featuredImageController.prototype.updateSelection.apply(
                        this,
                        arguments,
                    );
                    $this.initTree();
                },
            });
        }

        let uploaderInlineView = wp?.media?.view?.UploaderInline;
        if (uploaderInlineView) {
            const $this = this;
            wp.media.view.UploaderInline = uploaderInlineView.extend({
                ready: function () {
                    uploaderInlineView.prototype.ready.apply(this, arguments);
                    $this.initTree();
                },
            });
        }

        if (this.pageType !== "upload-list") {
            this.onModalOpen();
            this.handleUploader();
            this.handleUploadStatus();
        }
    }

    getFrame() {
        if (this.pageType === "upload-list") {
            return this.$(".upload-php #posts-filter");
        }

        const visibleModal = this.$(".media-modal:visible");

        return visibleModal.length
            ? visibleModal.find(".media-frame")
            : this.$(".upload-php .media-frame").first();
    }

    initTree(frame = this.getFrame()) {
        const $frame = this.$(frame);

        const isModalVisible = this.$(".media-modal:visible").length > 0;
        const isUploadView =
            this.pageType === "upload-list" || this.pageType === "upload-grid";
        const windowWidth = this.$(window).width();

        if (windowWidth <= 900) return;

        let treeExists;
        if (isModalVisible || !isUploadView) {
            if ($frame.hasClass("hide-menu")) {
                const placeholderText = $frame
                    .find(".media-search-input-label")
                    .text();
                $frame
                    .find("#media-search-input")
                    .attr("placeholder", placeholderText);

                if (windowWidth > 768) {
                    $frame.addClass("pnpnd-tree-view").removeClass("hide-menu");
                }
            }

            treeExists =
                $frame.find(".media-frame-menu .pnpnd-media-tree-wrap").length >
                0;
        } else {
            treeExists =
                this.$(".upload-php .pnpnd-media-tree-wrap").length > 0;
        }

        if (treeExists) {
            if (
                !isUploadView &&
                wp.media.frame &&
                wp.media.frame._state === "gallery-edit"
            ) {
                const treeElement = this.getTreeElement(frame);
                if (treeElement.length) {
                    ReactDOM.unmountComponentAtNode(treeElement[0]);
                    treeElement.remove();
                }
            } else {
                this.getTreeElement().show();
            }
            return;
        }

        if (isModalVisible || !isUploadView) {
            let menuContainer = $frame.find(".media-frame-menu .media-menu");
            if (!menuContainer.length) {
                menuContainer = $frame.find(".media-frame-menu");
                $frame.find(".media-frame-menu-heading").hide();
            }

            if (!menuContainer.find(".pnpnd-media-tree-wrap").length) {
                this.$(
                    '<div pnpnd-theme-status="light" id="pnpnd-media-library-sidebar-wrapper" class="pnpnd-media-tree-wrap pnpnd-top-level-wrapper"></div>',
                ).appendTo(menuContainer);
            }
        } else {
            const insertBeforeElement =
                windowWidth < 600
                    ? this.$("ul.attachments")
                    : this.$("#wpbody-content");

            if (!this.$(".upload-php .pnpnd-media-tree-wrap").length) {
                this.$(
                    '<div pnpnd-theme-status="light" id="pnpnd-media-library-sidebar-wrapper" class="pnpnd-media-tree-wrap pnpnd-top-level-wrapper"></div>',
                ).insertBefore(insertBeforeElement);
            }
        }

        const treeElement = this.getTreeElement(frame);

        if (treeElement.length) {
            const root = createRoot(treeElement[0]);
            root.render(
                <HashRouter>
                    <Provider store={store}>
                        <CustomAlertProvider>
                            <MainRoute>
                                <AuthRoute skipAuthGuard loadingSkip>
                                    <App />
                                </AuthRoute>
                            </MainRoute>
                        </CustomAlertProvider>
                    </Provider>
                </HashRouter>,
            );
        }

        this.$(
            '<div pnpnd-theme-status="light" id="pnpnd-breadcrumb" class="pnpnd-main-tree pnpnd-top-level-wrapper"></div>',
        ).insertBefore(this.$("ul.attachments"));

        if (!$frame.find(".pnpnd-media-toggle-actions").length) {
            this.initActionsToggle($frame);
        }
    }

    getTreeElement(frame = this.getFrame()) {
        const isModalVisible = this.$(".media-modal:visible").length > 0;
        const isUploadView =
            this.pageType === "upload-grid" || this.pageType === "upload-list";

        if (isModalVisible || !isUploadView) {
            return frame.find(".pnpnd-media-tree-wrap").first();
        } else {
            return this.$(".upload-php .pnpnd-media-tree-wrap");
        }
    }

    initActionsToggle(frame = this.getFrame()) {
        const menuHeading = frame.find(".media-frame-menu-heading");
        menuHeading.append(
            '<i class="pnpnd-media-toggle-actions dashicons dashicons-arrow-down"></i>',
        );

        menuHeading.on("click", () => {
            frame.find(".media-menu").toggleClass("show-actions");
        });
    }

    initFilter(filters = [], isRefresh = false) {
        const rootFolders =
            pnpnd?.settings?.integrations?.media_library?.folders ?? [];
        const activeAccount = Object.values(
            pnpnd?.current_user?.can?.accounts_manage ? pnpnd?.accounts : {},
        ).find((acc) => acc.active === 1);

        const filterRootFolderForActiveAccount = rootFolders.filter(
            (folder) => folder.account_id === (activeAccount?.id || null),
        );

        if (wp?.media?.view?.AttachmentFilters) {
            wp.media.view.AttachmentFilters.pnpnd_media_filter =
                wp.media.view.AttachmentFilters.extend({
                    className: "pnpnd-media-folder-filter",
                    id: "pnpnd-media-folder-filter",

                    createFilters() {
                        const filtersMap = {};

                        filtersMap.all = {
                            text: wp.i18n.__("Media Library", "ninja-drive"),
                            props: {
                                file_key: null,
                                account_id: null,
                                isRefresh: null,
                                timeStamp: null,
                            },
                        };

                        // Google Drive root
                        filtersMap.pnpnd = {
                            text: wp.i18n.__("Google Drive", "ninja-drive"),
                            props: {
                                file_key: "pnpnd",
                                account_id: activeAccount?.id ?? null,
                                posts_per_page: 40,
                                orderby: "name",
                                order: "asc",
                            },
                        };

                        filtersMap.trash = {
                            text: wp.i18n.__("Trash", "ninja-drive"),
                            props: {
                                file_key: "trash",
                                account_id: activeAccount?.id ?? null,
                                posts_per_page: 40,
                                orderby: "name",
                                order: "asc",
                            },
                        };

                        [
                            ...(filterRootFolderForActiveAccount || []),
                            ...(filters || []),
                        ].forEach((filter) => {
                            if (!filter?.file_key) {
                                return;
                            }

                            const v = {
                                file_key: filter.file_key,
                                account_id:
                                    filter.account_id ??
                                    activeAccount?.id ??
                                    null,
                            };

                            isRefresh &&
                                ((v.isRefresh = true),
                                (v.timeStamp = Date.now()));

                            filtersMap[filter.file_key] = {
                                text: filter.name,
                                props: v,
                            };
                        });

                        this.filters = filtersMap;
                    },
                });
        }

        const AttachmentsBrowser = wp?.media?.view?.AttachmentsBrowser;
        if (typeof AttachmentsBrowser !== "undefined") {
            const $this = this;
            wp.media.view.AttachmentsBrowser =
                wp.media.view.AttachmentsBrowser.extend({
                    createToolbar() {
                        this.$el.data("backboneView", this);
                        AttachmentsBrowser.prototype.createToolbar.apply(
                            this,
                            arguments,
                        );
                        $this.attachmentsBrowser = this;
                        this.toolbar.set(
                            "pnpnd-media-folder-filter",
                            new wp.media.view.AttachmentFilters.pnpnd_media_filter(
                                {
                                    controller: this.controller,
                                    model: this.collection.props,
                                    priority: -75,
                                },
                            ).render(),
                        );
                    },
                });

            if (this.attachmentsBrowser) {
                this.attachmentsBrowser.toolbar.set(
                    "pnpnd-media-folder-filter",
                    new wp.media.view.AttachmentFilters.pnpnd_media_filter({
                        controller: this.attachmentsBrowser.controller,
                        model: this.attachmentsBrowser.collection.props,
                        priority: -75,
                    }).render(),
                );
            }
        }
    }

    addAttachmentClass() {
        // TODO
    }

    onModalOpen() {
        const OriginalModal = wp?.media?.view?.Modal;

        if (typeof OriginalModal !== "undefined") {
            const $this = this;
            wp.media.view.Modal = OriginalModal.extend({
                open: function () {
                    OriginalModal.prototype.open.apply(this, arguments);

                    const attachmentDetails = $this.$(".attachment-details");

                    const inputName = attachmentDetails
                        .find('input[name^="attachments["]')
                        .attr("name");
                    const attachmentIdMatch = inputName
                        ? inputName.match(/attachments\[(\d+)\]\[menu_order\]/)
                        : null;
                    const attachmentId = attachmentIdMatch
                        ? attachmentIdMatch[1]
                        : null;

                    if (
                        attachmentId &&
                        wp.media
                            .attachment(attachmentId)
                            .get("pnpnd_media_replace_id")
                    ) {
                        const thumbnail = attachmentDetails.find(".thumbnail");

                        thumbnail.addClass("pnpnd-media-replaced");

                        if (
                            thumbnail.find(".pnpnd-media-replaced-label")
                                .length === 0
                        ) {
                            const replacedLabel = `<span class="pnpnd-media-replaced-label dashicons dashicons-update-alt" title="${wp.i18n.__(
                                "Replaced with Google Drive",
                                "ninja-drive",
                            )}"></span>`;
                            thumbnail.append(replacedLabel);
                        }
                    }
                },
            });
        }
    }

    handleUploader() {}

    handleUploadStatus() {}
}

const mediaModule = new PNPNDMedia();

window.pnpndMedia = mediaModule;
mediaModule.ready();
