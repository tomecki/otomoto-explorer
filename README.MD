# Otomoto explorer
[![Binder](https://mybinder.org/badge_logo.svg)](https://mybinder.org/v2/gh/tomecki/otomoto-explorer/master?filepath=otomoto-analysis.ipynb)

This repo contains the code used for analysis of otomoto offers some time ago.

## Harverster
1. Install dependencies
```
poetry install
yarn install
```
2. Edit the make/model dictionary in harvest.py
```
CARS = {'make': ['list', 'of', 'desired', 'models'], 'make2': ['another', 'one']}
```
3. Run!
```
./harvest.py
```

## Jupyter notebook
1. Install dependencies (if you haven't done that already)
```
poetry install
```

2. Run jupyter lab
```
jupyter lab
```