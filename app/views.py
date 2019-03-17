from flask import render_template,request, url_for, jsonify, redirect, Response, send_from_directory
from app import app
from app import APP_STATIC
from app import APP_ROOT
from os import path
from os.path import splitext
import json


@app.route('/')
@app.route('/vis_msvf')
def index():
    return render_template('vis_msvf.html')


@app.route('/export', methods=['POST','GET'])
def exportFile():
    # print("i am here")
    jsdata = request.form.get('javascript_data')
    jsdata1 = json.loads(jsdata)
    if jsdata1["filename"] == "":
        filename = path.join(APP_STATIC,"assets/export.json")
    else: filename = jsdata1["filename"]+".json"
    with open(filename,"w") as outfile:
        json.dump(jsdata1,outfile)
    outfile.close()
    return jsdata
