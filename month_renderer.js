
var selected_date = new Date()
selected_date.setDate(1)

const MATRIX_ROWS = 6
const MATRIX_COLUMNS = 7

function create_container_matrix() {
    let container = document.getElementById("matrix-container")
    let relative_y = 80
    for(let i = 0; i < MATRIX_ROWS; i++) {
        let relative_x = 20;
        for(let j = 0; j < MATRIX_COLUMNS; j++) {
            let tag = `<div class="matrix-item" style="top: ${relative_y}px; left: ${relative_x}px;" id="matrix-${i}-${j}"></div>`
            container.innerHTML += tag
            relative_x += 140
        }
        relative_y += 140
    }
}

function update_head() {
    let head = document.getElementById("month_and_year")

    head.innerHTML = `${month_name[selected_date.getMonth()]} ${selected_date.getFullYear()}`
}

async function remove_entry(date, time_start, time_end, message, color, schedule) {
    let check = await window.electronAPI.handle_confirm()
    if(check) {
        let obj = {
            "date": date,
            "time_start": time_start,
            "time_end": time_end,
            "message": message,
            "color": color,
            "schedule": schedule
        }

        window.electronAPI.handle_remove_entry(obj)
        define_month_matrix(selected_date)
    }
}

async function define_month_matrix(date) {
    let first_date = get_monday_at_current_week(date)
    let next = first_date

    // Delete matrix before creating a new matrix
    document.getElementById("matrix-container").innerHTML = ""
    create_container_matrix()

    for(let i = 0; i < MATRIX_ROWS; i++) {
        for(let j = 0; j < MATRIX_COLUMNS; j++) {
            let color = "black"
            if(next.getMonth() != date.getMonth()) {
                color = "#b3b3b3"
            }
            else {
                color = "#000000"
            }

            let array = await window.electronAPI.get_entry_from_date(next)
            array.sort((a, b) => {
                let date1 = new Date(`${a.date} ${a.time_start}`)
                let date2 = new Date(`${b.date} ${b.time_start}`)
                return date1 - date2
            })

            let events = ""
            array.forEach(item => {
                events += `<div style="background-color: ${item.color};" class="event-month"
                 onclick="set_selected_event(this.innerHTML, this.style.backgroundColor)">
                    <a href="javascript:void(0)" style="float: right; text-decoration: none; " 
                    onclick="remove_entry('${item.date}', '${item.time_start}', '${item.time_end}', '${item.message}', '${item.color}', '${item.schedule}')">&times;</a>
                    ${item.time_start} - ${item.time_end}: ${item.message}</div>`
            })

            let tag = `<span style="color: ${color};">${next.getDate()}</span><br> ${events}`
            document.getElementById(`matrix-${i}-${j}`).innerHTML += tag
            document.getElementById(`matrix-${i}-${j}`).style.borderColor = color
            next.setDate(next.getDate() + 1)
        }
    }

    update_head()
}

function month_afterward() {
    selected_date.setMonth(selected_date.getMonth() + 1)
    define_month_matrix(selected_date) 
}

function month_before() {
    selected_date.setMonth(selected_date.getMonth() - 1)
    define_month_matrix(selected_date)
}

window.electronAPI.handle_menu_sidebar((event) => {
    toogle_sidebar()
})

window.addEventListener("load", () => {
    update_sidebar()

    document.getElementById("navbar-month").style.backgroundColor = "yellow"

    document.getElementById("btn_entry").addEventListener("click", () => {
        define_month_matrix(selected_date)
    })
})

define_month_matrix(selected_date)