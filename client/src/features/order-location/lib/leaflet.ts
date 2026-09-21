import { divIcon } from "leaflet"
import "leaflet/dist/leaflet.css"

export const CAIRO_CENTER = { lat: 30.08015, lng: 31.37577 }
export const CAIRO_ZOOM = 11
export const FOCUS_ZOOM = 15

const MAP_PIN_PATH =
    "M11.54 22.351l.07.04.028.016a.759.759 0 00.723 0l.028-.015.071-.041a13.37 13.37 0 00.512-.32c.354-.231.85-.568 1.091-.83.368-.41.862-1.02 1.131-1.68.43-.99.624-2.009.624-3.21v-1.242c0-2.247-1.549-4.089-3.206-4.589-.06-.018-.015-.048-.035-.048-.22 0-.598.03-.854.047-.256.017-.633.047-.852.048h-.022c-.219-.001-.596-.031-.852-.048-.256-.017-.635-.047-.854-.047l-.039.048c-1.657.5-3.206 2.342-3.206 4.589v1.242c0 1.201.194 2.22.624 3.21.269.66.763 1.27 1.131 1.68.241.262.737.599 1.09.83.158.105.33.219.513.32l.072.041zM10.5 4.5a.75.75 0 01.75-.75h1.5a.75.75 0 010 1.5h-1.5a.75.75 0 01-.75-.75z"

export const BRANCH_ICON = divIcon({
    html: `<svg viewBox="0 0 24 24" fill="currentColor" class="leaflet-branch-pin">${MAP_PIN_PATH}</svg>`,
    className: "",
    iconSize: [30, 30],
    iconAnchor: [15, 28],
})

export const BRANCH_ICON_ACTIVE = divIcon({
    html: `<svg viewBox="0 0 24 24" fill="currentColor" class="leaflet-branch-pin leaflet-branch-pin--active">${MAP_PIN_PATH}</svg>`,
    className: "leaflet-pin-active",
    iconSize: [44, 44],
    iconAnchor: [22, 42],
})

export const USER_ICON = divIcon({
    html: `<span class="leaflet-user-dot"></span>`,
    className: "",
    iconSize: [20, 20],
    iconAnchor: [10, 10],
})