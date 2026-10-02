/* =========================================================
   MY HABIT TRACKER
   FINAL VERSION
========================================================= */


/* =========================================================
   STORAGE
========================================================= */

const STORAGE_KEY =
    "myHabitTracker_v3";


let data =
    loadData();


let selectedDate =
    new Date(
        new Date().getFullYear(),
        new Date().getMonth(),
        1
    );


let selectedJournalDate =
    new Date();


let statisticsYear =
    new Date().getFullYear();


let toastTimer = null;


/* =========================================================
   LOAD DATA
========================================================= */

function loadData() {

    try {

        const saved =
            localStorage.getItem(
                STORAGE_KEY
            );


        if (saved) {

            const parsed =
                JSON.parse(saved);


            if (
                parsed &&
                Array.isArray(
                    parsed.tasks
                )
            ) {

                if (
                    !parsed.journal
                ) {

                    parsed.journal = {};

                }


                return parsed;

            }

        }

    }
    catch (error) {

        console.error(
            "Error loading data:",
            error
        );

    }


    return {

        tasks: [],

        journal: {}

    };

}


/* =========================================================
   SAVE DATA
========================================================= */

function saveData() {

    try {

        localStorage.setItem(
            STORAGE_KEY,
            JSON.stringify(data)
        );

    }
    catch (error) {

        console.error(
            "Error saving data:",
            error
        );

        showToast(
            "Unable to save data."
        );

    }

}


/* =========================================================
   DATE HELPERS
========================================================= */

function pad(value) {

    return String(value)
        .padStart(2, "0");

}


function dateKey(date) {

    return (
        date.getFullYear() +
        "-" +
        pad(
            date.getMonth() + 1
        ) +
        "-" +
        pad(
            date.getDate()
        )
    );

}


function monthKey(date) {

    return (
        date.getFullYear() +
        "-" +
        pad(
            date.getMonth() + 1
        )
    );

}


function todayKey() {

    return dateKey(
        new Date()
    );

}


function daysInMonth(
    year,
    month
) {

    return new Date(
        year,
        month + 1,
        0
    ).getDate();

}


function isSameDay(
    a,
    b
) {

    return (
        a.getFullYear() ===
            b.getFullYear() &&

        a.getMonth() ===
            b.getMonth() &&

        a.getDate() ===
            b.getDate()
    );

}


function isFutureDate(
    date
) {

    const today =
        new Date();


    today.setHours(
        0,
        0,
        0,
        0
    );


    const compare =
        new Date(
            date.getFullYear(),
            date.getMonth(),
            date.getDate()
        );


    return compare > today;

}


/* =========================================================
   MONTH NAVIGATION
========================================================= */

function changeMonth(
    amount
) {

    selectedDate =
        new Date(
            selectedDate.getFullYear(),
            selectedDate.getMonth() +
                amount,
            1
        );


    render();

}


function renderMonthTitle() {

    const element =
        document.getElementById(
            "monthTitle"
        );


    if (!element)
        return;


    const titleText =
        selectedDate.toLocaleDateString(
            "en-US",
            {
                month: "long",
                year: "numeric"
            }
        );

    element.innerHTML = `${titleText} <span class="month-dropdown-hint" style="font-size:12px;opacity:0.6;margin-left:4px;">▾</span>`;

}


/* =========================================================
   ADD HABIT
========================================================= */

function openAddModal() {

    const modal =
        document.getElementById(
            "addModal"
        );


    modal.classList.add(
        "show"
    );


    setTimeout(
        () => {

            document
                .getElementById(
                    "taskName"
                )
                .focus();

        },
        100
    );

}


function closeAddModal() {

    document
        .getElementById(
            "addModal"
        )
        .classList.remove(
            "show"
        );

}


function addTask() {

    const name =
        document
            .getElementById(
                "taskName"
            )
            .value
            .trim();


    const icon =
        document
            .getElementById(
                "taskIcon"
            )
            .value
            .trim() ||
        "🎯";


    const target =
        Number(
            document
                .getElementById(
                    "taskTarget"
                )
                .value
        ) || 1;


    const unit =
        document
            .getElementById(
                "taskUnit"
            )
            .value
            .trim() ||
        "time";


    if (!name) {

        showToast(
            "Please enter a habit name."
        );

        return;

    }


    const task = {

        id:
            Date.now().toString(),

        name:
            name,

        icon:
            icon,

        target:
            target,

        unit:
            unit,

        completions:
            {},

        reminder: {

            enabled:
                false,

            time:
                "20:00"

        },

        goal: {

            target:
                30,

            type:
                "days"

        }

    };


    data.tasks.push(
        task
    );


    saveData();


    closeAddModal();


    document.getElementById(
        "taskName"
    ).value = "";


    document.getElementById(
        "taskIcon"
    ).value = "🎯";


    document.getElementById(
        "taskTarget"
    ).value = 1;


    document.getElementById(
        "taskUnit"
    ).value = "time";


    render();


    showToast(
        "Habit added successfully 🎯"
    );

}


/* =========================================================
   COMPLETION
========================================================= */

function toggleDay(
    taskId,
    key
) {

    const task =
        data.tasks.find(
            item =>
                item.id ===
                taskId
        );


    if (!task)
        return;


    if (!task.completions) {

        task.completions = {};

    }


    if (
        task.completions[key]
    ) {

        delete task.completions[
            key
        ];

    }
    else {

        task.completions[key] =
            true;

    }


    saveData();


    render();


    if (
        task.completions[key]
    ) {

        showToast(
            `${task.icon} ${task.name} completed! 🔥`
        );

    }

}


/* =========================================================
   CALENDAR
========================================================= */

function createCalendar(
    task
) {

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


    let html =
        `<div class="calendar">`;


    const weekdays = [
        "S",
        "M",
        "T",
        "W",
        "T",
        "F",
        "S"
    ];


    weekdays.forEach(
        day => {

            html += `
                <div class="calendar-head">
                    ${day}
                </div>
            `;

        }
    );


    for (
        let i = 0;
        i < firstDay;
        i++
    ) {

        html += `
            <div class="day empty"></div>
        `;

    }


    for (
        let day = 1;
        day <= totalDays;
        day++
    ) {

        const date =
            new Date(
                year,
                month,
                day
            );


        const key =
            dateKey(date);


        const completed =
            Boolean(
                task.completions &&
                task.completions[key]
            );


        const today =
            isSameDay(
                date,
                new Date()
            );


        const future =
            isFutureDate(
                date
            );


        let classes =
            "day";


        if (completed) {

            classes +=
                " completed";

        }


        if (today) {

            classes +=
                " today";

        }


        if (future) {

            classes +=
                " future";

        }


        html += `

            <div
                class="${classes}"

                ${
                    !future
                        ? `
                            onclick="
                                toggleDay(
                                    '${task.id}',
                                    '${key}'
                                )
                            "
                          `
                        : ""
                }
            >
                ${day}
            </div>

        `;

    }


    html +=
        `</div>`;


    return html;

}


/* =========================================================
   DATE RANGE
========================================================= */

function getDateRange(
    start,
    end
) {

    const result = [];


    const current =
        new Date(start);


    current.setHours(
        0,
        0,
        0,
        0
    );


    const final =
        new Date(end);


    final.setHours(
        0,
        0,
        0,
        0
    );


    while (
        current <= final
    ) {

        result.push(
            new Date(current)
        );


        current.setDate(
            current.getDate() + 1
        );

    }


    return result;

}


/* =========================================================
   RANGE STATS
========================================================= */

function isTaskEligible(
    task,
    date
) {

    return !isFutureDate(
        date
    );

}


function getTaskRangeStats(
    task,
    start,
    end
) {

    const dates =
        getDateRange(
            start,
            end
        );


    let completed = 0;

    let eligible = 0;


    dates.forEach(
        date => {

            if (
                isTaskEligible(
                    task,
                    date
                )
            ) {

                eligible++;


                if (
                    task.completions &&
                    task.completions[
                        dateKey(date)
                    ]
                ) {

                    completed++;

                }

            }

        }
    );


    return {

        completed:
            completed,

        eligible:
            eligible,

        rate:
            eligible
                ? Math.round(
                    (
                        completed /
                        eligible
                    ) * 100
                )
                : 0

    };

}


function getOverallRangeStats(
    start,
    end
) {

    let completed = 0;

    let eligible = 0;


    data.tasks.forEach(
        task => {

            const stats =
                getTaskRangeStats(
                    task,
                    start,
                    end
                );


            completed +=
                stats.completed;


            eligible +=
                stats.eligible;

        }
    );


    return {

        completed:
            completed,

        eligible:
            eligible,

        rate:
            eligible
                ? Math.round(
                    (
                        completed /
                        eligible
                    ) * 100
                )
                : 0

    };

}


/* =========================================================
   STREAKS
========================================================= */

function getCurrentStreak(
    task
) {

    let streak = 0;


    const current =
        new Date();


    current.setHours(
        0,
        0,
        0,
        0
    );


    while (true) {

        const key =
            dateKey(current);


        if (
            task.completions &&
            task.completions[key]
        ) {

            streak++;


            current.setDate(
                current.getDate() - 1
            );

        }
        else {

            break;

        }

    }


    return streak;

}


function getLongestStreak(
    task
) {

    if (
        !task.completions
    ) {

        return 0;

    }


    const dates =
        Object.keys(
            task.completions
        )
        .filter(
            key =>
                task.completions[key]
        )
        .sort();


    let longest = 0;

    let current = 0;

    let previous = null;


    dates.forEach(
        key => {

            const date =
                new Date(
                    key +
                    "T00:00:00"
                );


            if (previous) {

                const difference =
                    (
                        date -
                        previous
                    ) /
                    (
                        1000 *
                        60 *
                        60 *
                        24
                    );


                if (
                    difference === 1
                ) {

                    current++;

                }
                else {

                    current = 1;

                }

            }
            else {

                current = 1;

            }


            longest =
                Math.max(
                    longest,
                    current
                );


            previous =
                date;

        }
    );


    return longest;

}


function getYearLongestStreak(
    task,
    year
) {

    let longest = 0;

    let current = 0;


    const totalDays =
        (
            (
                year % 4 === 0 &&
                year % 100 !== 0
            ) ||
            year % 400 === 0
        )
            ? 366
            : 365;


    for (
        let day = 1;
        day <= totalDays;
        day++
    ) {

        const date =
            new Date(
                year,
                0,
                day
            );


        const key =
            dateKey(date);


        if (
            task.completions &&
            task.completions[key]
        ) {

            current++;

            longest =
                Math.max(
                    longest,
                    current
                );

        }
        else {

            current = 0;

        }

    }


    return longest;

}


function getStreakLabel(
    streak
) {

    if (
        streak >= 100
    ) {

        return "🏆 100 Day Legend";

    }


    if (
        streak >= 50
    ) {

        return "👑 50 Day Master";

    }


    if (
        streak >= 30
    ) {

        return "🔥 30 Day Champion";

    }


    if (
        streak >= 14
    ) {

        return "⚡ 14 Day Warrior";

    }


    if (
        streak >= 7
    ) {

        return "🔥 7 Day Streak";

    }


    if (
        streak >= 3
    ) {

        return "✨ 3 Day Streak";

    }


    return "Start your streak";

}


/* =========================================================
   MONTHLY STATS
========================================================= */

function getMonthlyCompletion(
    task
) {

    const year =
        selectedDate.getFullYear();


    const month =
        selectedDate.getMonth();


    const total =
        daysInMonth(
            year,
            month
        );


    let completed = 0;

    let eligible = 0;


    for (
        let day = 1;
        day <= total;
        day++
    ) {

        const date =
            new Date(
                year,
                month,
                day
            );


        if (
            !isFutureDate(
                date
            )
        ) {

            eligible++;


            if (
                task.completions &&
                task.completions[
                    dateKey(date)
                ]
            ) {

                completed++;

            }

        }

    }


    return {

        completed:
            completed,

        eligible:
            eligible,

        rate:
            eligible
                ? Math.round(
                    (
                        completed /
                        eligible
                    ) * 100
                )
                : 0

    };

}


function getMonthlyBestStreak(
    task
) {

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

        const date =
            new Date(
                year,
                month,
                day
            );


        const key =
            dateKey(date);


        if (
            !isFutureDate(date) &&
            task.completions &&
            task.completions[key]
        ) {

            current++;


            best =
                Math.max(
                    best,
                    current
                );

        }
        else {

            current = 0;

        }

    }


    return best;

}


/* =========================================================
   REMINDERS
========================================================= */

function ensureReminder(
    task
) {

    if (!task.reminder) {

        task.reminder = {

            enabled:
                false,

            time:
                "20:00"

        };

    }


    if (
        !task.reminder.time
    ) {

        task.reminder.time =
            "20:00";

    }


    if (
        typeof task.reminder.enabled !==
        "boolean"
    ) {

        task.reminder.enabled =
            false;

    }

}


function formatReminderTime(
    time
) {

    if (!time) {

        return "8:00 PM";

    }


    const parts =
        time.split(":");


    let hour =
        Number(parts[0]);


    const minute =
        parts[1] ||
        "00";


    const period =
        hour >= 12
            ? "PM"
            : "AM";


    hour =
        hour % 12 ||
        12;


    return (
        `${hour}:${minute} ${period}`
    );

}


function toggleReminder(
    taskId,
    enabled
) {

    const task =
        data.tasks.find(
            item =>
                item.id ===
                taskId
        );


    if (!task)
        return;


    ensureReminder(task);


    if (
        enabled &&
        "Notification" in window
    ) {

        if (
            Notification.permission !==
            "granted"
        ) {

            Notification
                .requestPermission()
                .then(
                    permission => {

                        if (
                            permission ===
                            "granted"
                        ) {

                            task.reminder.enabled =
                                true;

                            saveData();

                            render();

                            showToast(
                                "Reminder enabled 🔔"
                            );

                        }
                        else {

                            task.reminder.enabled =
                                false;

                            saveData();

                            render();

                            showToast(
                                "Notification permission was not granted."
                            );

                        }

                    }
                );

            return;

        }

    }


    task.reminder.enabled =
        enabled;


    saveData();


    render();


    showToast(
        enabled
            ? "Reminder enabled 🔔"
            : "Reminder disabled"
    );

}


function updateReminderTime(
    taskId,
    time
) {

    const task =
        data.tasks.find(
            item =>
                item.id ===
                taskId
        );


    if (!task)
        return;


    ensureReminder(task);


    task.reminder.time =
        time;


    saveData();


    renderTodayReminders();

}


function requestNotificationPermission() {

    if (
        !("Notification" in window)
    ) {

        showToast(
            "Notifications are not supported by this browser."
        );

        return;

    }


    Notification
        .requestPermission()
        .then(
            permission => {

                if (
                    permission ===
                    "granted"
                ) {

                    showToast(
                        "Notifications enabled 🔔"
                    );

                }
                else {

                    showToast(
                        "Notification permission was not granted."
                    );

                }

            }
        );

}


function sendHabitNotification(
    task
) {

    if (
        !("Notification" in window)
    )
        return;


    if (
        Notification.permission !==
        "granted"
    )
        return;


    try {

        new Notification(
            "🔔 Habit Reminder",
            {

                body:
                    `Time to complete ${task.icon} ${task.name}!`,

                tag:
                    `habit-${task.id}`

            }
        );

    }
    catch (error) {

        console.error(
            "Notification error:",
            error
        );

    }

}


function checkReminders() {

    const now =
        new Date();


    const currentTime =
        `${pad(
            now.getHours()
        )}:${pad(
            now.getMinutes()
        )}`;


    const today =
        todayKey();


    data.tasks.forEach(
        task => {

            ensureReminder(task);


            if (
                !task.reminder.enabled
            )
                return;


            if (
                task.reminder.time !==
                currentTime
            )
                return;


            if (
                task.completions &&
                task.completions[today]
            )
                return;


            const sessionKey =
                `habitReminder_${task.id}_${today}_${currentTime}`;


            if (
                sessionStorage.getItem(
                    sessionKey
                )
            )
                return;


            sessionStorage.setItem(
                sessionKey,
                "1"
            );


            sendHabitNotification(
                task
            );

        }
    );

}


setInterval(
    checkReminders,
    10000
);


/* =========================================================
   TODAY REMINDERS
========================================================= */

function renderTodayReminders() {

    const container =
        document.getElementById(
            "todayReminders"
        );


    if (!container)
        return;


    const reminders =
        data.tasks
            .filter(
                task => {

                    ensureReminder(
                        task
                    );


                    return (
                        task.reminder.enabled
                    );

                }
            )
            .sort(
                (a,b) =>
                    a.reminder.time
                        .localeCompare(
                            b.reminder.time
                        )
            );


    if (
        reminders.length === 0
    ) {

        container.innerHTML = `

            <div class="no-reminders">

                🔕 No reminders scheduled.

                Enable a reminder on any
                habit to see it here.

            </div>

        `;

        return;

    }


    const today =
        todayKey();


    container.innerHTML =
        reminders
            .map(
                task => {

                    const completed =
                        Boolean(
                            task.completions &&
                            task.completions[
                                today
                            ]
                        );


                    return `

                        <div
                            class="
                                reminder-item
                                ${
                                    completed
                                        ? "completed"
                                        : ""
                                }
                            "
                        >

                            <div class="reminder-item-icon">

                                ${task.icon}

                            </div>


                            <div class="reminder-item-info">

                                <strong>

                                    ${escapeHTML(
                                        task.name
                                    )}

                                </strong>

                                <small>

                                    🔔
                                    ${formatReminderTime(
                                        task.reminder.time
                                    )}

                                </small>

                            </div>


                            <div
                                class="
                                    reminder-status
                                    ${
                                        completed
                                            ? "reminder-completed"
                                            : ""
                                    }
                                "
                            >

                                ${
                                    completed
                                        ? "✓ Done"
                                        : "Pending"
                                }

                            </div>

                        </div>

                    `;

                }
            )
            .join("");

}


setInterval(
    renderTodayReminders,
    30000
);


/* =========================================================
   JOURNAL
========================================================= */

function ensureJournal() {

    if (!data.journal) {

        data.journal = {};

    }

}


function getJournal(
    date
) {

    ensureJournal();


    const key =
        dateKey(date);


    if (
        !data.journal[key]
    ) {

        data.journal[key] = {

            mood:
                "",

            energy:
                0,

            notes:
                ""

        };

    }


    return data.journal[key];

}


function initializeJournal() {

    const input =
        document.getElementById(
            "journalDate"
        );


    if (!input)
        return;


    input.value =
        dateKey(
            selectedJournalDate
        );


    loadJournalForSelectedDate();

}


function loadJournalForSelectedDate() {

    const input =
        document.getElementById(
            "journalDate"
        );


    if (
        input &&
        input.value
    ) {

        selectedJournalDate =
            new Date(
                input.value +
                "T00:00:00"
            );

    }


    const journal =
        getJournal(
            selectedJournalDate
        );


    document.getElementById(
        "journalNotes"
    ).value =
        journal.notes ||
        "";


    document
        .querySelectorAll(
            ".mood-btn"
        )
        .forEach(
            button => {

                button.classList.toggle(
                    "selected",
                    button.dataset.mood ===
                    journal.mood
                );

            }
        );


    document
        .querySelectorAll(
            ".energy-btn"
        )
        .forEach(
            button => {

                button.classList.toggle(
                    "selected",
                    Number(
                        button.dataset.energy
                    ) ===
                    Number(
                        journal.energy
                    )
                );

            }
        );

}


function selectMood(
    mood
) {

    const journal =
        getJournal(
            selectedJournalDate
        );


    journal.mood =
        mood;


    document
        .querySelectorAll(
            ".mood-btn"
        )
        .forEach(
            button => {

                button.classList.toggle(
                    "selected",
                    button.dataset.mood ===
                    mood
                );

            }
        );


    saveData();

}


function selectEnergy(
    energy
) {

    const journal =
        getJournal(
            selectedJournalDate
        );


    journal.energy =
        energy;


    document
        .querySelectorAll(
            ".energy-btn"
        )
        .forEach(
            button => {

                button.classList.toggle(
                    "selected",
                    Number(
                        button.dataset.energy
                    ) ===
                    Number(energy)
                );

            }
        );


    saveData();

}


function saveJournal() {

    const journal =
        getJournal(
            selectedJournalDate
        );


    journal.notes =
        document
            .getElementById(
                "journalNotes"
            )
            .value;


    saveData();


    showToast(
        "Journal saved successfully 📝"
    );

}


function clearJournal() {

    const confirmed =
        confirm(
            "Clear the journal for this date?"
        );


    if (!confirmed)
        return;


    const key =
        dateKey(
            selectedJournalDate
        );


    delete data.journal[key];


    saveData();


    loadJournalForSelectedDate();


    showToast(
        "Journal cleared."
    );

}


function changeJournalDate(
    amount
) {

    selectedJournalDate =
        new Date(
            selectedJournalDate
                .getFullYear(),
            selectedJournalDate
                .getMonth(),
            selectedJournalDate
                .getDate() +
                amount
        );


    document.getElementById(
        "journalDate"
    ).value =
        dateKey(
            selectedJournalDate
        );


    loadJournalForSelectedDate();

}


function goToJournalToday() {

    selectedJournalDate =
        new Date();


    document.getElementById(
        "journalDate"
    ).value =
        dateKey(
            selectedJournalDate
        );


    loadJournalForSelectedDate();

}


/* =========================================================
   ACHIEVEMENTS
========================================================= */

const ACHIEVEMENTS = [

    {
        id:
            "first",

        icon:
            "🌱",

        title:
            "First Step",

        description:
            "Complete your first habit day.",

        requirement:
            1

    },

    {
        id:
            "three",

        icon:
            "✨",

        title:
            "3 Day Starter",

        description:
            "Reach a 3-day streak.",

        requirement:
            3

    },

    {
        id:
            "seven",

        icon:
            "🔥",

        title:
            "One Week",

        description:
            "Reach a 7-day streak.",

        requirement:
            7

    },

    {
        id:
            "fourteen",

        icon:
            "⚡",

        title:
            "Two Weeks",

        description:
            "Reach a 14-day streak.",

        requirement:
            14

    },

    {
        id:
            "thirty",

        icon:
            "🏆",

        title:
            "30 Day Champion",

        description:
            "Reach a 30-day streak.",

        requirement:
            30

    },

    {
        id:
            "fifty",

        icon:
            "👑",

        title:
            "50 Day Master",

        description:
            "Reach a 50-day streak.",

        requirement:
            50

    },

    {
        id:
            "hundred",

        icon:
            "💎",

        title:
            "100 Day Legend",

        description:
            "Reach a 100-day streak.",

        requirement:
            100

    }

];


function getBestOverallStreak() {

    let best = 0;


    data.tasks.forEach(
        task => {

            best =
                Math.max(
                    best,
                    getLongestStreak(
                        task
                    )
                );

        }
    );


    return best;

}


function getTotalCompleted() {

    let total = 0;


    data.tasks.forEach(
        task => {

            if (
                task.completions
            ) {

                total +=
                    Object.keys(
                        task.completions
                    )
                    .filter(
                        key =>
                            task.completions[key]
                    )
                    .length;

            }

        }
    );


    return total;

}


function renderAchievements() {

    const container =
        document.getElementById(
            "achievementsContainer"
        );


    if (!container)
        return;


    const best =
        getBestOverallStreak();


    const total =
        getTotalCompleted();


    let unlockedCount = 0;


    container.innerHTML =
        ACHIEVEMENTS
            .map(
                achievement => {

                    const unlocked =
                        achievement.id ===
                        "first"

                            ? total >= 1

                            : best >=
                              achievement.requirement;


                    if (
                        unlocked
                    ) {

                        unlockedCount++;

                    }


                    return `

                        <div
                            class="
                                achievement-card
                                ${
                                    unlocked
                                        ? "unlocked"
                                        : "locked"
                                }
                            "
                        >

                            <div class="achievement-icon">

                                ${
                                    unlocked
                                        ? achievement.icon
                                        : "🔒"
                                }

                            </div>


                            <strong>

                                ${achievement.title}

                            </strong>


                            <small>

                                ${achievement.description}

                            </small>


                            <div
                                class="achievement-status"
                            >

                                ${
                                    unlocked
                                        ? "✓ Unlocked"
                                        : "Locked"
                                }

                            </div>

                        </div>

                    `;

                }
            )
            .join("");


    document.getElementById(
        "achievementCount"
    ).textContent =
        `${unlockedCount}/${ACHIEVEMENTS.length}`;

}


/* =========================================================
   GOALS
========================================================= */

function ensureGoal(
    task
) {

    if (!task.goal) {

        task.goal = {

            target:
                30,

            type:
                "days"

        };

    }


    if (
        !task.goal.target ||
        task.goal.target < 1
    ) {

        task.goal.target =
            30;

    }

}


function getYearTaskCompleted(
    task,
    year
) {

    if (
        !task.completions
    ) {

        return 0;

    }


    let count = 0;


    Object.keys(
        task.completions
    )
    .forEach(
        key => {

            if (
                key.startsWith(
                    `${year}-`
                ) &&
                task.completions[key]
            ) {

                count++;

            }

        }
    );


    return count;

}


function saveGoal(
    taskId
) {

    const task =
        data.tasks.find(
            item =>
                item.id ===
                taskId
        );


    if (!task)
        return;


    ensureGoal(task);


    const input =
        document.getElementById(
            `goal-${taskId}`
        );


    const value =
        Number(
            input.value
        );


    if (
        !value ||
        value < 1
    ) {

        showToast(
            "Enter a valid goal."
        );

        return;

    }


    task.goal.target =
        value;


    saveData();


    renderGoals();


    showToast(
        "Goal updated 🎯"
    );

}


function renderGoals() {

    const container =
        document.getElementById(
            "goalsContainer"
        );


    if (!container)
        return;


    if (
        data.tasks.length === 0
    ) {

        container.innerHTML = `

            <div class="empty-state">

                🎯 Add a habit to create
                a goal.

            </div>

        `;

        return;

    }


    data.tasks.forEach(
        task =>
            ensureGoal(task)
    );


    container.innerHTML =
        data.tasks
            .map(
                task => {

                    const completed =
                        getYearTaskCompleted(
                            task,
                            statisticsYear
                        );


                    const target =
                        task.goal.target;


                    const percent =
                        Math.min(
                            100,
                            Math.round(
                                (
                                    completed /
                                    target
                                ) * 100
                            )
                        );


                    return `

                        <div class="goal-card">


                            <div class="goal-header">

                                <div class="goal-icon">

                                    ${task.icon}

                                </div>


                                <strong>

                                    ${escapeHTML(
                                        task.name
                                    )}

                                </strong>

                            </div>


                            <div class="goal-input-row">

                                <input
                                    type="number"
                                    min="1"
                                    id="goal-${task.id}"
                                    value="${target}"
                                >


                                <button
                                    class="goal-save-btn"
                                    onclick="
                                        saveGoal(
                                            '${task.id}'
                                        )
                                    "
                                >
                                    Save
                                </button>

                            </div>


                            <div class="goal-progress">

                                <div
                                    class="goal-progress-fill"
                                    style="
                                        width:
                                        ${percent}%;
                                    "
                                ></div>

                            </div>


                            <div class="goal-info">

                                <span>

                                    ${completed}
                                    /
                                    ${target}
                                    days

                                </span>


                                <span>

                                    ${percent}%

                                </span>

                            </div>

                        </div>

                    `;

                }
            )
            .join("");

}


/* =========================================================
   YEAR STATISTICS
========================================================= */

function initializeYearSelector() {

    const selector =
        document.getElementById(
            "yearSelector"
        );


    if (!selector)
        return;


    const currentYear =
        new Date().getFullYear();


    selector.innerHTML =
        "";


    for (
        let year =
            currentYear - 3;

        year <=
            currentYear + 2;

        year++
    ) {

        selector.innerHTML += `

            <option
                value="${year}"
                ${
                    year ===
                    statisticsYear
                        ? "selected"
                        : ""
                }
            >
                ${year}
            </option>

        `;

    }

}


function changeStatisticsYear() {

    statisticsYear =
        Number(
            document
                .getElementById(
                    "yearSelector"
                )
                .value
        );


    renderYearStatistics();

    renderGoals();

}


function getYearStats(
    year
) {

    let completed = 0;

    let eligible = 0;


    data.tasks.forEach(
        task => {

            for (
                let month = 0;
                month < 12;
                month++
            ) {

                const total =
                    daysInMonth(
                        year,
                        month
                    );


                for (
                    let day = 1;
                    day <= total;
                    day++
                ) {

                    const date =
                        new Date(
                            year,
                            month,
                            day
                        );


                    if (
                        !isFutureDate(
                            date
                        )
                    ) {

                        eligible++;


                        if (
                            task.completions &&
                            task.completions[
                                dateKey(date)
                            ]
                        ) {

                            completed++;

                        }

                    }

                }

            }

        }
    );


    let best = 0;


    data.tasks.forEach(
        task => {

            best =
                Math.max(
                    best,
                    getYearLongestStreak(
                        task,
                        year
                    )
                );

        }
    );


    return {

        completed:
            completed,

        eligible:
            eligible,

        rate:
            eligible
                ? Math.round(
                    (
                        completed /
                        eligible
                    ) * 100
                )
                : 0,

        best:
            best

    };

}


function renderYearStatistics() {

    const element =
        document.getElementById("yearCompleted");

    if (!element)
        return;

    const stats =
        getYearStats(
            statisticsYear
        );

    element.textContent =
        stats.completed;


    document.getElementById(
        "yearEligible"
    ).textContent =
        stats.eligible;


    document.getElementById(
        "yearRate"
    ).textContent =
        `${stats.rate}%`;


    document.getElementById(
        "yearBestStreak"
    ).textContent =
        `${stats.best} days`;


    document.getElementById(
        "yearProgressText"
    ).textContent =
        `${stats.rate}%`;


    document.getElementById(
        "yearProgressBar"
    ).style.width =
        `${stats.rate}%`;


    renderYearMonths();

}


function renderYearMonths() {

    const container =
        document.getElementById(
            "yearMonths"
        );


    if (!container)
        return;


    const names = [

        "January",
        "February",
        "March",
        "April",
        "May",
        "June",
        "July",
        "August",
        "September",
        "October",
        "November",
        "December"

    ];


    container.innerHTML =
        names
            .map(
                (
                    name,
                    month
                ) => {

                    let completed = 0;

                    let eligible = 0;


                    data.tasks.forEach(
                        task => {

                            const total =
                                daysInMonth(
                                    statisticsYear,
                                    month
                                );


                            for (
                                let day = 1;
                                day <= total;
                                day++
                            ) {

                                const date =
                                    new Date(
                                        statisticsYear,
                                        month,
                                        day
                                    );


                                if (
                                    !isFutureDate(
                                        date
                                    )
                                ) {

                                    eligible++;


                                    if (
                                        task.completions &&
                                        task.completions[
                                            dateKey(date)
                                        ]
                                    ) {

                                        completed++;

                                    }

                                }

                            }

                        }
                    );


                    const rate =
                        eligible
                            ? Math.round(
                                (
                                    completed /
                                    eligible
                                ) * 100
                            )
                            : 0;


                    return `

                        <div
                            class="year-month-card"
                        >

                            <strong>
                                ${name}
                            </strong>


                            <div
                                class="year-month-rate"
                            >
                                ${rate}%
                            </div>


                            <small>

                                ${completed}
                                /
                                ${eligible}
                                completed

                            </small>

                        </div>

                    `;

                }
            )
            .join("");

}


/* =========================================================
   DASHBOARD
========================================================= */

function renderTodayDashboard() {

    const today =
        new Date();


    let completed = 0;

    let eligible = 0;


    data.tasks.forEach(
        task => {

            if (
                !isFutureDate(
                    today
                )
            ) {

                eligible++;


                if (
                    task.completions &&
                    task.completions[
                        dateKey(today)
                    ]
                ) {

                    completed++;

                }

            }

        }
    );


    const percent =
        eligible
            ? Math.round(
                (
                    completed /
                    eligible
                ) * 100
            )
            : 0;


    document.getElementById(
        "dashboardTodayText"
    ).textContent =
        `${completed} / ${eligible}`;


    document.getElementById(
        "dashboardTodayBar"
    ).style.width =
        `${percent}%`;


    document.getElementById(
        "dashboardTodayPercent"
    ).textContent =
        `${percent}%`;

}


function renderDashboardSummary() {

    const year =
        selectedDate.getFullYear();


    const month =
        selectedDate.getMonth();


    const start =
        new Date(
            year,
            month,
            1
        );


    const end =
        new Date(
            year,
            month,
            daysInMonth(
                year,
                month
            )
        );


    const stats =
        getOverallRangeStats(
            start,
            end
        );


    let active = 0;

    let best = 0;


    data.tasks.forEach(
        task => {

            const current =
                getCurrentStreak(
                    task
                );


            const longest =
                getLongestStreak(
                    task
                );


            if (
                current > 0
            ) {

                active++;

            }


            best =
                Math.max(
                    best,
                    longest
                );

        }
    );


    document.getElementById(
        "dashboardActiveStreaks"
    ).textContent =
        active;


    document.getElementById(
        "dashboardMonthCompletions"
    ).textContent =
        stats.completed;


    document.getElementById(
        "dashboardBestStreak"
    ).textContent =
        `${best} days`;

}


function getWeekStart(
    date
) {

    const d =
        new Date(date);


    d.setHours(
        0,
        0,
        0,
        0
    );


    d.setDate(
        d.getDate() -
        d.getDay()
    );


    return d;

}


function renderWeeklyDashboard() {

    const container =
        document.getElementById(
            "weeklyChart"
        );


    const start =
        getWeekStart(
            new Date()
        );


    let html = "";


    for (
        let i = 0;
        i < 7;
        i++
    ) {

        const date =
            new Date(start);


        date.setDate(
            start.getDate() +
            i
        );


        let completed = 0;

        let eligible = 0;


        data.tasks.forEach(
            task => {

                if (
                    !isFutureDate(
                        date
                    )
                ) {

                    eligible++;


                    if (
                        task.completions &&
                        task.completions[
                            dateKey(date)
                        ]
                    ) {

                        completed++;

                    }

                }

            }
        );


        const percent =
            eligible
                ? Math.round(
                    (
                        completed /
                        eligible
                    ) * 100
                )
                : 0;


        const dayName =
            date.toLocaleDateString(
                "en-US",
                {
                    weekday:
                        "short"
                }
            );


        html += `

            <div class="week-day">

                <div class="week-value">
                    ${percent}%
                </div>


                <div class="week-bar-container">

                    <div
                        class="week-bar"
                        style="
                            height:
                            ${percent}%;
                        "
                    ></div>

                </div>


                <div class="week-day-label">
                    ${dayName}
                </div>

            </div>

        `;

    }


    container.innerHTML =
        html;

}


function renderMonthlyDashboard() {

    const year =
        selectedDate.getFullYear();


    const month =
        selectedDate.getMonth();


    const stats =
        getOverallRangeStats(

            new Date(
                year,
                month,
                1
            ),

            new Date(
                year,
                month,
                daysInMonth(
                    year,
                    month
                )
            )

        );


    document.getElementById(
        "monthlyPerformanceText"
    ).textContent =
        `${stats.rate}%`;


    document.getElementById(
        "monthlyProgressBar"
    ).style.width =
        `${stats.rate}%`;


    document.getElementById(
        "monthlyCompletedDays"
    ).textContent =
        stats.completed;


    document.getElementById(
        "monthlyEligibleDays"
    ).textContent =
        stats.eligible;

}


function renderHabitInsights() {

    if (
        data.tasks.length === 0
    ) {

        document.getElementById(
            "strongestHabit"
        ).textContent =
            "—";


        document.getElementById(
            "strongestHabitRate"
        ).textContent =
            "—";


        document.getElementById(
            "attentionHabit"
        ).textContent =
            "—";


        document.getElementById(
            "attentionHabitRate"
        ).textContent =
            "—";


        document.getElementById(
            "longestCurrentHabit"
        ).textContent =
            "—";


        document.getElementById(
            "longestCurrentDays"
        ).textContent =
            "0 days";


        return;

    }


    const stats =
        data.tasks.map(
            task => {

                const monthly =
                    getMonthlyCompletion(
                        task
                    );


                return {

                    task:
                        task,

                    rate:
                        monthly.rate,

                    current:
                        getCurrentStreak(
                            task
                        )

                };

            }
        );


    const strongest =
        [...stats]
            .sort(
                (a,b) =>
                    b.rate -
                    a.rate
            )[0];


    const attention =
        [...stats]
            .sort(
                (a,b) =>
                    a.rate -
                    b.rate
            )[0];


    const longest =
        [...stats]
            .sort(
                (a,b) =>
                    b.current -
                    a.current
            )[0];


    document.getElementById(
        "strongestHabit"
    ).textContent =
        strongest.task.name;


    document.getElementById(
        "strongestHabitRate"
    ).textContent =
        `${strongest.rate}% completion`;


    document.getElementById(
        "attentionHabit"
    ).textContent =
        attention.task.name;


    document.getElementById(
        "attentionHabitRate"
    ).textContent =
        `${attention.rate}% completion`;


    document.getElementById(
        "longestCurrentHabit"
    ).textContent =
        longest.task.name;


    document.getElementById(
        "longestCurrentDays"
    ).textContent =
        `${longest.current} day${
            longest.current === 1
                ? ""
                : "s"
        }`;

}


/* =========================================================
   TASK CARD
========================================================= */

function createTaskCard(
    task
) {

    ensureReminder(task);

    ensureGoal(task);


    const current =
        getCurrentStreak(
            task
        );


    const longest =
        getLongestStreak(
            task
        );


    const monthly =
        getMonthlyCompletion(
            task
        );


    const monthlyBest =
        getMonthlyBestStreak(
            task
        );


    const percent =
        longest > 0
            ? Math.min(
                100,
                Math.round(
                    (
                        current /
                        longest
                    ) * 100
                )
            )
            : 0;


    return `

        <article class="task-card">


            <div class="task-header">


                <div class="task-info">

                    <div class="task-icon">
                        ${task.icon}
                    </div>


                    <div>

                        <div class="task-name">

                            ${escapeHTML(
                                task.name
                            )}

                        </div>


                        <div class="task-target">

                            Target:
                            ${task.target}
                            ${escapeHTML(
                                task.unit
                            )}

                        </div>

                    </div>

                </div>



                <div class="task-menu">


                    <button
                        class="menu-button"
                        onclick="
                            toggleMenu(
                                '${task.id}'
                            )
                        "
                    >
                        ⋮
                    </button>


                    <div
                        id="menu-${task.id}"
                        class="menu-dropdown"
                    >


                        <button
                            onclick="
                                openEditModal(
                                    '${task.id}'
                                )
                            "
                        >
                            ✏️ Edit Habit
                        </button>


                        <button
                            onclick="
                                deleteThisMonth(
                                    '${task.id}'
                                )
                            "
                        >
                            🗑 Delete This Month
                        </button>


                        <button
                            class="delete"
                            onclick="
                                deleteTask(
                                    '${task.id}'
                                )
                            "
                        >
                            ❌ Delete Habit
                        </button>


                    </div>

                </div>

            </div>



            <!-- REMINDER -->

            <div class="reminder-box">


                <div class="reminder-left">

                    <span class="reminder-bell">
                        🔔
                    </span>


                    <div>

                        <strong>
                            Reminder
                        </strong>


                        <small>

                            ${
                                task.reminder.enabled
                                    ? `Every day at
                                       ${formatReminderTime(
                                           task.reminder.time
                                       )}`
                                    : "Reminder disabled"
                            }

                        </small>

                    </div>

                </div>



                <div class="reminder-controls">


                    <label class="switch">

                        <input
                            type="checkbox"

                            ${
                                task.reminder.enabled
                                    ? "checked"
                                    : ""
                            }

                            onchange="
                                toggleReminder(
                                    '${task.id}',
                                    this.checked
                                )
                            "
                        >

                        <span class="slider"></span>

                    </label>


                    <input
                        type="time"
                        class="reminder-time"
                        value="${task.reminder.time}"
                        onchange="
                            updateReminderTime(
                                '${task.id}',
                                this.value
                            )
                        "
                    >

                </div>

            </div>



            ${createCalendar(task)}



            <!-- STATS -->

            <div class="task-stats">


                <div class="stat">

                    <span>
                        This Month
                    </span>

                    <strong>
                        ${monthly.completed}
                    </strong>

                </div>


                <div class="stat">

                    <span>
                        Month Best
                    </span>

                    <strong>
                        ${monthlyBest}
                    </strong>

                </div>


                <div class="stat">

                    <span>
                        All Time
                    </span>

                    <strong>
                        ${longest}
                    </strong>

                </div>


            </div>



            <!-- STREAK -->

            <div class="streak-section">


                <div class="streak-row">


                    <div class="streak-current">

                        🔥 ${current}
                        day${current === 1 ? "" : "s"}

                    </div>


                    <div class="streak-best">

                        Best:
                        ${longest}

                    </div>


                </div>


                <div class="streak-label">

                    ${getStreakLabel(
                        current
                    )}

                </div>


                <div class="streak-progress">

                    <div
                        class="streak-progress-fill"
                        style="
                            width:
                            ${percent}%;
                        "
                    ></div>

                </div>


            </div>


        </article>

    `;

}


/* =========================================================
   TASK RENDER
========================================================= */

function renderTasks() {

    const container =
        document.getElementById(
            "tasksContainer"
        );


    data.tasks.forEach(
        task => {

            ensureReminder(task);

            ensureGoal(task);

            if (!task.completions) {

                task.completions = {};

            }

        }
    );


    if (
        data.tasks.length === 0
    ) {

        container.innerHTML = `

            <div class="empty-state">

                <div class="empty-state-icon">
                    🌱
                </div>


                <h3>
                    No habits yet
                </h3>


                <p>
                    Add your first habit and
                    start building your streak.
                </p>

            </div>

        `;

        return;

    }


    container.innerHTML =
        data.tasks
            .map(
                task =>
                    createTaskCard(
                        task
                    )
            )
            .join("");

}


/* =========================================================
   SUMMARY
========================================================= */

function renderSummary() {

    const today =
        new Date();


    const key =
        dateKey(today);


    let completed = 0;

    let best = 0;


    data.tasks.forEach(
        task => {

            if (
                task.completions &&
                task.completions[key]
            ) {

                completed++;

            }


            best =
                Math.max(
                    best,
                    getLongestStreak(
                        task
                    )
                );

        }
    );


    const total =
        data.tasks.length;


    const percent =
        total
            ? Math.round(
                (
                    completed /
                    total
                ) * 100
            )
            : 0;


    document.getElementById(
        "todayCompletion"
    ).textContent =
        `${percent}%`;


    document.getElementById(
        "completedToday"
    ).textContent =
        completed;


    document.getElementById(
        "totalTasks"
    ).textContent =
        total;


    document.getElementById(
        "overallBest"
    ).textContent =
        `${best} days`;

}


/* =========================================================
   MENU
========================================================= */

function toggleMenu(
    taskId
) {

    const menu =
        document.getElementById(
            `menu-${taskId}`
        );


    if (!menu)
        return;


    document
        .querySelectorAll(
            ".menu-dropdown"
        )
        .forEach(
            item => {

                if (
                    item !== menu
                ) {

                    item.classList.remove(
                        "show"
                    );

                }

            }
        );


    menu.classList.toggle(
        "show"
    );

}


document.addEventListener(
    "click",
    event => {

        if (
            !event.target.closest(
                ".task-menu"
            )
        ) {

            document
                .querySelectorAll(
                    ".menu-dropdown"
                )
                .forEach(
                    menu =>
                        menu.classList.remove(
                            "show"
                        )
                );

        }

    }
);


/* =========================================================
   DELETE MONTH
========================================================= */

function deleteThisMonth(
    taskId
) {

    const task =
        data.tasks.find(
            item =>
                item.id ===
                taskId
        );


    if (!task)
        return;


    const month =
        monthKey(
            selectedDate
        );


    const confirmed =
        confirm(
            `Delete all records for ${month}? Previous months will remain safe.`
        );


    if (!confirmed)
        return;


    if (
        task.completions
    ) {

        Object.keys(
            task.completions
        )
        .forEach(
            key => {

                if (
                    key.startsWith(
                        month
                    )
                ) {

                    delete task.completions[
                        key
                    ];

                }

            }
        );

    }


    saveData();


    render();


    showToast(
        "This month's records deleted."
    );

}


/* =========================================================
   DELETE TASK
========================================================= */

function deleteTask(
    taskId
) {

    const task =
        data.tasks.find(
            item =>
                item.id ===
                taskId
        );


    if (!task)
        return;


    const confirmed =
        confirm(
            `Delete "${task.name}" and all its history?`
        );


    if (!confirmed)
        return;


    data.tasks =
        data.tasks.filter(
            item =>
                item.id !==
                taskId
        );


    saveData();


    render();


    showToast(
        "Habit deleted."
    );

}


/* =========================================================
   EXCEL EXPORT
========================================================= */

function exportToExcel() {

    if (
        data.tasks.length === 0
    ) {

        showToast(
            "Add at least one habit first."
        );

        return;

    }


    if (
        typeof XLSX ===
        "undefined"
    ) {

        showToast(
            "Excel library is not loaded. Check your internet connection."
        );

        return;

    }


    const rows = [];


    data.tasks.forEach(
        task => {

            Object.keys(
                task.completions ||
                {}
            )
            .forEach(
                date => {

                    rows.push({

                        Date:
                            date,

                        Habit:
                            task.name,

                        Icon:
                            task.icon,

                        Target:
                            task.target,

                        Unit:
                            task.unit,

                        Completed:
                            task.completions[
                                date
                            ]
                                ? "Yes"
                                : "No",

                        CurrentStreak:
                            getCurrentStreak(
                                task
                            ),

                        LongestStreak:
                            getLongestStreak(
                                task
                            ),

                        ReminderEnabled:
                            task.reminder &&
                            task.reminder.enabled
                                ? "Yes"
                                : "No",

                        ReminderTime:
                            task.reminder &&
                            task.reminder.time
                                ? task.reminder.time
                                : "",

                        Goal:
                            task.goal
                                ? task.goal.target
                                : ""

                    });

                }
            );

        }
    );


    const workbook =
        XLSX.utils.book_new();


    const historySheet =
        XLSX.utils.json_to_sheet(
            rows
        );


    XLSX.utils.book_append_sheet(
        workbook,
        historySheet,
        "Habit History"
    );


    /* JOURNAL */

    const journalRows = [];


    Object.keys(
        data.journal ||
        {}
    )
    .forEach(
        date => {

            const journal =
                data.journal[date];


            journalRows.push({

                Date:
                    date,

                Mood:
                    journal.mood ||
                    "",

                Energy:
                    journal.energy ||
                    "",

                Notes:
                    journal.notes ||
                    ""

            });

        }
    );


    if (
        journalRows.length > 0
    ) {

        const journalSheet =
            XLSX.utils.json_to_sheet(
                journalRows
            );


        XLSX.utils.book_append_sheet(
            workbook,
            journalSheet,
            "Journal"
        );

    }


    /* GOALS */

    const goalRows =
        data.tasks.map(
            task => {

                ensureGoal(task);


                return {

                    Habit:
                        task.name,

                    Year:
                        statisticsYear,

                    Goal:
                        task.goal.target,

                    Completed:
                        getYearTaskCompleted(
                            task,
                            statisticsYear
                        )

                };

            }
        );


    if (
        goalRows.length > 0
    ) {

        const goalSheet =
            XLSX.utils.json_to_sheet(
                goalRows
            );


        XLSX.utils.book_append_sheet(
            workbook,
            goalSheet,
            "Goals"
        );

    }


    XLSX.writeFile(
        workbook,
        "My_Habit_Tracker.xlsx"
    );


    showToast(
        "Excel exported successfully 📊"
    );

}


/* =========================================================
   ESCAPE HTML
========================================================= */

function escapeHTML(
    value
) {

    return String(value)

        .replace(
            /&/g,
            "&amp;"
        )

        .replace(
            /</g,
            "&lt;"
        )

        .replace(
            />/g,
            "&gt;"
        )

        .replace(
            /"/g,
            "&quot;"
        )

        .replace(
            /'/g,
            "&#039;"
        );

}


/* =========================================================
   TOAST
========================================================= */

function showToast(
    message
) {

    const toast =
        document.getElementById(
            "toast"
        );


    if (!toast)
        return;


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
   MODAL EVENTS
========================================================= */

document.addEventListener(
    "keydown",
    event => {

        if (
            event.key ===
            "Escape"
        ) {

            closeAddModal();
            closeEditModal();
            closeBackupModal();
            closeSidebar();

        }

    }
);


const addModalEl = document.getElementById("addModal");
if (addModalEl) {
    addModalEl.addEventListener("click", function(event) {
        if (event.target === this) closeAddModal();
    });
}

const editModalEl = document.getElementById("editModal");
if (editModalEl) {
    editModalEl.addEventListener("click", function(event) {
        if (event.target === this) closeEditModal();
    });
}

const backupModalEl = document.getElementById("backupModal");
if (backupModalEl) {
    backupModalEl.addEventListener("click", function(event) {
        if (event.target === this) closeBackupModal();
    });
}


/* =========================================================
   PWA INSTALL SUPPORT
========================================================= */

let deferredInstallPrompt =
    null;


window.addEventListener(
    "beforeinstallprompt",
    event => {

        event.preventDefault();


        deferredInstallPrompt =
            event;


        const button =
            document.getElementById(
                "installAppButton"
            );


        if (button) {

            button.style.display =
                "inline-flex";

        }

    }
);


async function installApp() {

    if (
        !deferredInstallPrompt
    ) {

        showToast(
            "App installation is not available yet."
        );

        return;

    }


    deferredInstallPrompt.prompt();


    const result =
        await deferredInstallPrompt.userChoice;


    if (
        result.outcome ===
        "accepted"
    ) {

        showToast(
            "My Habit Tracker installed 📱"
        );

    }
    else {

        showToast(
            "Installation cancelled."
        );

    }


    deferredInstallPrompt =
        null;


    const button =
        document.getElementById(
            "installAppButton"
        );


    if (button) {

        button.style.display =
            "none";

    }

}


window.addEventListener(
    "appinstalled",
    () => {

        deferredInstallPrompt =
            null;


        const button =
            document.getElementById(
                "installAppButton"
            );


        if (button) {

            button.style.display =
                "none";

        }

    }
);


/* =========================================================
   OPTIONAL SERVICE WORKER
========================================================= */

function registerServiceWorker() {

    if (
        !("serviceWorker" in navigator)
    )
        return;


    window.addEventListener(
        "load",
        () => {

            navigator.serviceWorker
                .register(
                    "./service-worker.js"
                )
                .then(
                    registration => {

                        console.log(
                            "Service Worker registered:",
                            registration.scope
                        );

                    }
                )
                .catch(
                    error => {

                        /*
                         Service worker is optional.
                         The website continues working
                         normally if the file does not exist.
                        */

                        console.log(
                            "PWA service worker not available:",
                            error.message
                        );

                    }
                );

        }
    );

}


/* =========================================================
   YEAR & MONTH SIDEBAR ARCHIVE
========================================================= */

let expandedYears = new Set([selectedDate.getFullYear()]);

function toggleSidebar() {
    const sidebar = document.getElementById("yearSidebar");
    if (!sidebar) return;
    const isOpen = sidebar.classList.contains("show");
    if (isOpen) {
        closeSidebar();
    } else {
        openSidebar();
    }
}

function openSidebar() {
    const sidebar = document.getElementById("yearSidebar");
    const backdrop = document.getElementById("sidebarBackdrop");
    if (sidebar) sidebar.classList.add("show");
    if (backdrop) backdrop.classList.add("show");
    renderYearSidebar();
}

function closeSidebar() {
    const sidebar = document.getElementById("yearSidebar");
    const backdrop = document.getElementById("sidebarBackdrop");
    if (sidebar) sidebar.classList.remove("show");
    if (backdrop) backdrop.classList.remove("show");
}

function toggleYearFolder(year) {
    if (expandedYears.has(year)) {
        expandedYears.delete(year);
    } else {
        expandedYears.add(year);
    }
    renderYearSidebar();
}

function selectMonthFromSidebar(year, monthIndex) {
    selectedDate = new Date(year, monthIndex, 1);
    expandedYears.add(year);
    render();
    if (window.innerWidth < 1024) {
        closeSidebar();
    }
    const habitsSection = document.getElementById("tasksContainer");
    if (habitsSection) {
        habitsSection.scrollIntoView({ behavior: "smooth", block: "start" });
    }
    const monthName = selectedDate.toLocaleDateString("en-US", { month: "long", year: "numeric" });
    showToast(`Viewing ${monthName} daily habits 📅`);
}

function getAvailableYears() {
    const yearsSet = new Set();
    const currentYear = new Date().getFullYear();
    yearsSet.add(currentYear);
    yearsSet.add(selectedDate.getFullYear());

    if (data && data.tasks) {
        data.tasks.forEach(task => {
            if (task.completions) {
                Object.keys(task.completions).forEach(key => {
                    const y = parseInt(key.substring(0, 4), 10);
                    if (!isNaN(y)) yearsSet.add(y);
                });
            }
        });
    }

    return Array.from(yearsSet).sort((a, b) => b - a);
}

function getMonthStreak(year, monthIndex) {
    let maxStreak = 0;
    if (!data.tasks || data.tasks.length === 0) return 0;

    const daysCount = daysInMonth(year, monthIndex);

    data.tasks.forEach(task => {
        let current = 0;
        for (let d = 1; d <= daysCount; d++) {
            const date = new Date(year, monthIndex, d);
            const key = dateKey(date);
            if (!isFutureDate(date) && task.completions && task.completions[key]) {
                current++;
                if (current > maxStreak) {
                    maxStreak = current;
                }
            } else {
                current = 0;
            }
        }
    });

    return maxStreak;
}

function getMonthCompletionStats(year, monthIndex) {
    let completed = 0;
    let eligible = 0;
    if (!data.tasks || data.tasks.length === 0) {
        return { completed: 0, eligible: 0, rate: 0 };
    }

    const daysCount = daysInMonth(year, monthIndex);

    data.tasks.forEach(task => {
        for (let d = 1; d <= daysCount; d++) {
            const date = new Date(year, monthIndex, d);
            if (!isFutureDate(date)) {
                eligible++;
                const key = dateKey(date);
                if (task.completions && task.completions[key]) {
                    completed++;
                }
            }
        }
    });

    const rate = eligible > 0 ? Math.round((completed / eligible) * 100) : 0;
    return { completed, eligible, rate };
}

function renderYearSidebar() {
    const container = document.getElementById("sidebarYearsList");
    if (!container) return;

    const years = getAvailableYears();
    const monthNames = [
        "January", "February", "March", "April", "May", "June",
        "July", "August", "September", "October", "November", "December"
    ];

    const currentSelectedYear = selectedDate.getFullYear();
    const currentSelectedMonth = selectedDate.getMonth();

    let html = "";

    years.forEach(year => {
        const isExpanded = expandedYears.has(year);
        const folderGlyph = isExpanded ? "📂" : "📁";
        const chevron = isExpanded ? "▾" : "▸";

        let totalYearCompleted = 0;
        if (data.tasks) {
            data.tasks.forEach(task => {
                totalYearCompleted += getYearTaskCompleted(task, year);
            });
        }

        html += `
            <div class="year-folder ${isExpanded ? "expanded" : ""}">
                <button
                    class="year-folder-header"
                    onclick="toggleYearFolder(${year})"
                    aria-expanded="${isExpanded}"
                    title="Click to expand/collapse ${year}"
                >
                    <div class="year-folder-title">
                        <span class="folder-glyph">${folderGlyph}</span>
                        <span class="year-num">${year}</span>
                    </div>
                    <div class="year-folder-meta">
                        <span class="year-badge">${totalYearCompleted} done</span>
                        <span class="folder-chevron">${chevron}</span>
                    </div>
                </button>

                <div class="year-months-list" style="display: ${isExpanded ? 'flex' : 'none'};">
        `;

        for (let m = 0; m < 12; m++) {
            const isSelected = (year === currentSelectedYear && m === currentSelectedMonth);
            const streak = getMonthStreak(year, m);
            const stats = getMonthCompletionStats(year, m);
            const mName = monthNames[m];

            html += `
                <div
                    class="sidebar-month-item ${isSelected ? "active" : ""}"
                    onclick="selectMonthFromSidebar(${year}, ${m})"
                    role="button"
                    tabindex="0"
                    title="${mName} ${year} - ${stats.completed} completions, ${streak} day streak"
                >
                    <div class="month-item-main">
                        <span class="month-item-bullet">${isSelected ? "●" : "○"}</span>
                        <span class="month-item-name">${mName}</span>
                    </div>
                    <div class="month-item-badges">
                        <span class="month-streak-badge" title="Best streak in this month">
                            🔥 ${streak}d
                        </span>
                        <span class="month-rate-badge" title="${stats.completed} completed (${stats.rate}%)">
                            ${stats.rate}%
                        </span>
                    </div>
                </div>
            `;
        }

        html += `
                </div>
            </div>
        `;
    });

    container.innerHTML = html;
}


/* =========================================================
   MAIN RENDER
========================================================= */

function render() {

    renderMonthTitle();

    renderSummary();

    renderTodayDashboard();

    renderDashboardSummary();

    renderWeeklyDashboard();

    renderMonthlyDashboard();

    renderHabitInsights();

    renderTodayReminders();

    renderAchievements();

    renderGoals();

    renderTasks();

    renderYearSidebar();

}


/* =========================================================
   INITIALIZATION
========================================================= */

data.tasks.forEach(
    task => {

        if (!task.completions) {

            task.completions = {};

        }


        ensureReminder(task);

        ensureGoal(task);

    }
);


ensureJournal();

saveData();

initializeJournal();


render();


checkReminders();


registerServiceWorker();