import { __ } from "@wordpress/i18n";

export const PRELOADERS: {
    id: number;
    title: string;
    isPro?: boolean;
    icon: React.ReactElement<any, any>;
}[] = [
    {
        id: 1,
        title: __("Default", "ninja-drive"),
        isPro: false,
        icon: (
            <svg
                className="lds-balls"
                width="80px"
                height="80px"
                xmlns="http://www.w3.org/2000/svg"
                xmlnsXlink="http://www.w3.org/1999/xlink"
                viewBox="0 0 100 100"
                preserveAspectRatio="xMidYMid"
            >
                <circle cx="67.8023" cy="59.9068" r={6} fill="#51CACC">
                    <animate
                        attributeName="cx"
                        values="75;57.72542485937369"
                        dur="1s"
                        repeatCount="indefinite"
                    />
                    <animate
                        attributeName="cy"
                        values="50;73.77641290737884"
                        dur="1s"
                        repeatCount="indefinite"
                    />
                    <animate
                        attributeName="fill"
                        values="#51CACC;#9DF871"
                        dur="1s"
                        repeatCount="indefinite"
                    />
                </circle>
                <circle cx="46.0792" cy="69.9923" r={6} fill="#9DF871">
                    <animate
                        attributeName="cx"
                        values="57.72542485937369;29.774575140626318"
                        dur="1s"
                        repeatCount="indefinite"
                    />
                    <animate
                        attributeName="cy"
                        values="73.77641290737884;64.69463130731182"
                        dur="1s"
                        repeatCount="indefinite"
                    />
                    <animate
                        attributeName="fill"
                        values="#9DF871;#E0FF77"
                        dur="1s"
                        repeatCount="indefinite"
                    />
                </circle>
                <circle cx="29.7746" cy="52.4491" r={6} fill="#E0FF77">
                    <animate
                        attributeName="cx"
                        values="29.774575140626318;29.774575140626315"
                        dur="1s"
                        repeatCount="indefinite"
                    />
                    <animate
                        attributeName="cy"
                        values="64.69463130731182;35.30536869268818"
                        dur="1s"
                        repeatCount="indefinite"
                    />
                    <animate
                        attributeName="fill"
                        values="#E0FF77;#DE9DD6"
                        dur="1s"
                        repeatCount="indefinite"
                    />
                </circle>
                <circle cx="41.4208" cy="31.5213" r={6} fill="#DE9DD6">
                    <animate
                        attributeName="cx"
                        values="29.774575140626315;57.72542485937368"
                        dur="1s"
                        repeatCount="indefinite"
                    />
                    <animate
                        attributeName="cy"
                        values="35.30536869268818;26.22358709262116"
                        dur="1s"
                        repeatCount="indefinite"
                    />
                    <animate
                        attributeName="fill"
                        values="#DE9DD6;#FF708E"
                        dur="1s"
                        repeatCount="indefinite"
                    />
                </circle>
                <circle cx="64.9232" cy="36.1304" r={6} fill="#FF708E">
                    <animate
                        attributeName="cx"
                        values="57.72542485937368;75"
                        dur="1s"
                        repeatCount="indefinite"
                    />
                    <animate
                        attributeName="cy"
                        values="26.22358709262116;49.99999999999999"
                        dur="1s"
                        repeatCount="indefinite"
                    />
                    <animate
                        attributeName="fill"
                        values="#FF708E;#51CACC"
                        dur="1s"
                        repeatCount="indefinite"
                    />
                </circle>
            </svg>
        ),
    },

    {
        id: 2,
        title: __("Balls", "ninja-drive"),
        isPro: false,
        icon: (
            <svg
                width="120"
                height="120"
                viewBox="0 0 100 100"
                preserveAspectRatio="xMidYMid"
            >
                <circle cx="75" cy="50" fill="#ffd7c0" r="3">
                    <animate
                        attributeName="r"
                        values="3;3;5;3;3"
                        dur="1s"
                        repeatCount="indefinite"
                        begin="-0.9166666666666666s"
                    />
                    <animate
                        attributeName="fill"
                        values="#ffd7c0;#ffd7c0;#ff1574;#ffd7c0;#ffd7c0"
                        repeatCount="indefinite"
                        dur="1s"
                        begin="-0.9166666666666666s"
                    />
                </circle>
                <circle cx="71.651" cy="62.5" fill="#ffd7c0" r="3.533">
                    <animate
                        attributeName="r"
                        values="3;3;5;3;3"
                        dur="1s"
                        repeatCount="indefinite"
                        begin="-0.8333333333333334s"
                    />
                    <animate
                        attributeName="fill"
                        values="#ffd7c0;#ffd7c0;#ff1574;#ffd7c0;#ffd7c0"
                        repeatCount="indefinite"
                        dur="1s"
                        begin="-0.8333333333333334s"
                    />
                </circle>
                <circle cx="62.5" cy="71.651" fill="#ffd7c0" r="4.2">
                    <animate
                        attributeName="r"
                        values="3;3;5;3;3"
                        dur="1s"
                        repeatCount="indefinite"
                        begin="-0.75s"
                    />
                    <animate
                        attributeName="fill"
                        values="#ffd7c0;#ffd7c0;#ff1574;#ffd7c0;#ffd7c0"
                        repeatCount="indefinite"
                        dur="1s"
                        begin="-0.75s"
                    />
                </circle>
                <circle cx="50" cy="75" fill="#ffd7c0" r="4.866">
                    <animate
                        attributeName="r"
                        values="3;3;5;3;3"
                        dur="1s"
                        repeatCount="indefinite"
                        begin="-0.6666666666666666s"
                    />
                    <animate
                        attributeName="fill"
                        values="#ffd7c0;#ffd7c0;#ff1574;#ffd7c0;#ffd7c0"
                        repeatCount="indefinite"
                        dur="1s"
                        begin="-0.6666666666666666s"
                    />
                </circle>
                <circle cx="37.5" cy="71.651" fill="#ffd7c0" r="4.467">
                    <animate
                        attributeName="r"
                        values="3;3;5;3;3"
                        dur="1s"
                        repeatCount="indefinite"
                        begin="-0.5833333333333334s"
                    />
                    <animate
                        attributeName="fill"
                        values="#ffd7c0;#ffd7c0;#ff1574;#ffd7c0;#ffd7c0"
                        repeatCount="indefinite"
                        dur="1s"
                        begin="-0.5833333333333334s"
                    />
                </circle>
                <circle cx="28.349" cy="62.5" fill="#ffd7c0" r="3.8">
                    <animate
                        attributeName="r"
                        values="3;3;5;3;3"
                        dur="1s"
                        repeatCount="indefinite"
                        begin="-0.5s"
                    />
                    <animate
                        attributeName="fill"
                        values="#ffd7c0;#ffd7c0;#ff1574;#ffd7c0;#ffd7c0"
                        repeatCount="indefinite"
                        dur="1s"
                        begin="-0.5s"
                    />
                </circle>
                <circle cx="25" cy="50" fill="#ffd7c0" r="3.134">
                    <animate
                        attributeName="r"
                        values="3;3;5;3;3"
                        dur="1s"
                        repeatCount="indefinite"
                        begin="-0.4166666666666667s"
                    />
                    <animate
                        attributeName="fill"
                        values="#ffd7c0;#ffd7c0;#ff1574;#ffd7c0;#ffd7c0"
                        repeatCount="indefinite"
                        dur="1s"
                        begin="-0.4166666666666667s"
                    />
                </circle>
                <circle cx="28.349" cy="37.5" fill="#ffd7c0" r="3">
                    <animate
                        attributeName="r"
                        values="3;3;5;3;3"
                        dur="1s"
                        repeatCount="indefinite"
                        begin="-0.3333333333333333s"
                    />
                    <animate
                        attributeName="fill"
                        values="#ffd7c0;#ffd7c0;#ff1574;#ffd7c0;#ffd7c0"
                        repeatCount="indefinite"
                        dur="1s"
                        begin="-0.3333333333333333s"
                    />
                </circle>
                <circle cx="37.5" cy="28.349" fill="#ffd7c0" r="3">
                    <animate
                        attributeName="r"
                        values="3;3;5;3;3"
                        dur="1s"
                        repeatCount="indefinite"
                        begin="-0.25s"
                    />
                    <animate
                        attributeName="fill"
                        values="#ffd7c0;#ffd7c0;#ff1574;#ffd7c0;#ffd7c0"
                        repeatCount="indefinite"
                        dur="1s"
                        begin="-0.25s"
                    />
                </circle>
                <circle cx="50" cy="25" fill="#ffd7c0" r="3">
                    <animate
                        attributeName="r"
                        values="3;3;5;3;3"
                        dur="1s"
                        repeatCount="indefinite"
                        begin="-0.16666666666666666s"
                    />
                    <animate
                        attributeName="fill"
                        values="#ffd7c0;#ffd7c0;#ff1574;#ffd7c0;#ffd7c0"
                        repeatCount="indefinite"
                        dur="1s"
                        begin="-0.16666666666666666s"
                    />
                </circle>
                <circle cx="62.5" cy="28.349" fill="#ffd7c0" r="3">
                    <animate
                        attributeName="r"
                        values="3;3;5;3;3"
                        dur="1s"
                        repeatCount="indefinite"
                        begin="-0.08333333333333333s"
                    />
                    <animate
                        attributeName="fill"
                        values="#ffd7c0;#ffd7c0;#ff1574;#ffd7c0;#ffd7c0"
                        repeatCount="indefinite"
                        dur="1s"
                        begin="-0.08333333333333333s"
                    />
                </circle>
                <circle cx="71.651" cy="37.5" fill="#ffd7c0" r="3">
                    <animate
                        attributeName="r"
                        values="3;3;5;3;3"
                        dur="1s"
                        repeatCount="indefinite"
                        begin="0s"
                    />
                    <animate
                        attributeName="fill"
                        values="#ffd7c0;#ffd7c0;#ff1574;#ffd7c0;#ffd7c0"
                        repeatCount="indefinite"
                        dur="1s"
                        begin="0s"
                    />
                </circle>
            </svg>
        ),
    },
];
