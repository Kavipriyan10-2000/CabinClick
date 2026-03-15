from enum import Enum


class RequestCode(str, Enum):
    water = "water"
    tea = "tea"
    coffee = "coffee"
    juice = "juice"
    soft_drink = "soft_drink"
    alcoholic_beverage = "alcoholic_beverage"
    snack = "snack"
    meal = "meal"
    baby_food = "baby_food"
    warm_milk = "warm_milk"
    blanket = "blanket"
    pillow = "pillow"
    headphones = "headphones"
    eye_mask = "eye_mask"
    earplugs = "earplugs"
    napkins = "napkins"
    tissues = "tissues"
    trash_collection = "trash_collection"
    spill_cleanup = "spill_cleanup"
    seat_issue = "seat_issue"
    tray_issue = "tray_issue"
    overhead_bin_issue = "overhead_bin_issue"
    usb_charger_help = "usb_charger_help"
    motion_sickness_bag = "motion_sickness_bag"
    feeling_unwell = "feeling_unwell"
    medication = "medication"
    emergency_assistance = "emergency_assistance"


REQUEST_LABELS: dict[RequestCode, str] = {
    RequestCode.water: "water",
    RequestCode.tea: "tea",
    RequestCode.coffee: "coffee",
    RequestCode.juice: "juice",
    RequestCode.soft_drink: "soft drink",
    RequestCode.alcoholic_beverage: "alcoholic beverage",
    RequestCode.snack: "snack",
    RequestCode.meal: "meal",
    RequestCode.baby_food: "baby food",
    RequestCode.warm_milk: "warm milk",
    RequestCode.blanket: "blanket",
    RequestCode.pillow: "pillow",
    RequestCode.headphones: "headphones",
    RequestCode.eye_mask: "eye mask",
    RequestCode.earplugs: "earplugs",
    RequestCode.napkins: "napkins",
    RequestCode.tissues: "tissues",
    RequestCode.trash_collection: "trash collection",
    RequestCode.spill_cleanup: "spill cleanup",
    RequestCode.seat_issue: "seat issue",
    RequestCode.tray_issue: "tray issue",
    RequestCode.overhead_bin_issue: "overhead bin issue",
    RequestCode.usb_charger_help: "USB charger help",
    RequestCode.motion_sickness_bag: "motion sickness bag",
    RequestCode.feeling_unwell: "feeling unwell",
    RequestCode.medication: "medication",
    RequestCode.emergency_assistance: "emergency assistance",
}


def normalize_request_code(value: RequestCode | str) -> RequestCode:
    if isinstance(value, RequestCode):
        return value

    normalized = " ".join(
        value.strip().lower().replace("_", " ").replace("-", " ").split()
    )
    for code, label in REQUEST_LABELS.items():
        if normalized in {
            code.value,
            code.value.replace("_", " "),
            label.lower(),
        }:
            return code
    raise ValueError(
        "Request item must be one of the predefined onboard request items."
    )


def request_label_for(code: RequestCode | str) -> str:
    return REQUEST_LABELS[normalize_request_code(code)]
