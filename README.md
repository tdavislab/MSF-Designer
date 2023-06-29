
# MSF Designer

This is the source code for **MSF Designer: Design and Visualization of Morse-Smale Vector Fields**.

## Installation

1. Install Flask
```bash
pip3 install flask
pip3 install flask-assets
```

Depending on your permissions, you might have to do `sudo pip3 install`.

2. Download the repository

```bash
git clone https://github.com/tdavislab/MSF-Designer.git
```

3. Install Perseus

Perseus is used for computing persistence barcode.

If your system is Mac OS Tiger and up, or Linux, this software will be installed automatically with the downloading of this repository.

Otherwise, please go to http://people.maths.ox.ac.uk/nanda/perseus/index.html, and download a proper version, then move Perseus to `VIS-MSVF/app/static/assets/`.

## Running

```bash
cd VIS-MSF
python3 run.py
#Hit Ctrl+c to quit
```

You can view the page at http://0.0.0.0:8080/ (If possible, please use Chrome).

## Demo

A demo video: https://youtu.be/gA5UMdU4Cos.
