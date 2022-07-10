var selected_date = new Date()

function draw_week_axis() {
    let div_rel_y = 60
    tags = ""
    for(let i = 0; i < 25; i++) {
        tags += `<div style="position: absolute; top: ${div_rel_y - 17.5}px; left: 80px;z-index: 1; background-color: white; width: 50px; text-align: center">${i}:00</div>`
        tags += `<hr style="position: absolute; top:${div_rel_y - 10}px; left: 20px; width: 1209px; margin: 0px; border: solid 1px; border-color: #bdbcb9;"></hr>`
        //tags += `<hr style="position: absolute; top:${div_rel_y - 10 + 17.5}px; left: 20px; right: 20px; margin: 0px"></hr>`
        div_rel_y += 35
    }
    main = document.getElementById("main")
    main.innerHTML += tags
}

async function remove_entry(date_start_json, date_end_json, message, color, schedule) {

    let check = await window.electronAPI.handle_confirm()
    if(check) {
        let date_start = new Date(date_start_json)
        let date_end = new Date(date_end_json)
    
        let date_str = `${date_start.getFullYear()}-${(date_start.getMonth() + 1).toString().padStart(2, "0")}-${date_start.getDate().toString().padStart(2, "0")}`
        let time_start_str = `${date_start.getHours().toString().padStart(2, "0")}:${date_start.getMinutes().toString().padStart(2, "0")}`
        let time_end_str = `${date_end.getHours().toString().padStart(2, "0")}:${date_end.getMinutes().toString().padStart(2, "0")}`
    
        let obj = {
            "date": date_str,
            "time_start": time_start_str,
            "time_end": time_end_str,
            "message": message,
            "color": color,
            "schedule": schedule
        }
    
        window.electronAPI.handle_remove_entry(obj)
        define_current_weekdays(selected_date)
    }
}

function add_time_event(date_start, date_end, message, week_day, color, schedule) {
    hours = (date_end.getHours() + (date_end.getMinutes() / 60)) - (date_start.getHours() + (date_start.getMinutes() / 60))
    main = document.getElementById("events")
    const complete_message = `${date_start.getHours().toString().padStart(2, "0")}:${date_start.getMinutes().toString().padStart(2, "0")} - ${date_end.getHours().toString().padStart(2, "0")}:${date_end.getMinutes().toString().padStart(2, "0")}: ${message}`

    tag = `<div class="event-week" onclick="set_selected_event(this.innerHTML, this.style.backgroundColor)" style="
            top: ${50 + (date_start.getHours() + date_start.getMinutes() / 60) * 35}px;
            left: ${181 + week_day * 150}px;
            height: ${35 * hours}px; 
            background-color: ${color}; 
            title="${complete_message}">
                <a href="javascript:void(0)" class="closebtn" onclick="remove_entry('${date_start.toJSON()}', '${date_end.toJSON()}', '${message}', '${color}', '${schedule}')">&times;</a>
                ${complete_message}
            </div>`
    
    main.innerHTML += tag
}

function initialize_entries(entry_array, weekday) {
    for(let i = 0; i < entry_array.length; i++) {
        // Parse into Date object
        let data_date = entry_array[i]["date"].split("-")
        let year = parseInt(data_date[0])
        let month = parseInt(data_date[1]) - 1
        let day = parseInt(data_date[2])
        
        let data_time_start = entry_array[i]["time_start"].split(":")
        let time_start_hour = parseInt(data_time_start[0])
        let time_start_minute = parseInt(data_time_start[1])

        let data_time_end = entry_array[i]["time_end"].split(":")
        let time_end_hour = parseInt(data_time_end[0])
        let time_end_minute = parseInt(data_time_end[1])

        let date_start = new Date(year, month, day, time_start_hour, time_start_minute) // Parse date object
        let date_end = new Date(year, month, day, time_end_hour, time_end_minute) // Parse date object
        add_time_event(date_start, date_end, entry_array[i]["message"], weekday, entry_array[i]["color"], entry_array[i]["schedule"])
    }
}

function define_current_weekdays(current_date) {
    const date_montag = get_monday_at_current_week(current_date)

    const events = Array.from(document.getElementsByClassName("event-week"))
    events.forEach(event => {
        event.remove()
    })
    
    // Das Datum der aktuellen Woche berechnen
    var day_names = ["Montag", "Dienstag", "Mittwoch", "Donnerstag", "Freitag", "Samstag", "Sonntag"]
    var weekday_dates = {}
    weekday_dates[day_names[0]] = date_montag
    for(let i = 1; i < 7; i++) {
        let date = new Date()
        date.setFullYear(weekday_dates[day_names[0]].getFullYear())
        date.setMonth(weekday_dates[day_names[0]].getMonth())
        date.setDate(weekday_dates[day_names[0]].getDate() + i)
        weekday_dates[day_names[i]] = date
    }

    for(let i = 0; i < 7; i++) {
        let tag = document.getElementById(day_names[i].toLowerCase())
        tag.innerHTML = `${day_names[i]} ${weekday_dates[day_names[i]].getDate()}.${weekday_dates[day_names[i]].getMonth() + 1}`
        let result = window.electronAPI.get_entry_from_date(weekday_dates[day_names[i]]) 
        result.then(array => {
            initialize_entries(array, i)
        })
    }

    // Aktuellen Monat der Woche aktualisieren
    //const month_name = ["Januar", "Februar", "März", "April", "Mai", "Juni", "Juli", "August", "September", "Oktober", "November", "Dezember"]
    const chooser = document.getElementById("month-chooser")
    chooser.innerHTML = month_name[weekday_dates["Montag"].getMonth()]

    document.getElementById("year-chooser").innerHTML = weekday_dates["Montag"].getFullYear()
}

function week_before() {
    selected_date.setDate(selected_date.getDate() - 7)
    define_current_weekdays(selected_date)
}

function week_afterward() {
    selected_date.setDate(selected_date.getDate() + 7)
    define_current_weekdays(selected_date)
}

window.electronAPI.handle_menu_sidebar((event) => {
    toogle_sidebar()
})

draw_week_axis()
define_current_weekdays(selected_date)

window.addEventListener("load", (e) => {
    update_sidebar()

    document.getElementById("navbar-week").style.backgroundColor = "yellow"

    document.getElementById("btn_entry").addEventListener("click", () => {
        define_current_weekdays(selected_date)
    })
})


