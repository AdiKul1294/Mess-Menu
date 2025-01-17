const print = console.log
const gid = (id) => document.getElementById(id)
const log = (text, color)=>print(`%c${text}`, `color: black; background-color: ${color}`)
let DEFERRED_INSTALL_PROMPT = null

let selected_day = 0

let menu = null

async function setup() {
    fetch("./menu.json").then(d => d.json()).then(data => {
        menu = data
        convertMenu()
        initialize_menu()
    })

    // PWA Analytics
    if(navigator.standalone === true || window.matchMedia("(display-mode: standalone)").matches) {
        gtag("event", "pwa_use", {
            "event_category": "engagement",
            "value": 1
        })
    }

    // new Date().getDay() returns 1 for Monday, 0/7 for Sunday
    selected_day = (new Date().getDay() + 6) % 7
    
    // Set the current day and select it
    document.querySelector(".day-picker").children[selected_day].classList.add("day-choice--today", "day-choice--selected")

    // Jump to the current time in the day
    const current_hours = new Date().getHours()
    let scrollAmt = - (20 + document.querySelector(".day-picker").offsetHeight)
    if(current_hours < 10) {
        // Already at #B
    }
    else if(current_hours < 14) {
        // Jump to #L
        scrollAmt += document.querySelector("#L").offsetTop
    }
    else if(current_hours < 18) {
        // Jump to #S
        scrollAmt += document.querySelector("#S").offsetTop
    }
    else if(current_hours < 22) {
        // Jump to #D
        scrollAmt += document.querySelector("#D").offsetTop
    }
    document.querySelector("#actual-menu").scrollTo(0, scrollAmt)

    // Setup the day choice buttons
    document.querySelectorAll(".day-choice").forEach((day_choice, index) => {
        day_choice.onclick = event => {
            if("vibrate" in navigator) navigator.vibrate(50)

            document.querySelector(".day-choice--selected").classList.remove("day-choice--selected")
            day_choice.classList.add("day-choice--selected")
            selected_day = index
            initialize_menu()
        }
    })

    if(!!navigator.share) {
        [...document.querySelectorAll(".share_toolbar")].forEach(toolbar => {
            toolbar.querySelector(".share--text").onclick = function(event) {
                initiateShareText(toolbar.getAttribute("data-meal-category-id"))
            }
        })
    }
    else {
        console.error("Device does not support sharing")
    }
}

/**
 * Initiates sharing of the SS of the given meal category
 * @param {string} mealCategoryID 
 */
function initiateShareText(mealCategoryID) {
    let mealCategoryName = {
        "B": "Breakfast",
        "L": "Lunch",
        "S": "Snacks",
        "D": "Dinner"
    }[mealCategoryID.toUpperCase()]

    navigator.share({
        text: generateReadableMenu(mealCategoryID),
        title: `${mealCategoryName} ${new Date().toDateString()}`,
    })
}

function generateReadableMenu(mealCategoryID) {
    let mealCategoryName = {
        "B": "Breakfast",
        "L": "Lunch",
        "S": "Snacks",
        "D": "Dinner"
    }[mealCategoryID]

    let items = []

    let mealCategoryElement = document.querySelector("#" + mealCategoryID)
    mealCategoryElement.querySelectorAll(".menu__item").forEach(item => {
        items.push(item.innerText)
    })

    return `*🍴 ${mealCategoryName.toUpperCase()} 🍴*\n\n` + items.join("\n")
}

function initialize_menu() {
    let items = Object.entries(menu)[selected_day][1]
    for (let [category, list] of Object.entries(items)) {
        document.getElementById(category).querySelector(".menu__items").innerHTML = [...list[0].map(variable_item_html), ...list[1].map(everyday_item_html)].join("")
    }
}

function variable_item_html(item_name) {
    return `<div class="menu__item menu__item--variable">${item_name}</div>`
}

function everyday_item_html(item_name) {
    return `<div class="menu__item menu__item--everyday">${item_name}</div>`
}

var everyday = {
    "B": "Tea + Coffee, Boiled Egg / Omelette, Bread + Butter + Jam, Bournvita, Hot + Cold Milk, Cornflakes",
    "L": "",
    "S": "Tea + Coffee",
    "D": ""
}

function convertMenu() {
    for (let [day, list] of Object.entries(menu)) {
        for (let [category, items] of Object.entries(menu[day])) {
            let variable_items = items.split(", ")
            let everyday_items = []
            if (everyday[category] != '')
                everyday_items = everyday[category].split(", ")

            menu[day][category] = [variable_items, everyday_items]
        }
    }
}

// Run setup
setup()
