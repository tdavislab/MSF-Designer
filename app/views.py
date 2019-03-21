from flask import render_template,request, url_for, jsonify, redirect, Response, send_from_directory
from app import app
from app import APP_STATIC
from app import APP_ROOT
from os import path
from os.path import splitext
import json
# import pandas
import numpy as np
import pandas as pd


@app.route('/')
@app.route('/vis_msvf')
def index():
    return render_template('vis_msvf.html')


@app.route('/export', methods=['POST','GET'])
def exportFile():
    jsdata = request.form.get('javascript_data')
    jsdata1 = json.loads(jsdata)
    if jsdata1["filename"] == "":
        filename = path.join(APP_STATIC,"assets/export.json")
    else: filename = path.join(APP_STATIC,"assets/",jsdata1["filename"]+".json")
    with open(filename,"w") as outfile:
        json.dump(jsdata1,outfile)
    outfile.close()
    return jsdata

@app.route('/import', methods=['POST','GET'])
def importFile():
    jsdata = request.files['files']
    filename = path.join(APP_STATIC,"assets/",jsdata.filename)
    with open(filename) as f:
        data = json.load(f)
    f.close()
    return jsonify(data)

@app.route('/grad', methods=['POST','GET'])
def exportGrad():
    jsdata = request.form.get('grad_data')
    jsdata1 = json.loads(jsdata)
    jsdata1 = pd.DataFrame(jsdata1)
    filename = path.join(APP_STATIC,"assets/grad.csv")
    jsdata1.to_csv(filename)
    # print(jsdata1)
    return jsdata
