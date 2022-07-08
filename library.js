const month_name = ["Januar", "Februar", "März", "April", "Mai", "Juni", "Juli", "August", "September", "Oktober", "November", "Dezember"]

function get_monday_at_current_week(current_date) {
    const day = current_date.getDay()
    const first = current_date.getDate() - day + (day === 0 ? -6 : 1)
    const monday = new Date()
    monday.setFullYear(current_date.getFullYear())
    monday.setMonth(current_date.getMonth())
    monday.setDate(first)
    return monday
}

function change_view(choice) {
    if(choice === "week") {
        window.electronAPI.view_to_week()
    }
    if(choice === "month") {
        window.electronAPI.view_to_month()
    }
}

function toogle_navbar() {
    let navbar = document.getElementById("navbar")
    let arrow = document.getElementById("navbar-arrow")

    if(navbar.style.height == "200px") {
        navbar.style.height = "0px"
        arrow.style.top = "0px"
        arrow.innerHTML = "&#8681;"
    }
    else {
        navbar.style.height = "200px"
        arrow.style.top = "200px"
        arrow.innerHTML = "&#8679;"
    }
}

function toogle_sidebar() {
    let sidebar = document.getElementById("entry_sidebar")
    let arrow = document.getElementById("sidebar-arrow")
    if(sidebar.style.width == "400px") {
        sidebar.style.width = "0px"
        arrow.style.left = "0px"
        arrow.innerHTML = "&#8680;"
    }
    else {
        sidebar.style.width = "400px"
        arrow.style.left = "400px"
        arrow.innerHTML = "&#8678;"
    }
}

function update_sidebar() {
    let date_chooser = document.getElementById("entry_date")
    let start_time_chooser = document.getElementById("entry_time_start")
    let end_time_chooser = document.getElementById("entry_time_end")
    let color_chooser = document.getElementById("entry_color")
    let message = document.getElementById("entry_action")
    
    let date = new Date()
    date_chooser.value = `${date.getFullYear()}-${(date.getMonth() + 1).toString().padStart(2, "0")}-${date.getDate().toString().padStart(2, "0")}`
    start_time_chooser.value = `${date.getHours().toString().padStart(2, "0")}:${date.getMinutes().toString().padStart(2, "0")}`
    end_time_chooser.value = `${(date.getHours() + 1).toString().padStart(2, "0")}:${date.getMinutes().toString().padStart(2, "0")}`
    color_chooser.value = `#9bd66b`
}

function on_new_entry() {
    let entry_date = document.getElementById("entry_date")
    let entry_time_start = document.getElementById("entry_time_start")
    let entry_time_end = document.getElementById("entry_time_end")
    let entry_action = document.getElementById("entry_action")
    let entry_color = document.getElementById("entry_color")
    let entry_schedule = document.getElementsByName("entry_schedule")
    
    let entry_obj = {}
    entry_obj["date"] = entry_date.value
    entry_obj["time_start"] = entry_time_start.value
    entry_obj["time_end"] = entry_time_end.value
    entry_obj["message"] = entry_action.value
    entry_obj["color"] = entry_color.value

    entry_schedule.forEach(item => {
        if(item.checked === true) {
            entry_obj["schedule"] = item.value
        }
    })

    window.electronAPI.handle_add_entry(entry_obj)
    update_sidebar()
}

function set_selected_event(message, this_color) {
    let tag = document.getElementById("selected_event")
    tag.innerHTML = message
    tag.style.backgroundColor = this_color
}

window.addEventListener("load", () => {
    let sel_event = document.getElementById("selected_event")
    sel_event.addEventListener("click", (e) => {
        sel_event.style.backgroundColor = "#FFFFFF"
        sel_event.innerHTML = ""
    })
})