import { useState, useRef, useEffect, useMemo } from "@wordpress/element";
import { useNavigate } from "react-router-dom";
import { Icon, Text } from "~/ui/atoms";
import { __ } from "@wordpress/i18n";
import clsx from "clsx";
import {
    SETTINGS_SEARCH_INDEX,
    SettingsSearchItem,
} from "~features/settings/constants/settingsSearch";

const SettingsSearch = () => {
    const navigate = useNavigate();

    const [isOpen, setIsOpen] = useState(false);
    const [searchTerm, setSearchTerm] = useState("");
    const [activeIndex, setActiveIndex] = useState(-1);
    const inputRef = useRef<HTMLInputElement>(null);
    const listRef = useRef<HTMLDivElement>(null);

    const isPluginPage = window.location.href.includes("page=ninja-drive");

    useEffect(() => {
        if (isOpen) {
            setSearchTerm("");
            setActiveIndex(-1);
            setTimeout(() => inputRef.current?.focus(), 50);
        }
    }, [isOpen]);

    const searchResults = searchTerm
        ? SETTINGS_SEARCH_INDEX.filter((item) => {
              const term = searchTerm.toLowerCase();
              return (
                  item.title.toLowerCase().includes(term) ||
                  item.keywords.some((k) => k.includes(term)) ||
                  (item.description &&
                      item.description.toLowerCase().includes(term))
              );
          })
        : [];

    const groupedResults = useMemo(() => {
        const groups: Record<string, SettingsSearchItem[]> = {};
        searchResults.forEach((item) => {
            if (!groups[item.sectionTitle]) {
                groups[item.sectionTitle] = [];
            }
            groups[item.sectionTitle].push(item);
        });
        return Object.entries(groups);
    }, [searchResults]);

    const close = () => {
        setIsOpen(false);
        setSearchTerm("");
        setActiveIndex(-1);
    };

    const handleItemClick = (key: string) => {
        close();
        navigate(`/settings/${key}`);
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === "ArrowDown") {
            e.preventDefault();
            const next =
                activeIndex < searchResults.length - 1 ? activeIndex + 1 : 0;
            setActiveIndex(next);
        } else if (e.key === "ArrowUp") {
            e.preventDefault();
            const prev =
                activeIndex > 0 ? activeIndex - 1 : searchResults.length - 1;
            setActiveIndex(prev);
        } else if (e.key === "Enter" && activeIndex >= 0) {
            e.preventDefault();
            handleItemClick(searchResults[activeIndex].menuKey);
        } else if (e.key === "Escape") {
            close();
        }
    };

    useEffect(() => {
        const el = listRef.current;
        if (!el) return;
        const item = el.querySelector(".pnpnd-settings-search__item--active");
        if (item) {
            item.scrollIntoView({ block: "nearest" });
        }
    }, [activeIndex]);

    useEffect(() => {
        const handler = (e: KeyboardEvent) => {
            if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "k") {
                e.stopPropagation();
                e.preventDefault();

                e.stopImmediatePropagation?.();

                setIsOpen(true);
            }
        };
        if (isPluginPage) {
            document.addEventListener("keydown", handler, true);
        }
        return () => {
            if (isPluginPage) {
                document.removeEventListener("keydown", handler, true);
            }
        };
    }, []);

    const highlightText = (text: string, query: string) => {
        if (!query) return text;
        const escaped = query.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
        const regex = new RegExp(`(${escaped})`, "gi");
        const parts = text.split(regex);
        if (parts.length === 1) return text;
        return parts.map((part, i) =>
            regex.test(part) ? (
                <mark key={i} className="pnpnd-settings-search__highlight">
                    {part}
                </mark>
            ) : (
                part
            ),
        );
    };

    return (
        <>
            <button
                className="pnpnd-settings-search__trigger"
                onClick={() => setIsOpen(true)}
                title={__("Search settings", "ninja-drive")}
            >
                <Icon name="search" color="gray-500" fontSize="xl" />
            </button>

            {isOpen && (
                <div
                    className="pnpnd-settings-search__backdrop"
                    onClick={close}
                >
                    <div
                        className="pnpnd-settings-search__modal"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <div className="pnpnd-settings-search__modal-input">
                            <Icon
                                name="search"
                                color="gray-400"
                                fontSize="lg"
                            />
                            <input
                                ref={inputRef}
                                type="text"
                                value={searchTerm}
                                onChange={(e) => {
                                    setSearchTerm(e.target.value);
                                    setActiveIndex(-1);
                                }}
                                onKeyDown={handleKeyDown}
                                placeholder={__(
                                    "Search settings…",
                                    "ninja-drive",
                                )}
                            />
                            {searchTerm && (
                                <Icon
                                    name="close"
                                    color="gray-400"
                                    fontSize="lg"
                                    style={{ cursor: "pointer" }}
                                    onClick={() => {
                                        setSearchTerm("");
                                        setActiveIndex(-1);
                                        inputRef.current?.focus();
                                    }}
                                />
                            )}
                        </div>

                        {searchTerm && (
                            <div
                                className="pnpnd-settings-search__modal-results"
                                ref={listRef}
                            >
                                {searchResults.length > 0 ? (
                                    groupedResults.map(
                                        ([section, items], groupIdx) => (
                                            <div key={section}>
                                                {groupIdx > 0 && (
                                                    <div className="pnpnd-settings-search__divider" />
                                                )}
                                                <div className="pnpnd-settings-search__group-label">
                                                    <Text
                                                        color="gray-500"
                                                        size="xs"
                                                        weight="medium"
                                                    >
                                                        {section}
                                                    </Text>
                                                </div>
                                                {items.map((item) => {
                                                    const flatIdx =
                                                        searchResults.indexOf(
                                                            item,
                                                        );
                                                    const isActive =
                                                        flatIdx === activeIndex;
                                                    return (
                                                        <div
                                                            key={item.id}
                                                            onClick={() =>
                                                                handleItemClick(
                                                                    item.menuKey,
                                                                )
                                                            }
                                                            onMouseEnter={() =>
                                                                setActiveIndex(
                                                                    flatIdx,
                                                                )
                                                            }
                                                            className={clsx(
                                                                "pnpnd-settings-search__item",
                                                                isActive &&
                                                                    "pnpnd-settings-search__item--active",
                                                            )}
                                                        >
                                                            <div className="pnpnd-settings-search__item-icon">
                                                                <Icon
                                                                    name={
                                                                        item.sectionIcon
                                                                    }
                                                                    color="gray-500"
                                                                    fontSize="md"
                                                                />
                                                            </div>
                                                            <div className="pnpnd-settings-search__item-title">
                                                                <Text
                                                                    color="gray-800"
                                                                    size="sm"
                                                                    weight="medium"
                                                                    wrap={false}
                                                                >
                                                                    {highlightText(
                                                                        item.title,
                                                                        searchTerm,
                                                                    )}
                                                                </Text>
                                                            </div>
                                                        </div>
                                                    );
                                                })}
                                            </div>
                                        ),
                                    )
                                ) : (
                                    <div className="pnpnd-settings-search__empty">
                                        <Icon
                                            name="search"
                                            color="gray-300"
                                            fontSize="2xl"
                                        />
                                        <Text color="gray-400" size="sm">
                                            {__(
                                                "No results found",
                                                "ninja-drive",
                                            )}
                                        </Text>
                                    </div>
                                )}
                            </div>
                        )}

                        <div className="pnpnd-settings-search__modal-footer">
                            <span className="pnpnd-settings-search__shortcut">
                                <kbd>↑</kbd> <kbd>↓</kbd>
                                <span>{__("Navigate", "ninja-drive")}</span>
                            </span>
                            <span className="pnpnd-settings-search__shortcut">
                                <kbd>↵</kbd>
                                <span>{__("Select", "ninja-drive")}</span>
                            </span>
                            <span className="pnpnd-settings-search__shortcut">
                                <kbd>esc</kbd>
                                <span>{__("Close", "ninja-drive")}</span>
                            </span>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
};

export default SettingsSearch;
