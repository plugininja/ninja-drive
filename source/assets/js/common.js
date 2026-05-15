import "../../frontend/renderModules.tsx";

(function ($) {
    class PNPNDMediaInserter {
        constructor(buttonSelector, textareaSelector = "#content") {
            this.buttonSelector = buttonSelector;
            this.textareaSelector = textareaSelector;

            this.init();
        }

        init() {
            $(document).ready(() => {
                $(this.buttonSelector).on("click", (e) =>
                    this.handleButtonClick(e),
                );
            });
        }

        handleButtonClick(e) {
            e.preventDefault();

            if (!this.isEditorAvailable()) {
                alert(
                    "No editor is currently available. Please make sure you are on a post/page edit screen.",
                );
                return;
            }

            window.PNPNDHelper.openFileSelector({
                title: "Select Google Drive Files",
                fileTypes: [
                    "image",
                    "video",
                    "audio",
                    "pdf",
                    "document",
                    "folder",
                ],
                onConfirm: (files) => {
                    if (files && files.length) {
                        this.insertWithBestMethod(files);
                    }
                },
            });
        }

        isEditorAvailable() {
            if (
                typeof tinymce !== "undefined" &&
                tinymce.activeEditor &&
                !tinymce.activeEditor.isHidden()
            ) {
                return true;
            }

            return $(this.textareaSelector).length > 0;
        }

        insertWithBestMethod(files) {
            files.forEach((file) => {

                const fileUrl = window.PNPNDHelper.getUrl(
                    "thumbnail",
                    file.fileKey,
                    file.name,
                    null,
                    "2xl",
                    file.extension,
                );

                const imgHtml = `<a href="${fileUrl}" target="_blank" rel="noopener noreferrer"><img src="${fileUrl}" alt="${file.name}" style="max-width: 100%; height: auto;" /></a><p></p>`;

                if (
                    typeof tinymce !== "undefined" &&
                    tinymce.activeEditor &&
                    !tinymce.activeEditor.isHidden()
                ) {
                    this.insertToTinyMCE(imgHtml);
                } else {
                    this.insertToTextarea(imgHtml);
                }
            });
        }

        insertToTinyMCE(content) {
            const editor = tinymce.activeEditor;
            editor.execCommand("mceInsertContent", false, content);
            editor.focus();
            editor.fire("change");
        }

        insertToTextarea(content) {
            const textarea = $(this.textareaSelector);

            if (textarea.length) {
                const cursorPos =
                    textarea.prop("selectionStart") || textarea.val().length;
                const textBefore = textarea.val().substring(0, cursorPos);
                const textAfter = textarea.val().substring(cursorPos);

                textarea.val(textBefore + content + textAfter);

                const newPos = cursorPos + content.length;
                textarea.prop("selectionStart", newPos);
                textarea.prop("selectionEnd", newPos);

                textarea.trigger("change").focus();
            } else {
                alert("Could not insert content - no editor found");
            }
        }
    }

    class PNPNDHelper {
        static isMobile() {
            return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
                navigator.userAgent,
            );
        }

        static pnpndTitleToUrlSlug(filename) {
            if (!filename) return "unknown-file";

            filename = filename.normalize("NFC");
            filename = filename.replace(
                /[\/\\?<>:*|"`~!@#$%^&()+={}\[\];',]+/g,
                "",
            );
            filename = filename.replace(/\s+/g, "-");
            filename = filename.replace(/-+/g, "-");
            filename = filename.replace(/\.{2,}/g, ".");
            filename = filename.replace(/^[.\-_]+|[.\-_]+$/g, "");

            filename = filename.toLowerCase();

            return filename;
        }

        static getUrl(
            action,
            key,
            name,
            shortcodeId = null,
            size = "xl",
            extension = "jpg",
        ) {
            if (!action || !key || !name || !extension) {
                return "";
            }

            const sanitizeText = (str) => String(str).toLowerCase().trim();

            const cleanName = name.replace("." + extension, "");

            name = this.pnpndTitleToUrlSlug(cleanName);
            extension = sanitizeText(extension);
            size = sanitizeText(size);

            const allowedSizes = [
                "sm",
                "md",
                "lg",
                "xl",
                "2xl",
                "3xl",
                "4xl",
                "5xl",
            ];

            if (!allowedSizes.includes(size)) {
                size = null;
            }

            const baseUrl = pnpnd.siteUrl || window.location.origin;
            const actionPart = shortcodeId
                ? `${action}-${shortcodeId}`
                : action;

            const namePart = size ? `${name}-${size}` : name;

            const allowDotExtension =
                pnpnd.settings?.advanced?.allowDotExtension ?? true;

            if (!allowDotExtension) {
                return `${baseUrl}/pnpnd/${actionPart}/${key}/${namePart}/${extension}/`;
            }

            let url;
            if (shortcodeId) {
                url = `${baseUrl}/pnpnd/${actionPart}/${key}/${namePart}/${extension}/`;
            } else {
                url = `${baseUrl}/pnpnd/${actionPart}/${key}/${namePart}/${extension}/`;
            }

            return url;
        }

        static openUpgradePopUp() {
            const closeModal = () => {
                upgradePopUp.remove();
            };

            const upgradePopUp = window.toast.show({
                theme: "light",
                width: "550px",
                variant: "modal",
                component: (
                    // <UpgradePopUp
                    //     closeModal={closeModal}
                    //     upgradeUrl={pnpnd.upgradeUrl}
                    // />
                    <div>Upgrade</div>
                ),
            });
        }
    }

    // Initialize the class
    new PNPNDMediaInserter("#pnpnd-media-button");
    window.PNPNDHelper = PNPNDHelper;
})(jQuery);
