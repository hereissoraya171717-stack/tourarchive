      
/* =========================================================
   追巡碎片
   Musical Tour Diary
========================================================= */

(() => {
    "use strict";

    /* =====================================================
       CONFIG
    ===================================================== */

    const STORAGE_KEY = "zhui-xun-fragments-v3";

    const TICKET_STYLES = 6;

    const CITY_POINTS = {
        "北京": [18, 22],
        "天津": [25, 28],
        "上海": [75, 65],
        "杭州": [68, 69],
        "南京": [61, 57],
        "苏州": [69, 61],
        "武汉": [47, 56],
        "长沙": [45, 68],
        "广州": [57, 87],
        "深圳": [63, 91],
        "成都": [25, 69],
        "重庆": [31, 67],
        "西安": [28, 47],
        "郑州": [43, 42],
        "厦门": [67, 84],
        "青岛": [50, 25],
        "大连": [58, 13],
        "香港": [64, 94],
        "澳门": [60, 96]
    };


    /* =====================================================
       STATE
    ===================================================== */

    let state = {
        shows: [],
        currentPage: 0,
        summaryYear: "all",
        summaryMonth: "all"
    };

    let editingShowId = null;
    let selectedShowId = null;
    let selectedItemId = null;

    let selectedRating = 5;
    let selectedTicketStyle = 0;

    let isTurning = false;

    let dragState = null;


    /* =====================================================
       DOM
    ===================================================== */

    const $ = (selector) => document.querySelector(selector);

    const coverScreen = $("#coverScreen");
    const diaryScreen = $("#diaryScreen");

    const ticketFolder = $("#ticketFolder");
    const openDiary = $("#openDiary");
    const closeDiary = $("#closeDiary");

    const leftPage = $("#leftPage");
    const rightPage = $("#rightPage");

    const bookSpread = $("#bookSpread");
    const flipSheet = $("#flipSheet");
    const flipSheetContent = $("#flipSheetContent");

    const prevPage = $("#prevPage");
    const nextPage = $("#nextPage");
    const pageCounter = $("#pageCounter");

    const addShowButton = $("#addShowButton");
    const summaryButton = $("#summaryButton");

    const showModal = $("#showModal");
    const closeShowModal = $("#closeShowModal");
    const showForm = $("#showForm");

    const showTitle = $("#showTitle");
    const showDate = $("#showDate");
    const showCity = $("#showCity");
    const showTheater = $("#showTheater");
    const showCast = $("#showCast");
    const showNote = $("#showNote");

    const ratingPicker = $("#ratingPicker");

    const imageInput = $("#imageInput");

    const editDrawer = $("#editDrawer");
    const closeDrawer = $("#closeDrawer");

    const drawerTitle = $("#drawerTitle");

    const selectedControls = $("#selectedControls");
    const scaleValue = $("#scaleValue");

    const toast = $("#toast");


    /* =====================================================
       UTILITIES
    ===================================================== */

    function createId(prefix = "item") {
        return (
            prefix +
            "_" +
            Date.now().toString(36) +
            "_" +
            Math.random().toString(36).slice(2, 8)
        );
    }


    function escapeHTML(value) {
        return String(value ?? "")
            .replace(/&/g, "&amp;")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;")
            .replace(/"/g, "&quot;")
            .replace(/'/g, "&#039;");
    }


    function formatDate(dateString) {

        if (!dateString) {
            return "DATE UNKNOWN";
        }

        const date = new Date(dateString + "T00:00:00");

        if (Number.isNaN(date.getTime())) {
            return dateString;
        }

        return date.toLocaleDateString(
            "en-US",
            {
                year: "numeric",
                month: "short",
                day: "2-digit"
            }
        ).toUpperCase();
    }


    function yearOf(show) {

        if (!show.date) {
            return "";
        }

        return show.date.slice(0, 4);
    }


    function monthOf(show) {

        if (!show.date) {
            return "";
        }

        return show.date.slice(5, 7);
    }


    function saveState() {

        try {

            localStorage.setItem(
                STORAGE_KEY,
                JSON.stringify(state)
            );

        } catch (error) {

            console.warn(
                "Diary could not be saved:",
                error
            );

            showToast(
                "图片较大，浏览器存储空间可能不足"
            );
        }
    }


    function loadState() {

        try {

            const raw = localStorage.getItem(STORAGE_KEY);

            if (!raw) {
                return;
            }

            const parsed = JSON.parse(raw);

            if (
                parsed &&
                Array.isArray(parsed.shows)
            ) {

                state.shows = parsed.shows.map(
                    normalizeShow
                );
            }

        } catch (error) {

            console.warn(
                "Could not load diary:",
                error
            );

            state.shows = [];
        }
    }


    function normalizeShow(show) {

        return {
            id: show.id || createId("show"),

            title: show.title || "UNTITLED SHOW",

            date: show.date || "",

            city: show.city || "",

            theater: show.theater || "",

            cast: show.cast || "",

            note: show.note || "",

            rating: Number(show.rating) || 0,

            style:
                Number.isInteger(show.style)
                    ? show.style % TICKET_STYLES
                    : 0,

            x:
                typeof show.x === "number"
                    ? show.x
                    : 50,

            y:
                typeof show.y === "number"
                    ? show.y
                    : 50,

            rotation:
                typeof show.rotation === "number"
                    ? show.rotation
                    : 0,

            scale:
                typeof show.scale === "number"
                    ? show.scale
                    : 100,

            z:
                typeof show.z === "number"
                    ? show.z
                    : 1,

            items:
                Array.isArray(show.items)
                    ? show.items.map(normalizeItem)
                    : [],

            createdAt:
                show.createdAt || Date.now()
        };
    }


    function normalizeItem(item) {

        return {

            id:
                item.id ||
                createId("item"),

            type:
                item.type ||
                "text",

            text:
                item.text ||
                "",

            src:
                item.src ||
                "",

            sticker:
                item.sticker ||
                "♡",

            x:
                typeof item.x === "number"
                    ? item.x
                    : 50,

            y:
                typeof item.y === "number"
                    ? item.y
                    : 50,

            scale:
                typeof item.scale === "number"
                    ? item.scale
                    : 100,

            rotation:
                typeof item.rotation === "number"
                    ? item.rotation
                    : 0,

            z:
                typeof item.z === "number"
                    ? item.z
                    : 1
        };
    }


    function showToast(message) {

        toast.textContent = message;

        toast.classList.add("show");

        clearTimeout(showToast.timer);

        showToast.timer = setTimeout(() => {

            toast.classList.remove("show");

        }, 1800);
    }


    /* =====================================================
       PAGE MODEL
    ===================================================== */

    function getPageCount() {

        /*
            0              = overview
            1...N          = individual memories
            N + 1          = summary
        */

        return state.shows.length + 2;
    }


    function getPageType(index) {

        if (index === 0) {
            return "overview";
        }

        if (
            index >= 1 &&
            index <= state.shows.length
        ) {
            return "memory";
        }

        return "summary";
    }


    function getShowForPage(index) {

        if (
            index < 1 ||
            index > state.shows.length
        ) {
            return null;
        }

        return state.shows[index - 1];
    }


    /* =====================================================
       COVER
    ===================================================== */

    function openDiaryScreen() {

        ticketFolder.classList.add("is-opening");

        setTimeout(() => {

            coverScreen.classList.add("is-hidden");

            diaryScreen.classList.add("is-visible");

            setTimeout(() => {

                ticketFolder.classList.remove(
                    "is-opening"
                );

                renderCurrentPage();

            }, 150);

        }, 650);
    }


    function closeDiaryScreen() {

        diaryScreen.classList.remove(
            "is-visible"
        );

        closeEditDrawer();

        setTimeout(() => {

            coverScreen.classList.remove(
                "is-hidden"
            );

        }, 550);
    }


    openDiary.addEventListener(
        "click",
        openDiaryScreen
    );


    closeDiary.addEventListener(
        "click",
        closeDiaryScreen
    );


    /* =====================================================
       PAGE RENDERING
    ===================================================== */

    function buildSpread(index) {

        const type = getPageType(index);

        if (type === "overview") {
            return buildOverviewSpread();
        }

        if (type === "memory") {

            const show = getShowForPage(index);

            return buildMemorySpread(show);
        }

        return buildSummarySpread();
    }


    function renderCurrentPage() {

        const spread = buildSpread(
            state.currentPage
        );

        leftPage.innerHTML = spread.left;
        rightPage.innerHTML = spread.right;

        updatePageCounter();

        updateNavigation();

        updateSelectedTicket();
    }


    function updatePageCounter() {

        const total = getPageCount();

        pageCounter.textContent =
            `${String(state.currentPage + 1).padStart(2, "0")} / ${String(total).padStart(2, "0")}`;
    }


    function updateNavigation() {

        prevPage.disabled =
            state.currentPage <= 0;

        nextPage.disabled =
            state.currentPage >= getPageCount() - 1;
    }


    /* =====================================================
       OVERVIEW
    ===================================================== */

    function buildOverviewSpread() {

        return {

            left: `
                <div class="page-inner">

                    <div class="page-kicker">
                        MY MUSICAL TOUR
                    </div>

                    <h1 class="page-title">
                        The shows I chased,
                    </h1>

                    <p class="page-subtitle">
                        留住每一次灯光亮起的碎片，
                        抓住每一个属于我们的瞬间。
                    </p>

                    <p class="overview-note">
                        “有些演出结束以后，
                        故事才真正开始。”
                    </p>

                    <div class="overview-number">
                        ${state.shows.length} SHOWS<br>
                        ${getYears().length} YEARS<br>
                        ${getCities().length} CITIES
                    </div>

                    <div class="overview-rabbit">
                        ♡
                    </div>

                    <div class="page-footer">
                        <span>追巡碎片</span>
                        <span>01</span>
                    </div>

                </div>
            `,

            right: `
                <div class="ticket-field">

                    <div class="ticket-field-title">
                        TICKET ARCHIVE · CLICK TO EDIT
                    </div>

                    ${buildTicketField()}

                </div>
            `
        };
    }


    function buildTicketField() {

        if (state.shows.length === 0) {

            return `
                <div class="ticket-empty">

                    <strong>
                        Your first ticket is waiting.
                    </strong>

                    还没有演出记录。<br>
                    点击右上角 “+ ADD SHOW”，
                    开始你的巡演手帐。

                    <br>

                    <button
                        class="memory-open-button"
                        data-action="add-show"
                        type="button"
                    >
                        + ADD YOUR FIRST SHOW
                    </button>

                </div>
            `;
        }


        return state.shows.map(
            (show, index) => {

                const positions = [
                    [27, 27],
                    [70, 25],
                    [38, 55],
                    [75, 55],
                    [25, 78],
                    [63, 79],
                    [49, 37],
                    [85, 75]
                ];

                const position =
                    positions[index % positions.length];

                const fallbackRotation =
                    [-5, 4, -3, 7, 2, -6, 5, -2]
                    [index % 8];

                const x =
                    typeof show.x === "number"
                        ? show.x
                        : position[0];

                const y =
                    typeof show.y === "number"
                        ? show.y
                        : position[1];

                const rotation =
                    typeof show.rotation === "number"
                        ? show.rotation
                        : fallbackRotation;

                const scale =
                    typeof show.scale === "number"
                        ? show.scale
                        : 100;

                return `
                    <article
                        class="
                            ticket
                            ticket-style-${show.style}
                        "
                        data-show-id="${escapeHTML(show.id)}"
                        style="
                            left:${x}%;
                            top:${y}%;
                            --rotation:${rotation}deg;
                            --scale:${scale};
                            --z:${show.z || index + 1};
                        "
                    >

                        <div
                            class="ticket-title"
                            data-edit-text="title"
                            title="双击修改"
                        >
                            ${escapeHTML(show.title)}
                        </div>

                        <div
                            class="ticket-date"
                            data-edit-text="date"
                            title="双击修改"
                        >
                            ${escapeHTML(formatDate(show.date))}
                        </div>

                        <div
                            class="ticket-location"
                            data-edit-text="location"
                            title="双击修改"
                        >
                            ${escapeHTML(show.city)}
                            ${show.city && show.theater ? " · " : ""}
                            ${escapeHTML(show.theater)}
                        </div>

                        <div
                            class="ticket-cast"
                            data-edit-text="cast"
                            title="双击修改"
                        >
                            ${escapeHTML(
                                show.cast || "CAST / DOUBLE CLICK TO EDIT"
                            )}
                        </div>

                        <div class="ticket-number">
                            NO.${String(index + 1).padStart(3, "0")}
                        </div>

                        <div class="ticket-heart">
                            ${show.rating >= 5 ? "♥" : "♡"}
                        </div>

                        <div class="ticket-barcode"></div>

                    </article>
                `;
            }
        ).join("");
    }


    /* =====================================================
       MEMORY SPREAD
    ===================================================== */

    function buildMemorySpread(show) {

        if (!show) {

            return buildOverviewSpread();
        }


        const rating =
            "★".repeat(show.rating || 0) +
            "☆".repeat(5 - (show.rating || 0));


        return {

            left: `
                <div class="page-inner">

                    <div class="memory-page">

                        <div class="memory-header">

                            <div>

                                <div class="page-kicker">
                                    MEMORY NO.
                                    ${String(
                                        state.shows.indexOf(show) + 1
                                    ).padStart(3, "0")}
                                </div>

                                <h2 class="memory-title">
                                    ${escapeHTML(show.title)}
                                </h2>

                                <div class="memory-meta">

                                    ${escapeHTML(
                                        formatDate(show.date)
                                    )}

                                    <br>

                                    ${escapeHTML(show.city)}

                                    ${
                                        show.theater
                                            ? " · " +
                                              escapeHTML(show.theater)
                                            : ""
                                    }

                                </div>

                            </div>

                            <button
                                class="memory-edit-button"
                                data-action="open-drawer"
                                data-show-id="${escapeHTML(show.id)}"
                                type="button"
                            >
                                EDIT PAGE
                            </button>

                        </div>


                        <div class="memory-block-title">
                            CAST
                        </div>

                        <div
                            class="cast-list"
                            data-action="edit-cast"
                            data-show-id="${escapeHTML(show.id)}"
                            title="双击编辑卡司"
                        >
                            ${escapeHTML(
                                show.cast ||
                                "双击这里编辑卡司"
                            )}
                        </div>


                        <div class="memory-block-title">
                            MY RATING
                        </div>

                        <div class="rating-display">
                            ${rating}
                        </div>


                        <div class="memory-block-title">
                            MY MEMORY
                        </div>

                        <div
                            class="memory-note"
                            data-action="edit-note"
                            data-show-id="${escapeHTML(show.id)}"
                            title="双击编辑观剧感受"
                        >
                            ${escapeHTML(
                                show.note ||
                                "双击这里，写下这一场演出。"
                            )}
                        </div>


                        <div class="page-footer">
                            <span>
                                ${escapeHTML(show.city)}
                            </span>

                            <span>
                                ${String(
                                    state.currentPage + 1
                                ).padStart(2, "0")}
                            </span>
                        </div>

                    </div>

                </div>
            `,

            right: `
                <div class="page-inner">

                    <div
                        class="scrapbook-canvas"
                        data-canvas-show="${escapeHTML(show.id)}"
                    >

                        <div class="scrapbook-title">
                            little fragments...
                        </div>

                        ${buildDIYItems(show)}

                        <div class="scrapbook-corner">
                            ✦
                        </div>

                    </div>

                </div>
            `
        };
    }


    function buildDIYItems(show) {

        if (
            !show.items ||
            show.items.length === 0
        ) {

            return `
                <div
                    class="diy-text"
                    style="
                        position:absolute;
                        left:50%;
                        top:50%;
                        transform:translate(-50%,-50%) rotate(-3deg);
                        color:#a08c72;
                        font-size:12px;
                        text-align:center;
                    "
                >
                    点击 “EDIT PAGE”<br>
                    开始贴照片、文字和贴纸
                </div>
            `;
        }


        return show.items.map(
            item => {

                const common = `
                    class="diy-item ${item.type === "text" ? "diy-text" : ""}"
                    data-item-id="${escapeHTML(item.id)}"
                    data-show-id="${escapeHTML(show.id)}"
                    style="
                        --x:${item.x};
                        --y:${item.y};
                        --scale:${item.scale};
                        --rotation:${item.rotation};
                        --z:${item.z};
                    "
                `;


                if (item.type === "photo") {

                    return `
                        <img
                            ${common}
                            class="diy-item diy-photo"
                            src="${item.src}"
                            alt=""
                            draggable="false"
                        >
                    `;
                }


                if (item.type === "sticker") {

                    return `
                        <div
                            ${common}
                            class="diy-item diy-sticker"
                        >
                            ${escapeHTML(item.sticker)}
                        </div>
                    `;
                }


                return `
                    <div
                        ${common}
                        class="diy-item diy-text"
                    >
                        ${escapeHTML(item.text)}
                    </div>
                `;
            }
        ).join("");
    }


    /* =====================================================
       SUMMARY
    ===================================================== */

    function getYears() {

        return [
            ...new Set(
                state.shows
                    .map(yearOf)
                    .filter(Boolean)
            )
        ].sort();
    }


    function getCities() {

        return [
            ...new Set(
                state.shows
                    .map(show => show.city)
                    .filter(Boolean)
            )
        ];
    }


    function getFilteredShows() {

        return state.shows.filter(show => {

            const yearMatch =
                state.summaryYear === "all" ||
                yearOf(show) === state.summaryYear;

            const monthMatch =
                state.summaryMonth === "all" ||
                monthOf(show) === state.summaryMonth;

            return yearMatch && monthMatch;
        });
    }


    function buildSummarySpread() {

        const shows =
            getFilteredShows();

        const years =
            getYears();

        const cities = [
            ...new Set(
                shows
                    .map(show => show.city)
                    .filter(Boolean)
            )
        ];

        const averageRating =
            shows.length
                ? (
                    shows.reduce(
                        (sum, show) =>
                            sum + Number(show.rating || 0),
                        0
                    ) / shows.length
                ).toFixed(1)
                : "0";


        return {

            left: `
                <div class="summary-grid">

                    <section class="summary-stats">

                        <div class="page-kicker">
                            TOUR SUMMARY
                        </div>

                        <div class="summary-big-number">
                            ${shows.length}
                        </div>

                        <div class="summary-label">
                            SHOWS CHASED
                        </div>

                        <div class="stat-list">

                            <div class="stat-item">
                                <div class="stat-value">
                                    ${cities.length}
                                </div>

                                <div class="stat-name">
                                    CITIES
                                </div>
                            </div>

                            <div class="stat-item">
                                <div class="stat-value">
                                    ${averageRating}
                                </div>

                                <div class="stat-name">
                                    AVG. RATING
                                </div>
                            </div>

                            <div class="stat-item">
                                <div class="stat-value">
                                    ${state.shows.length}
                                </div>

                                <div class="stat-name">
                                    TOTAL ARCHIVE
                                </div>
                            </div>

                            <div class="stat-item">
                                <div class="stat-value">
                                    ${years.length}
                                </div>

                                <div class="stat-name">
                                    YEARS
                                </div>
                            </div>

                        </div>


                        <div
                            class="memory-note"
                            style="
                                margin-top:38px;
                                max-height:none;
                            "
                        >
                            每一张票根都是一次出发。
                            <br><br>
                            每一个城市，
                            都留下了一点灯光。
                        </div>

                    </section>

                </div>
            `,

            right: `
                <section class="summary-map-page">

                    <div class="page-kicker">
                        TOUR ROUTE
                    </div>

                    <div class="summary-filter">

                        <select
                            id="summaryYear"
                        >

                            <option value="all">
                                ALL YEARS
                            </option>

                            ${years.map(year => `
                                <option
                                    value="${escapeHTML(year)}"
                                    ${
                                        state.summaryYear === year
                                            ? "selected"
                                            : ""
                                    }
                                >
                                    ${escapeHTML(year)}
                                </option>
                            `).join("")}

                        </select>


                        <select
                            id="summaryMonth"
                        >

                            <option value="all">
                                ALL MONTHS
                            </option>

                            ${Array.from(
                                { length: 12 },
                                (_, i) => {

                                    const month =
                                        String(i + 1)
                                            .padStart(2, "0");

                                    return `
                                        <option
                                            value="${month}"
                                            ${
                                                state.summaryMonth === month
                                                    ? "selected"
                                                    : ""
                                            }
                                        >
                                            ${month}
                                        </option>
                                    `;
                                }
                            ).join("")}

                        </select>

                    </div>


                    ${buildRouteMap(shows)}

                </section>
            `
        };
    }


    function getCityPoint(city, index) {

        if (CITY_POINTS[city]) {

            return CITY_POINTS[city];
        }


        /*
            没有预设城市时，
            根据文字生成一个稳定的位置。
        */

        let hash = 0;

        for (let i = 0; i < city.length; i++) {

            hash =
                ((hash << 5) - hash) +
                city.charCodeAt(i);

            hash |= 0;
        }

        const x =
            12 + Math.abs(hash % 76);

        const y =
            18 + Math.abs(
                (hash * 7 + index * 17) % 68
            );

        return [x, y];
    }


    function buildRouteMap(shows) {

        if (shows.length === 0) {

            return `
                <div class="route-map">

                    <div class="route-empty">
                        还没有足够的演出记录。<br>
                        添加几场演出之后，<br>
                        这里会自动生成你的巡演路线。
                    </div>

                </div>
            `;
        }


        const points =
            shows.map(
                (show, index) => {

                    const point =
                        getCityPoint(
                            show.city || "UNKNOWN",
                            index
                        );

                    return {
                        show,
                        x: point[0],
                        y: point[1]
                    };
                }
            );


        let lines = "";

        for (
            let i = 0;
            i < points.length - 1;
            i++
        ) {

            lines += `
                <line
                    class="route-line"
                    x1="${points[i].x}%"
                    y1="${points[i].y}%"
                    x2="${points[i + 1].x}%"
                    y2="${points[i + 1].y}%"
                />
            `;
        }


        const pointMarkup =
            points.map(
                (point, index) => {

                    return `
                        <circle
                            class="route-point"
                            cx="${point.x}%"
                            cy="${point.y}%"
                            r="5"
                        />

                        <text
                            class="route-label"
                            x="${point.x + 2}%"
                            y="${point.y - 2}%"
                        >
                            ${escapeHTML(
                                point.show.city ||
                                "UNKNOWN"
                            )}
                        </text>
                    `;
                }
            ).join("");


        return `
            <div class="route-map">

                <svg
                    class="route-svg"
                    viewBox="0 0 100 100"
                    preserveAspectRatio="none"
                >

                    ${lines}
                    ${pointMarkup}

                </svg>

            </div>
        `;
    }


    /* =====================================================
       PAGE TURNING
    ===================================================== */

    function turnPage(direction) {

        if (isTurning) {
            return;
        }


        const target =
            state.currentPage +
            direction;


        if (
            target < 0 ||
            target >= getPageCount()
        ) {
            return;
        }


        isTurning = true;


        /*
            保存当前画面。
            把它复制到翻页层。
        */

        flipSheetContent.innerHTML = `
            <div
                style="
                    display:grid;
                    grid-template-columns:1fr 20px 1fr;
                    width:100%;
                    height:100%;
                    background:#f5ead2;
                "
            >
                <div
                    style="
                        overflow:hidden;
                        background:#f5ead2;
                    "
                >
                    ${leftPage.innerHTML}
                </div>

                <div
                    style="
                        background:
                        linear-gradient(
                            90deg,
                            #c0a57d,
                            #8d7457,
                            #c9ad82
                        );
                    "
                ></div>

                <div
                    style="
                        overflow:hidden;
                        background:#f5ead2;
                    "
                >
                    ${rightPage.innerHTML}
                </div>
            </div>
        `;


        flipSheet.className =
            "flip-sheet is-active " +
            (direction > 0
                ? "is-next"
                : "is-prev");


        /*
            先更新底下的新页面，
            再让旧页面翻过去。
        */

        state.currentPage = target;

        renderCurrentPage();

        requestAnimationFrame(() => {

            requestAnimationFrame(() => {

                flipSheet.classList.add(
                    "is-flipping"
                );

            });

        });


        setTimeout(() => {

            flipSheet.className =
                "flip-sheet";

            flipSheetContent.innerHTML = "";

            isTurning = false;

            updateSelectedTicket();

        }, 760);
    }


    prevPage.addEventListener(
        "click",
        () => turnPage(-1)
    );


    nextPage.addEventListener(
        "click",
        () => turnPage(1)
    );


    /* =====================================================
       BOOK EVENT DELEGATION
    ===================================================== */

    bookSpread.addEventListener(
        "click",
        event => {

            const addButton =
                event.target.closest(
                    '[data-action="add-show"]'
                );

            if (addButton) {

                openShowModal();

                return;
            }


            const editButton =
                event.target.closest(
                    '[data-action="open-drawer"]'
                );

            if (editButton) {

                const showId =
                    editButton.dataset.showId;

                selectedShowId = showId;

                openEditDrawer();

                return;
            }


            const ticket =
                event.target.closest(
                    ".ticket"
                );

            if (ticket) {

                selectTicket(
                    ticket.dataset.showId
                );
            }


            const canvasItem =
                event.target.closest(
                    ".diy-item[data-item-id]"
                );

            if (canvasItem) {

                selectedShowId =
                    canvasItem.dataset.showId;

                selectedItemId =
                    canvasItem.dataset.itemId;

                openEditDrawer();

                updateSelectedItemUI();
            }

        }
    );


    /* =====================================================
       TICKET SELECTION
    ===================================================== */

    function selectTicket(showId) {

        selectedShowId = showId;

        selectedItemId = null;

        updateSelectedTicket();

        openEditDrawer();

        showToast(
            "已选中票根，可以直接编辑"
        );
    }


    function updateSelectedTicket() {

        document
            .querySelectorAll(".ticket")
            .forEach(ticket => {

                ticket.classList.toggle(
                    "is-selected",
                    ticket.dataset.showId ===
                    selectedShowId
                );
            });
    }


    /* =====================================================
       TICKET DRAG
    ===================================================== */

    bookSpread.addEventListener(
        "pointerdown",
        event => {

            const ticket =
                event.target.closest(".ticket");

            if (!ticket) {
                return;
            }

            if (
                event.target.closest(
                    "[data-edit-text]"
                )
            ) {
                return;
            }


            const showId =
                ticket.dataset.showId;

            const show =
                state.shows.find(
                    item => item.id === showId
                );

            if (!show) {
                return;
            }


            selectedShowId = showId;

            const rect =
                ticket.parentElement.getBoundingClientRect();


            dragState = {

                type: "ticket",

                show,

                rect,

                startX: event.clientX,
                startY: event.clientY,

                startLeft: show.x,
                startTop: show.y
            };


            ticket.setPointerCapture(
                event.pointerId
            );

        }
    );


    bookSpread.addEventListener(
        "pointermove",
        event => {

            if (
                !dragState ||
                dragState.type !== "ticket"
            ) {
                return;
            }


            const dx =
                event.clientX -
                dragState.startX;

            const dy =
                event.clientY -
                dragState.startY;


            const xDelta =
                dx /
                dragState.rect.width *
                100;

            const yDelta =
                dy /
                dragState.rect.height *
                100;


            dragState.show.x =
                Math.max(
                    5,
                    Math.min(
                        95,
                        dragState.startLeft +
                        xDelta
                    )
                );

            dragState.show.y =
                Math.max(
                    8,
                    Math.min(
                        92,
                        dragState.startTop +
                        yDelta
                    )
                );


            const ticket =
                document.querySelector(
                    `.ticket[data-show-id="${CSS.escape(dragState.show.id)}"]`
                );


            if (ticket) {

                ticket.style.left =
                    dragState.show.x + "%";

                ticket.style.top =
                    dragState.show.y + "%";
            }

        }
    );


    bookSpread.addEventListener(
        "pointerup",
        () => {

            if (dragState) {

                saveState();

                dragState = null;
            }
        }
    );


    /* =====================================================
       DOUBLE CLICK EDIT
    ===================================================== */

    bookSpread.addEventListener(
        "dblclick",
        event => {

            const editable =
                event.target.closest(
                    "[data-edit-text]"
                );


            if (editable) {

                const ticket =
                    event.target.closest(
                        ".ticket"
                    );

                if (!ticket) {
                    return;
                }


                const show =
                    state.shows.find(
                        item =>
                            item.id ===
                            ticket.dataset.showId
                    );


                if (!show) {
                    return;
                }


                editTicketField(
                    show,
                    editable.dataset.editText
                );

                return;
            }


            const cast =
                event.target.closest(
                    '[data-action="edit-cast"]'
                );

            if (cast) {

                const show =
                    state.shows.find(
                        item =>
                            item.id ===
                            cast.dataset.showId
                    );

                if (show) {

                    const value =
                        prompt(
                            "编辑卡司：",
                            show.cast
                        );

                    if (value !== null) {

                        show.cast = value;

                        saveState();

                        renderCurrentPage();
                    }
                }

                return;
            }


            const note =
                event.target.closest(
                    '[data-action="edit-note"]'
                );

            if (note) {

                const show =
                    state.shows.find(
                        item =>
                            item.id ===
                            note.dataset.showId
                    );

                if (show) {

                    const value =
                        prompt(
                            "编辑观剧感受：",
                            show.note
                        );

                    if (value !== null) {

                        show.note = value;

                        saveState();

                        renderCurrentPage();
                    }
                }
            }


            const diyItem =
                event.target.closest(
                    ".diy-item[data-item-id]"
                );

            if (diyItem) {

                const show =
                    state.shows.find(
                        item =>
                            item.id ===
                            diyItem.dataset.showId
                    );

                if (!show) {
                    return;
                }


                const item =
                    show.items.find(
                        entry =>
                            entry.id ===
                            diyItem.dataset.itemId
                    );


                if (
                    item &&
                    item.type === "text"
                ) {

                    const value =
                        prompt(
                            "编辑文字：",
                            item.text
                        );

                    if (value !== null) {

                        item.text = value;

                        saveState();

                        renderCurrentPage();

                        openEditDrawer();

                        selectedItemId =
                            item.id;

                        updateSelectedItemUI();
                    }
                }
            }

        }
    );


    function editTicketField(show, field) {

        let value;

        if (field === "title") {

            value =
                prompt(
                    "演出名称：",
                    show.title
                );

            if (value !== null) {
                show.title = value;
            }

        } else if (field === "date") {

            value =
                prompt(
                    "日期（YYYY-MM-DD）：",
                    show.date
                );

            if (value !== null) {
                show.date = value;
            }

        } else if (field === "location") {

            value =
                prompt(
                    "城市：",
                    show.city
                );

            if (value !== null) {
                show.city = value;
            }

        } else if (field === "cast") {

            value =
                prompt(
                    "卡司：",
                    show.cast
                );

            if (value !== null) {
                show.cast = value;
            }
        }


        saveState();

        renderCurrentPage();

        showToast("已保存");
    }


    /* =====================================================
       SHOW MODAL
    ===================================================== */

    function openShowModal(showId = null) {

        editingShowId = showId;

        if (showId) {

            const show =
                state.shows.find(
                    item => item.id === showId
                );

            if (!show) {
                return;
            }


            $("#formTitle").textContent =
                "EDIT THIS SHOW";


            showTitle.value = show.title;
            showDate.value = show.date;
            showCity.value = show.city;
            showTheater.value = show.theater;
            showCast.value = show.cast;
            showNote.value = show.note;

            selectedRating =
                show.rating || 0;

            selectedTicketStyle =
                show.style || 0;

        } else {

            $("#formTitle").textContent =
                "ADD A NEW SHOW";


            showForm.reset();

            selectedRating = 5;

            selectedTicketStyle =
                state.shows.length %
                TICKET_STYLES;

        }


        updateRatingPicker();

        updateStylePicker();

        showModal.setAttribute(
            "aria-hidden",
            "false"
        );
    }


    function closeShowModalFn() {

        showModal.setAttribute(
            "aria-hidden",
            "true"
        );

        editingShowId = null;
    }


    addShowButton.addEventListener(
        "click",
        () => openShowModal()
    );


    closeShowModal.addEventListener(
        "click",
        closeShowModalFn
    );


    showModal
        .querySelector(".modal-backdrop")
        .addEventListener(
            "click",
            closeShowModalFn
        );


    summaryButton.addEventListener(
        "click",
        () => {

            const summaryPage =
                getPageCount() - 1;

            if (
                state.currentPage ===
                summaryPage
            ) {
                return;
            }

            const direction =
                summaryPage >
                state.currentPage
                    ? 1
                    : -1;

            /*
                Summary按钮直接过去，
                仍然经过翻页动画。
            */

            turnToPage(summaryPage, direction);
        }
    );


    function turnToPage(target, direction) {

        if (isTurning) {
            return;
        }

        if (
            target < 0 ||
            target >= getPageCount()
        ) {
            return;
        }


        isTurning = true;


        flipSheetContent.innerHTML = `
            <div
                style="
                    display:grid;
                    grid-template-columns:1fr 20px 1fr;
                    width:100%;
                    height:100%;
                    background:#f5ead2;
                "
            >
                <div
                    style="
                        overflow:hidden;
                        background:#f5ead2;
                    "
                >
                    ${leftPage.innerHTML}
                </div>

                <div
                    style="
                        background:
                        linear-gradient(
                            90deg,
                            #c0a57d,
                            #8d7457,
                            #c9ad82
                        );
                    "
                ></div>

                <div
                    style="
                        overflow:hidden;
                        background:#f5ead2;
                    "
                >
                    ${rightPage.innerHTML}
                </div>
            </div>
        `;


        flipSheet.className =
            "flip-sheet is-active " +
            (
                direction >= 0
                    ? "is-next"
                    : "is-prev"
            );


        state.currentPage = target;

        renderCurrentPage();


        requestAnimationFrame(() => {

            requestAnimationFrame(() => {

                flipSheet.classList.add(
                    "is-flipping"
                );

            });

        });


        setTimeout(() => {

            flipSheet.className =
                "flip-sheet";

            flipSheetContent.innerHTML = "";

            isTurning = false;

        }, 760);
    }


    showForm.addEventListener(
        "submit",
        event => {

            event.preventDefault();


            const title =
                showTitle.value.trim();


            if (!title) {

                showTitle.focus();

                return;
            }


            if (editingShowId) {

                const show =
                    state.shows.find(
                        item =>
                            item.id ===
                            editingShowId
                    );


                if (show) {

                    show.title =
                        title;

                    show.date =
                        showDate.value;

                    show.city =
                        showCity.value.trim();

                    show.theater =
                        showTheater.value.trim();

                    show.cast =
                        showCast.value.trim();

                    show.note =
                        showNote.value.trim();

                    show.rating =
                        selectedRating;

                    show.style =
                        selectedTicketStyle;
                }

            } else {

                const index =
                    state.shows.length;


                const positions = [
                    [25, 25],
                    [70, 23],
                    [40, 52],
                    [76, 54],
                    [26, 78],
                    [62, 80],
                    [52, 36],
                    [84, 76]
                ];


                const position =
                    positions[
                        index %
                        positions.length
                    ];


                const rotations = [
                    -5,
                    4,
                    -3,
                    7,
                    2,
                    -6,
                    5,
                    -2
                ];


                state.shows.push({

                    id:
                        createId("show"),

                    title,

                    date:
                        showDate.value,

                    city:
                        showCity.value.trim(),

                    theater:
                        showTheater.value.trim(),

                    cast:
                        showCast.value.trim(),

                    note:
                        showNote.value.trim(),

                    rating:
                        selectedRating,

                    style:
                        selectedTicketStyle,

                    x:
                        position[0],

                    y:
                        position[1],

                    rotation:
                        rotations[
                            index %
                            rotations.length
                        ],

                    scale:
                        100,

                    z:
                        index + 1,

                    items: [],

                    createdAt:
                        Date.now()
                });
            }


            saveState();

            closeShowModalFn();

            /*
                新增以后回到目录。
            */

            state.currentPage = 0;

            renderCurrentPage();

            showToast(
                editingShowId
                    ? "演出资料已更新"
                    : "新的票根已经放进手帐"
            );
        }
    );


    /* =====================================================
       RATING
    ===================================================== */

    ratingPicker.addEventListener(
        "click",
        event => {

            const button =
                event.target.closest(
                    "[data-rating]"
                );

            if (!button) {
                return;
            }


            selectedRating =
                Number(
                    button.dataset.rating
                );


            updateRatingPicker();
        }
    );


    function updateRatingPicker() {

        ratingPicker
            .querySelectorAll("button")
            .forEach(button => {

                const rating =
                    Number(
                        button.dataset.rating
                    );

                button.classList.toggle(
                    "active",
                    rating <= selectedRating
                );
            });
    }


    /* =====================================================
       TICKET STYLE
    ===================================================== */

    document
        .querySelectorAll(".style-choice")
        .forEach(button => {

            button.addEventListener(
                "click",
                () => {

                    selectedTicketStyle =
                        Number(
                            button.dataset.style
                        );

                    updateStylePicker();
                }
            );
        });


    function updateStylePicker() {

        document
            .querySelectorAll(".style-choice")
            .forEach(button => {

                button.classList.toggle(
                    "active",
                    Number(
                        button.dataset.style
                    ) === selectedTicketStyle
                );
            });
    }


    /* =====================================================
       DRAWER
    ===================================================== */

    function openEditDrawer() {

        if (!selectedShowId) {
            return;
        }


        const show =
            state.shows.find(
                item =>
                    item.id === selectedShowId
            );


        if (!show) {
            return;
        }


        drawerTitle.textContent =
            show.title || "EDIT TICKET";


        editDrawer.classList.add(
            "is-open"
        );


        updateSelectedItemUI();
    }


    function closeEditDrawer() {

        editDrawer.classList.remove(
            "is-open"
        );

        selectedItemId = null;

        updateSelectedItemUI();
    }


    closeDrawer.addEventListener(
        "click",
        closeEditDrawer
    );


    /* =====================================================
       TICKET ROTATION
    ===================================================== */

    $("#rotateTicketLeft")
        .addEventListener(
            "click",
            () => {

                const show =
                    getSelectedShow();

                if (!show) {
                    return;
                }

                show.rotation -= 3;

                saveState();

                renderCurrentPage();

                openEditDrawer();
            }
        );


    $("#rotateTicketRight")
        .addEventListener(
            "click",
            () => {

                const show =
                    getSelectedShow();

                if (!show) {
                    return;
                }

                show.rotation += 3;

                saveState();

                renderCurrentPage();

                openEditDrawer();
            }
        );


    /* =====================================================
       DELETE SHOW
    ===================================================== */

    $("#deleteShow")
        .addEventListener(
            "click",
            () => {

                const show =
                    getSelectedShow();

                if (!show) {
                    return;
                }


                const ok =
                    confirm(
                        `确定要删除「${show.title}」吗？`
                    );


                if (!ok) {
                    return;
                }


                state.shows =
                    state.shows.filter(
                        item =>
                            item.id !== show.id
                    );


                selectedShowId = null;

                selectedItemId = null;

                saveState();

                closeEditDrawer();

                state.currentPage = 0;

                renderCurrentPage();

                showToast(
                    "票根已从手帐中移除"
                );
            }
        );


    function getSelectedShow() {

        if (!selectedShowId) {
            return null;
        }

        return state.shows.find(
            show =>
                show.id === selectedShowId
        ) || null;
    }


    /* =====================================================
       ADD TEXT
    ===================================================== */

    $("#addText")
        .addEventListener(
            "click",
            () => {

                const show =
                    getSelectedShow();

                if (!show) {
                    return;
                }


                const text =
                    prompt(
                        "写下你想贴进手帐的文字："
                    );


                if (
                    text === null ||
                    !text.trim()
                ) {
                    return;
                }


                const item = {

                    id:
                        createId("text"),

                    type:
                        "text",

                    text:
                        text.trim(),

                    x:
                        48,

                    y:
                        55,

                    scale:
                        100,

                    rotation:
                        -3,

                    z:
                        getNextZ(show)
                };


                show.items.push(item);

                selectedItemId =
                    item.id;


                saveState();

                renderCurrentPage();

                openEditDrawer();

                updateSelectedItemUI();

                showToast(
                    "文字已经贴到手帐上"
                );
            }
        );


    /* =====================================================
       ADD STICKER
    ===================================================== */

    document
        .querySelectorAll(".sticker-button")
        .forEach(button => {

            button.addEventListener(
                "click",
                () => {

                    const show =
                        getSelectedShow();

                    if (!show) {
                        return;
                    }


                    const item = {

                        id:
                            createId("sticker"),

                        type:
                            "sticker",

                        sticker:
                            button.dataset.sticker,

                        x:
                            55,

                        y:
                            55,

                        scale:
                            100,

                        rotation:
                            Math.round(
                                Math.random() * 14 - 7
                            ),

                        z:
                            getNextZ(show)
                    };


                    show.items.push(item);

                    selectedItemId =
                        item.id;


                    saveState();

                    renderCurrentPage();

                    openEditDrawer();

                    updateSelectedItemUI();
                }
            );
        });


    /* =====================================================
       ADD PHOTO
    ===================================================== */

    $("#addPhoto")
        .addEventListener(
            "click",
            () => {

                if (!getSelectedShow()) {
                    return;
                }

                imageInput.click();
            }
        );


    imageInput.addEventListener(
        "change",
        async event => {

            const show =
                getSelectedShow();

            if (!show) {
                return;
            }


            const files =
                Array.from(
                    event.target.files || []
                );


            if (!files.length) {
                return;
            }


            for (const file of files) {

                if (
                    !file.type.startsWith(
                        "image/"
                    )
                ) {
                    continue;
                }


                try {

                    const dataUrl =
                        await resizeImage(
                            file,
                            1400
                        );


                    const item = {

                        id:
                            createId("photo"),

                        type:
                            "photo",

                        src:
                            dataUrl,

                        x:
                            45 +
                            Math.random() * 15,

                        y:
                            45 +
                            Math.random() * 15,

                        scale:
                            100,

                        rotation:
                            Math.round(
                                Math.random() * 12 - 6
                            ),

                        z:
                            getNextZ(show)
                    };


                    show.items.push(item);

                    selectedItemId =
                        item.id;

                } catch (error) {

                    console.error(error);

                    showToast(
                        "图片读取失败"
                    );
                }
            }


            saveState();

            renderCurrentPage();

            openEditDrawer();

            updateSelectedItemUI();

            imageInput.value = "";

            showToast(
                "照片已经贴进手帐"
            );
        }
    );


    function resizeImage(
        file,
        maxSize
    ) {

        return new Promise(
            (resolve, reject) => {

                const reader =
                    new FileReader();


                reader.onload =
                    event => {

                        const img =
                            new Image();


                        img.onload =
                            () => {

                                let width =
                                    img.width;

                                let height =
                                    img.height;


                                if (
                                    width >
                                    maxSize ||
                                    height >
                                    maxSize
                                ) {

                                    const ratio =
                                        Math.min(
                                            maxSize / width,
                                            maxSize / height
                                        );

                                    width *= ratio;
                                    height *= ratio;
                                }


                                const canvas =
                                    document.createElement(
                                        "canvas"
                                    );


                                canvas.width =
                                    Math.round(width);

                                canvas.height =
                                    Math.round(height);


                                const ctx =
                                    canvas.getContext(
                                        "2d"
                                    );


                                ctx.drawImage(
                                    img,
                                    0,
                                    0,
                                    canvas.width,
                                    canvas.height
                                );


                                resolve(
                                    canvas.toDataURL(
                                        "image/jpeg",
                                        .82
                                    )
                                );
                            };


                        img.onerror =
                            reject;


                        img.src =
                            event.target.result;
                    };


                reader.onerror =
                    reject;


                reader.readAsDataURL(file);
            }
        );
    }


    /* =====================================================
       DIY ITEM DRAG
    ===================================================== */

    bookSpread.addEventListener(
        "pointerdown",
        event => {

            const item =
                event.target.closest(
                    ".diy-item[data-item-id]"
                );

            if (!item) {
                return;
            }


            const showId =
                item.dataset.showId;

            const itemId =
                item.dataset.itemId;


            const show =
                state.shows.find(
                    entry =>
                        entry.id === showId
                );


            if (!show) {
                return;
            }


            const diyItem =
                show.items.find(
                    entry =>
                        entry.id === itemId
                );


            if (!diyItem) {
                return;
            }


            selectedShowId =
                showId;

            selectedItemId =
                itemId;


            const canvas =
                item.closest(
                    ".scrapbook-canvas"
                );


            const rect =
                canvas.getBoundingClientRect();


            dragState = {

                type: "item",

                item: diyItem,

                rect,

                startX:
                    event.clientX,

                startY:
                    event.clientY,

                startLeft:
                    diyItem.x,

                startTop:
                    diyItem.y
            };


            item.setPointerCapture(
                event.pointerId
            );


            openEditDrawer();

            updateSelectedItemUI();
        }
    );


    bookSpread.addEventListener(
        "pointermove",
        event => {

            if (
                !dragState ||
                dragState.type !== "item"
            ) {
                return;
            }


            const dx =
                event.clientX -
                dragState.startX;

            const dy =
                event.clientY -
                dragState.startY;


            const xDelta =
                dx /
                dragState.rect.width *
                100;

            const yDelta =
                dy /
                dragState.rect.height *
                100;


            dragState.item.x =
                Math.max(
                    5,
                    Math.min(
                        95,
                        dragState.startLeft +
                        xDelta
                    )
                );


            dragState.item.y =
                Math.max(
                    5,
                    Math.min(
                        95,
                        dragState.startTop +
                        yDelta
                    )
                );


            const domItem =
                document.querySelector(
                    `.diy-item[data-item-id="${CSS.escape(dragState.item.id)}"]`
                );


            if (domItem) {

                domItem.style.setProperty(
                    "--x",
                    dragState.item.x
                );

                domItem.style.setProperty(
                    "--y",
                    dragState.item.y
                );
            }

        }
    );


    bookSpread.addEventListener(
        "pointerup",
        () => {

            if (dragState) {

                saveState();

                dragState = null;
            }
        }
    );


    /* =====================================================
       SELECTED ITEM CONTROLS
    ===================================================== */

    function getSelectedItem() {

        const show =
            getSelectedShow();

        if (!show || !selectedItemId) {
            return null;
        }


        return show.items.find(
            item =>
                item.id ===
                selectedItemId
        ) || null;
    }


    function updateSelectedItemUI() {

        const item =
            getSelectedItem();


        selectedControls.style.display =
            item ? "block" : "none";


        document
            .querySelectorAll(
                ".diy-item[data-item-id]"
            )
            .forEach(element => {

                element.classList.toggle(
                    "selected",
                    item &&
                    element.dataset.itemId ===
                    item.id
                );
            });


        if (item) {

            scaleValue.textContent =
                `${Math.round(item.scale)}%`;
        }
    }


    $("#scaleUp")
        .addEventListener(
            "click",
            () => {

                const item =
                    getSelectedItem();

                if (!item) {
                    return;
                }

                item.scale =
                    Math.min(
                        220,
                        item.scale + 10
                    );

                saveState();

                renderCurrentPage();

                openEditDrawer();

                updateSelectedItemUI();
            }
        );


    $("#scaleDown")
        .addEventListener(
            "click",
            () => {

                const item =
                    getSelectedItem();

                if (!item) {
                    return;
                }

                item.scale =
                    Math.max(
                        40,
                        item.scale - 10
                    );

                saveState();

                renderCurrentPage();

                openEditDrawer();

                updateSelectedItemUI();
            }
        );


    $("#itemRotateLeft")
        .addEventListener(
            "click",
            () => {

                const item =
                    getSelectedItem();

                if (!item) {
                    return;
                }

                item.rotation -= 5;

                saveState();

                renderCurrentPage();

                openEditDrawer();

                updateSelectedItemUI();
            }
        );


    $("#itemRotateRight")
        .addEventListener(
            "click",
            () => {

                const item =
                    getSelectedItem();

                if (!item) {
                    return;
                }

                item.rotation += 5;

                saveState();

                renderCurrentPage();

                openEditDrawer();

                updateSelectedItemUI();
            }
        );


    $("#deleteItem")
        .addEventListener(
            "click",
            () => {

                const show =
                    getSelectedShow();

                const item =
                    getSelectedItem();

                if (!show || !item) {
                    return;
                }


                show.items =
                    show.items.filter(
                        entry =>
                            entry.id !==
                            item.id
                    );


                selectedItemId = null;

                saveState();

                renderCurrentPage();

                openEditDrawer();

                updateSelectedItemUI();

                showToast(
                    "元素已删除"
                );
            }
        );


    function getNextZ(show) {

        if (
            !show.items ||
            show.items.length === 0
        ) {
            return 1;
        }


        return (
            Math.max(
                ...show.items.map(
                    item =>
                        Number(item.z) || 1
                )
            ) + 1
        );
    }


    /* =====================================================
       SUMMARY FILTERS
    ===================================================== */

    bookSpread.addEventListener(
        "change",
        event => {

            if (
                event.target.id ===
                "summaryYear"
            ) {

                state.summaryYear =
                    event.target.value;

                saveState();

                renderCurrentPage();
            }


            if (
                event.target.id ===
                "summaryMonth"
            ) {

                state.summaryMonth =
                    event.target.value;

                saveState();

                renderCurrentPage();
            }
        }
    );


    /* =====================================================
       KEYBOARD
    ===================================================== */

    document.addEventListener(
        "keydown",
        event => {

            if (
                event.key === "Escape"
            ) {

                closeShowModalFn();

                closeEditDrawer();

                return;
            }


            if (
                !diaryScreen.classList.contains(
                    "is-visible"
                )
            ) {
                return;
            }


            if (
                event.key === "ArrowRight"
            ) {

                turnPage(1);
            }


            if (
                event.key === "ArrowLeft"
            ) {

                turnPage(-1);
            }
        }
    );


    /* =====================================================
       TOUCH SWIPE
    ===================================================== */

    let touchStartX = null;


    bookSpread.addEventListener(
        "touchstart",
        event => {

            if (
                event.touches.length !== 1
            ) {
                return;
            }


            touchStartX =
                event.touches[0].clientX;
        },
        {
            passive: true
        }
    );


    bookSpread.addEventListener(
        "touchend",
        event => {

            if (
                touchStartX === null
            ) {
                return;
            }


            const touchEndX =
                event.changedTouches[0]
                    .clientX;


            const delta =
                touchEndX -
                touchStartX;


            touchStartX = null;


            if (
                Math.abs(delta) < 50
            ) {
                return;
            }


            if (delta < 0) {

                turnPage(1);

            } else {

                turnPage(-1);
            }
        },
        {
            passive: true
        }
    );


    /* =====================================================
       INITIALIZATION
    ===================================================== */

    function init() {

        loadState();


        /*
            如果以前版本存过数据，
            尽可能兼容。
        */

        state.shows =
            state.shows.map(
                normalizeShow
            );


        const currentYear =
            new Date().getFullYear().toString();


        /*
            不是强制使用当前年份，
            只是封面显示当前年份。
        */

        $("#coverYear").textContent =
            currentYear;


        updateRatingPicker();

        updateStylePicker();

        renderCurrentPage();
    }


    init();

})();
