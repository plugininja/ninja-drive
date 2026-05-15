// const document = [
//     "pdf",
//     "docx",
//     "odt",
//     "rtf",
//     "txt",
//     "html",
//     "epub",
//     "zip",
//     "markdown",
// ];

// const presentation = ["pptx", "odp", "pdf", "txt", "jpeg", "png", "svg"];

// const spreadsheet = ["xlsx", "ods", "csv", "tsv", "pdf", "zip"];

// const drawing = ["png", "jpeg", "svg", "pdf"];

// const site = ["txt", "zip"];

// const script = ["json"];

import { __ } from "@wordpress/i18n";

const documentList: { label: string; extension: string }[] = [
    {
        label: __("PDF Document (.pdf)", "ninja-drive"),
        extension: "pdf",
    },
    {
        label: __("Microsoft Word (.docx)", "ninja-drive"),
        extension: "docx",
    },
    {
        label: __("OpenDocument (.odt)", "ninja-drive"),
        extension: "odt",
    },
    {
        label: __("Rich Text (.rtf)", "ninja-drive"),
        extension: "rtf",
    },
    {
        label: __("Plain Text (.txt)", "ninja-drive"),
        extension: "txt",
    },
    {
        label: __("HTML Document (.html)", "ninja-drive"),
        extension: "html",
    },
    {
        label: __("EPUB Publication (.epub)", "ninja-drive"),
        extension: "epub",
    },
    {
        label: __("ZIP Archive (.zip)", "ninja-drive"),
        extension: "zip",
    },
    {
        label: __("Markdown (.md)", "ninja-drive"),
        extension: "markdown",
    },
];

const presentationList: { label: string; extension: string }[] = [
    {
        label: __("Microsoft PowerPoint (.pptx)", "ninja-drive"),
        extension: "pptx",
    },
    {
        label: __("OpenDocument Presentation (.odp)", "ninja-drive"),
        extension: "odp",
    },
    {
        label: __("PDF Document (.pdf)", "ninja-drive"),
        extension: "pdf",
    },
    {
        label: __("Plain Text (.txt)", "ninja-drive"),
        extension: "txt",
    },
    {
        label: __("JPEG Image (.jpeg)", "ninja-drive"),
        extension: "jpeg",
    },
    {
        label: __("PNG Image (.png)", "ninja-drive"),
        extension: "png",
    },
    {
        label: __("SVG Image (.svg)", "ninja-drive"),
        extension: "svg",
    },
];

const spreadsheetList: { label: string; extension: string }[] = [
    {
        label: __("Microsoft Excel (.xlsx)", "ninja-drive"),
        extension: "xlsx",
    },
    {
        label: __("OpenDocument Spreadsheet (.ods)", "ninja-drive"),
        extension: "ods",
    },
    {
        label: __("CSV (.csv)", "ninja-drive"),
        extension: "csv",
    },
    {
        label: __("TSV (.tsv)", "ninja-drive"),
        extension: "tsv",
    },
    {
        label: __("PDF Document (.pdf)", "ninja-drive"),
        extension: "pdf",
    },
    {
        label: __("ZIP Archive (.zip)", "ninja-drive"),
        extension: "zip",
    },
];

const drawingList: { label: string; extension: string }[] = [
    {
        label: __("PNG Image (.png)", "ninja-drive"),
        extension: "png",
    },
    {
        label: __("JPEG Image (.jpeg)", "ninja-drive"),
        extension: "jpeg",
    },
    {
        label: __("SVG Image (.svg)", "ninja-drive"),
        extension: "svg",
    },
    {
        label: __("PDF Document (.pdf)", "ninja-drive"),
        extension: "pdf",
    },
];

const siteList: { label: string; extension: string }[] = [
    {
        label: __("Plain Text (.txt)", "ninja-drive"),
        extension: "txt",
    },
    {
        label: __("ZIP Archive (.zip)", "ninja-drive"),
        extension: "zip",
    },
];

const scriptList: { label: string; extension: string }[] = [
    {
        label: __("JSON (.json)", "ninja-drive"),
        extension: "json",
    },
];

export const saveAsList: Record<
    "document" | "presentation" | "spreadsheet" | "drawing" | "site" | "script",
    { label: string; extension: string }[]
> = {
    document: documentList,
    presentation: presentationList,
    spreadsheet: spreadsheetList,
    drawing: drawingList,
    site: siteList,
    script: scriptList,
};
