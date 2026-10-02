/* =========================================================
   HABIT TRACKER
========================================================= */

const STORAGE_KEY = "myHabitTracker_v3";

let data = loadData();

let selectedDate = new Date(
    new Date().getFullYear(),
    new Date().getMonth(),
    1
);


/* =========================================================
   STORAGE
========================================================= */

function loadData() {

    try {

        const saved =
            localStorage.getItem(STORAGE_KEY);

        if (saved) {

            return JSON.parse(saved);

        }

    } catch (error) {

        console.error(error);

    }

    return {
        tasks: []
    };

}


function saveData() {

    localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify(data)
    );

}


/* =========================================================
   DATE FUNCTIONS
========================================================= */

function pad(number) {

    return String(number).padStart(2, "0");

}


function dateKey(date) {

    return (
        date.getFullYear() +
        "-" +
        pad(date.getMonth() + 1) +
        "-" +
        pad(date.getDate())
    );

}


function todayKey() {

    return dateKey(new Date());

}


function monthKey(date) {

    return (
        date.getFullYear() +
        "-" +
        pad(date.getMonth() + 1)
    );

}


function daysInMonth(year, month) {

    return new Date(
        year,
        month + 1,
        0
    ).getDate();

}


/* =========================================================
   MONTH NAVIGATION
========================================================= */

function changeMonth(amount) {

    selectedDate = new Date(
        selectedDate.getFullYear(),
        selectedDate.getMonth() + amount,
        1
    );

    render();

}


function goToday() {

    const now = new Date();

    selectedDate = new Date(
        now.getFullYear(),
        now.getMonth(),
        1
    );

    render();

}


/* =========================================================
   ADD TASK
========================================================= */

function openAddModal() {

    document
        .getElementById("addModal")
        .classList.add("show");

    document
        .getElementById("taskName")
        .focus();

}


function closeAddModal() {

    document
        .getElementById("addModal")
        .classList.remove("show");

}


function createTask() {

    const name =
        document
            .getElementById("taskName")
            .value
            .trim();

    const icon =
        document
            .getElementById("taskIcon")
            .value
            .trim() || "⭐";

    const target =
        document
            .getElementById("taskTarget")
            .value;

    const unit =
        document
            .getElementById("taskUnit")
            .value
            .trim();


    if (!name) {

        showToast(
            "Please enter a task name."
        );

        return;

    }


    const task = {

        id:
            Date.now().toString(36) +
            Math.random()
                .toString(36)
                .substring(2),

        name: name,

        icon: icon,

        target:
            target
                ? Number(target)
                : null,

        unit: unit,

        createdAt:
            todayKey(),

        records: {}

    };


    data.tasks.push(task);

    saveData();

    document.getElementById("taskName").value = "";

    document.getElementById("taskIcon").value = "⭐";

    document.getElementById("taskTarget").value = "";

    document.getElementById("taskUnit").value = "";

    closeAddModal();

    render();

    showToast(
        `${name} calendar created!`
    );

}


/* =========================================================
   TOGGLE DAY
========================================================= */

function toggleDay(taskId, key) {

    const task =
        data.tasks.find(
            t => t.id === taskId
        );

    if (!task) return;


    const clickedDate =
        new Date(
            key + "T00:00:00"
        );

    const today =
        new Date();

    today.setHours(0, 0, 0, 0);


    if (clickedDate > today) {

        showToast(
            "Future dates cannot be marked."
        );

        return;

    }


    task.records[key] =
        !task.records[key];


    saveData();

    render();

}


/* =========================================================
   CALENDAR
========================================================= */

function createCalendar(task) {

    const year =
        selectedDate.getFullYear();

    const month =
        selectedDate.getMonth();

    const firstDay =
        new Date(
            year,
            month,
            1
        ).getDay();

    const totalDays =
        daysInMonth(
            year,
            month
        );


    let html = `

        <div class="calendar">

            <div class="weekdays">

                <div class="weekday">S</div>
                <div class="weekday">M</div>
                <div class="weekday">T</div>
                <div class="weekday">W</div>
                <div class="weekday">T</div>
                <div class="weekday">F</div>
                <div class="weekday">S</div>

            </div>

            <div class="days">

    `;


    /* Empty days before month */

    for (
        let i = 0;
        i < firstDay;
        i++
    ) {

        html +=
            `<div class="day empty"></div>`;

    }


    const today =
        todayKey();


    for (
        let day = 1;
        day <= totalDays;
        day++
    ) {

        const key =
            year +
            "-" +
            pad(month + 1) +
            "-" +
            pad(day);


        const completed =
            task.records[key] === true;


        const isToday =
            key === today;


        const future =
            new Date(
                key + "T00:00:00"
            ) >
            new Date(
                today + "T00:00:00"
            );


        html += `

            <div
                class="day
                ${completed ? "completed" : ""}
                ${isToday ? "today" : ""}"
                ${future ? "" :
                    `onclick="toggleDay('${task.id}','${key}')"`
                }
            >

                <div class="day-number">

                    ${completed
                        ? "✓"
                        : day
                    }

                </div>

                ${
                    completed
                        ? `<div class="check">✓</div>`
                        : ""
                }

            </div>

        `;

    }


    html += `

            </div>

        </div>

    `;


    return html;

}


/* =========================================================
   CURRENT STREAK
========================================================= */

function getCurrentStreak(task) {

    const today =
        new Date();

    today.setHours(0, 0, 0, 0);


    const created =
        new Date(
            task.createdAt +
            "T00:00:00"
        );


    if (
        !task.records[
            dateKey(today)
        ]
    ) {

        return 0;

    }


    let streak = 0;

    let cursor =
        new Date(today);


    while (
        cursor >= created &&
        task.records[
            dateKey(cursor)
        ] === true
    ) {

        streak++;

        cursor.setDate(
            cursor.getDate() - 1
        );

    }


    return streak;

}


/* =========================================================
   LONGEST STREAK
========================================================= */

function getLongestStreak(task) {

    const today =
        new Date();

    today.setHours(0, 0, 0, 0);


    const created =
        new Date(
            task.createdAt +
            "T00:00:00"
        );


    let longest = 0;

    let current = 0;

    let cursor =
        new Date(created);


    while (cursor <= today) {

        const key =
            dateKey(cursor);


        if (
            task.records[key] === true
        ) {

            current++;

            longest =
                Math.max(
                    longest,
                    current
                );

        } else {

            current = 0;

        }


        cursor.setDate(
            cursor.getDate() + 1
        );

    }


    return longest;

}


/* =========================================================
   MONTH COMPLETION
========================================================= */

function getMonthCompleted(task) {

    const year =
        selectedDate.getFullYear();

    const month =
        selectedDate.getMonth();

    const total =
        daysInMonth(
            year,
            month
        );


    let count = 0;


    for (
        let day = 1;
        day <= total;
        day++
    ) {

        const key =
            year +
            "-" +
            pad(month + 1) +
            "-" +
            pad(day);


        if (
            task.records[key] === true
        ) {

            count++;

        }

    }


    return count;

}


/* =========================================================
   MONTH BEST STREAK
========================================================= */

function getMonthBestStreak(task) {

    const year =
        selectedDate.getFullYear();

    const month =
        selectedDate.getMonth();

    const total =
        daysInMonth(
            year,
            month
        );


    let best = 0;

    let current = 0;


    for (
        let day = 1;
        day <= total;
        day++
    ) {

        const key =
            year +
            "-" +
            pad(month + 1) +
            "-" +
            pad(day);


        if (
            task.records[key] === true
        ) {

            current++;

            best =
                Math.max(
                    best,
                    current
                );

        } else {

            current = 0;

        }

    }


    return best;

}


/* =========================================================
   STREAK LABEL
========================================================= */

function streakText(streak) {

    if (streak >= 100) {

        return "👑 100 DAY";

    }

    if (streak >= 50) {

        return "🏆 50 DAY";

    }

    if (streak >= 30) {

        return "🥇 30 DAY";

    }

    if (streak >= 14) {

        return "🟡 14 DAY";

    }

    if (streak >= 7) {

        return "🟡 7 DAY";

    }

    if (streak >= 3) {

        return `🔥 ${streak} DAY`;

    }

    if (streak > 0) {

        return `🔥 ${streak} DAY`;

    }

    return "No streak";

}


function isGold(streak) {

    return streak >= 7;

}


/* =========================================================
   TASK CARD
========================================================= */

function createTaskCard(task) {

    const currentStreak =
        getCurrentStreak(task);

    const longestStreak =
        getLongestStreak(task);

    const monthCompleted =
        getMonthCompleted(task);

    const monthBest =
        getMonthBestStreak(task);


    const totalDays =
        daysInMonth(
            selectedDate.getFullYear(),
            selectedDate.getMonth()
        );


    const percentage =
        Math.round(
            (
                monthCompleted /
                totalDays
            ) * 100
        );


    const targetText =
        task.target
            ? `Target: ${task.target}${task.unit ? " " + task.unit : ""}`
            : "Daily task";


    return `

        <article class="task-card">


            <!-- TASK HEADER -->

            <div class="task-top">

                <div class="task-info">

                    <div class="task-icon">

                        ${escapeHTML(
                            task.icon
                        )}

                    </div>


                    <div>

                        <div class="task-name">

                            ${escapeHTML(
                                task.name
                            )}

                        </div>


                        <div class="task-target">

                            ${escapeHTML(
                                targetText
                            )}

                        </div>

                    </div>

                </div>


                <div class="task-menu">

                    <button
                        class="menu-btn"
                        onclick="
                            toggleMenu('${task.id}')
                        "
                    >
                        ⋮
                    </button>


                    <div
                        class="menu"
                        id="menu-${task.id}"
                    >

                        <button
                            onclick="
                                deleteThisMonth('${task.id}')
                            "
                        >
                            🗑 Delete This Month
                        </button>


                        <button
                            class="danger"
                            onclick="
                                deleteTask('${task.id}')
                            "
                        >
                            ❌ Delete Task
                        </button>

                    </div>

                </div>

            </div>


            <!-- CALENDAR -->

            ${createCalendar(task)}


            <!-- STATS -->

            <div class="task-stats">

                <div class="stat">

                    <div class="stat-label">
                        Month
                    </div>

                    <div class="stat-value">
                        ${monthCompleted}
                    </div>

                </div>


                <div class="stat">

                    <div class="stat-label">
                        Best
                    </div>

                    <div class="stat-value">
                        ${monthBest}
                    </div>

                </div>


                <div class="stat">

                    <div class="stat-label">
                        Longest
                    </div>

                    <div class="stat-value">
                        ${longestStreak}
                    </div>

                </div>

            </div>


            <!-- STREAK -->

            <div class="streak-area">

                <div
                    class="
                        streak
                        ${
                            isGold(currentStreak)
                                ? "gold"
                                : ""
                        }
                    "
                >

                    ${streakText(
                        currentStreak
                    )}

                </div>


                <div class="progress">

                    <div
                        class="progress-bar"
                        style="
                            width:${percentage}%
                        "
                    ></div>

                </div>

            </div>


        </article>

    `;

}


/* =========================================================
   RENDER
========================================================= */

function render() {

    renderMonthTitle();

    renderSummary();

    renderTasks();

}


function renderMonthTitle() {

    const title =
        selectedDate.toLocaleDateString(
            "en-US",
            {
                month: "long",
                year: "numeric"
            }
        );


    document
        .getElementById("monthTitle")
        .textContent = title;

}


/* =========================================================
   SUMMARY
========================================================= */

function renderSummary() {

    let completedToday = 0;

    let monthCompletions = 0;

    let activeStreaks = 0;


    data.tasks.forEach(task => {

        if (
            task.records[
                todayKey()
            ]
        ) {

            completedToday++;

        }


        monthCompletions +=
            getMonthCompleted(task);


        if (
            getCurrentStreak(task) > 0
        ) {

            activeStreaks++;

        }

    });


    document
        .getElementById("totalTasks")
        .textContent =
            data.tasks.length;


    document
        .getElementById("completedToday")
        .textContent =
            completedToday;


    document
        .getElementById("monthCompletions")
        .textContent =
            monthCompletions;


    document
        .getElementById("activeStreaks")
        .textContent =
            activeStreaks;

}


/* =========================================================
   TASKS
========================================================= */

function renderTasks() {

    const container =
        document.getElementById(
            "tasksContainer"
        );


    if (
        data.tasks.length === 0
    ) {

        container.innerHTML = `

            <div class="empty-state">

                <div style="font-size:40px;">
                    📅
                </div>

                <br>

                <h2>
                    No tasks yet
                </h2>

                <p>
                    Create your first habit calendar.
                </p>

                <br>

                <button
                    class="btn add-btn"
                    onclick="openAddModal()"
                >
                    + Create First Task
                </button>

            </div>

        `;

        return;

    }


    container.innerHTML = `

        <div class="tasks-grid">

            ${data.tasks
                .map(
                    task =>
                        createTaskCard(task)
                )
                .join("")}

        </div>

    `;

}


/* =========================================================
   MENU
========================================================= */

function toggleMenu(id) {

    const menu =
        document.getElementById(
            `menu-${id}`
        );


    document
        .querySelectorAll(".menu")
        .forEach(item => {

            if (item !== menu) {

                item.classList.remove(
                    "show"
                );

            }

        });


    menu.classList.toggle(
        "show"
    );

}


document.addEventListener(
    "click",
    function(event) {

        if (
            !event.target.closest(
                ".task-menu"
            )
        ) {

            document
                .querySelectorAll(".menu")
                .forEach(menu => {

                    menu.classList.remove(
                        "show"
                    );

                });

        }

    }
);


/* =========================================================
   DELETE MONTH
========================================================= */

function deleteThisMonth(taskId) {

    const task =
        data.tasks.find(
            t => t.id === taskId
        );


    if (!task) return;


    const monthName =
        selectedDate.toLocaleDateString(
            "en-US",
            {
                month: "long",
                year: "numeric"
            }
        );


    const confirmed =
        confirm(
            `Delete all ${monthName} records for "${task.name}"?\n\nPrevious months will stay safe.`
        );


    if (!confirmed) return;


    const prefix =
        monthKey(
            selectedDate
        );


    Object.keys(task.records)
        .forEach(key => {

            if (
                key.startsWith(prefix)
            ) {

                delete task.records[key];

            }

        });


    saveData();

    render();

    showToast(
        `${monthName} records deleted.`
    );

}


/* =========================================================
   DELETE TASK
========================================================= */

function deleteTask(taskId) {

    const task =
        data.tasks.find(
            t => t.id === taskId
        );


    if (!task) return;


    const confirmed =
        confirm(
            `Delete "${task.name}" completely?\n\nAll history will be permanently removed.`
        );


    if (!confirmed) return;


    data.tasks =
        data.tasks.filter(
            task =>
                task.id !== taskId
        );


    saveData();

    render();

    showToast(
        "Task deleted."
    );

}


/* =========================================================
   EXCEL EXPORT
========================================================= */

function exportExcel() {

    if (
        data.tasks.length === 0
    ) {

        showToast(
            "Create a task first."
        );

        return;

    }


    const summaryRows = [];

    const detailRows = [];


    data.tasks.forEach(task => {

        summaryRows.push({

            Task: task.name,

            Icon: task.icon,

            Target:
                task.target ?? "",

            Unit:
                task.unit || "",

            "Current Streak":
                getCurrentStreak(task),

            "Longest Streak":
                getLongestStreak(task),

            "Selected Month":
                getMonthCompleted(task),

            "Month Best":
                getMonthBestStreak(task),

            Created:
                task.createdAt

        });


        Object.keys(
            task.records
        )
        .sort()
        .forEach(date => {

            detailRows.push({

                Task:
                    task.name,

                Date:
                    date,

                Status:
                    task.records[date]
                        ? "Completed"
                        : "Not Completed",

                Target:
                    task.target ?? "",

                Unit:
                    task.unit || ""

            });

        });

    });


    const workbook =
        XLSX.utils.book_new();


    const summarySheet =
        XLSX.utils.json_to_sheet(
            summaryRows
        );


    const detailSheet =
        XLSX.utils.json_to_sheet(
            detailRows
        );


    XLSX.utils.book_append_sheet(
        workbook,
        summarySheet,
        "Summary"
    );


    XLSX.utils.book_append_sheet(
        workbook,
        detailSheet,
        "Daily Records"
    );


    XLSX.writeFile(
        workbook,
        `Habit_Tracker_${todayKey()}.xlsx`
    );


    showToast(
        "Excel exported successfully."
    );

}


/* =========================================================
   TOAST
========================================================= */

let toastTimer;


function showToast(message) {

    const toast =
        document.getElementById(
            "toast"
        );


    toast.textContent =
        message;


    toast.classList.add(
        "show"
    );


    clearTimeout(
        toastTimer
    );


    toastTimer =
        setTimeout(
            () => {

                toast.classList.remove(
                    "show"
                );

            },
            2500
        );

}


/* =========================================================
   ESCAPE HTML
========================================================= */

function escapeHTML(value) {

    return String(value)

        .replaceAll(
            "&",
            "&amp;"
        )

        .replaceAll(
            "<",
            "&lt;"
        )

        .replaceAll(
            ">",
            "&gt;"
        )

        .replaceAll(
            '"',
            "&quot;"
        )

        .replaceAll(
            "'",
            "&#039;"
        );

}


/* =========================================================
   MODAL
========================================================= */

document
    .getElementById("addModal")
    .addEventListener(
        "click",
        function(event) {

            if (
                event.target === this
            ) {

                closeAddModal();

            }

        }
    );


document.addEventListener(
    "keydown",
    function(event) {

        if (
            event.key === "Escape"
        ) {

            closeAddModal();

        }

    }
);


/* =========================================================
   START
========================================================= */

render();