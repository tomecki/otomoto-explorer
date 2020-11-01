#!/usr/bin/env python3
import subprocess


CARS = {
    "mercedes-benz": ["cla-klasa", "a-klasa", "c-klasa"],
    "seat": ["ateca", "leon"],
    "volkswagen": ["golf", "passat", "tiguan"],
    "skoda": ["octavia", "karoq", "kamiq", "scala"],
    "bmw": ["seria-3", "3gt", "5gt", "x1", "x3"],
    "ford": ["kuga", "focus"],
    "honda": ["civic", "cr-v", "hr-v"],
}

CARS_2 = {
    "volvo": ["s60", "v60", "v70", "xc-60", "xc-70"],
    "lexus": ["is", "rx", "ct"],
    "toyota": ["rav4", ],
    "subaru": ["outback", "forester", "xv"],
}

CARS_3 = {
    "hyundai": ["i30", "kona", "tucson"],
    "kia": ["niro", "sportage", "ceed"],
    "mazda": ["cx-3", "cx-5", "3", "6"],
    "suzuki": ["sx4", "sx4-s-cross", "vitara"],
    "jeep": ["renegade"],
    "toyota": ["corolla", "ch-r", "camry"],
    "peugeot": ["308", "3008", ]

}

def main():

    for make, models in {**CARS, **CARS_2, **CARS_3}.items():
    # for make, models in CARS_3.items():
        for model in models:
            try:
                subprocess.run(f"node main.js harvester {make} {model}", shell=True, check=True)
            except:
                print(f"{make} {model} ended with an error, inspect!")

if __name__ == "__main__":
    main()