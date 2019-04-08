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
import os

def constructSp(df): # construct simplices
    df = np.array(df)
    sp = []
    fmax = np.max(df[:,2])
    for i in range(0,99):
        for j in range(0,99):
            # print(i,j)
            idx = 100*j+i
            pt1 = df[idx,:]
            pt2 = df[idx+1,:]
            pt3 = df[idx+100,:]
            pt4 = df[idx+101,:]
            line1 = str(int(round(pt1[0]*100)))+" "+str(int(round(pt1[1]*100)))+" "+str(int(round(pt2[0]*100)))+" "+str(int(round(pt2[1]*100)))+" "+str(int(round(pt3[0]*100)))+" "+str(int(round(pt3[1]*100)))+" "+str(int(round((fmax-pt1[2])*100)+1))+"\n"
            line2 = str(int(round(pt2[0]*100)))+" "+str(int(round(pt2[1]*100)))+" "+str(int(round(pt3[0]*100)))+" "+str(int(round(pt3[1]*100)))+" "+str(int(round(pt4[0]*100)))+" "+str(int(round(pt4[1]*100)))+" "+str(int(round((fmax-pt4[2])*100)+1))+"\n" 
            sp.append(line1)
            sp.append(line2)
    return sp


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
    print(jsdata)
    jsdata1 = json.loads(jsdata)
    jsdata1 = pd.DataFrame(jsdata1)
    filename = path.join(APP_STATIC,"assets/grad.csv")
    jsdata1.to_csv(filename)

    grad = pd.read_csv(filename)
    grad = grad.iloc[:,1:]
    grad = grad.iloc[:,[0,1,6]]

    sp = constructSp(grad)
    with open(path.join(APP_STATIC,"assets/grad.txt"),"w") as f:
        for line in sp:
            f.write(line)
        f.close()
    
    sp = pd.read_csv(path.join(APP_STATIC,"assets/grad.txt"),sep=" ",header=None)
    sp = sp.sort_values(by=[6]) # sort by birth time
    with open(path.join(APP_STATIC,"assets/grad.txt"),"w") as f:
        f.write("2\n")
        f.write("2\n")
        for i in range(0,len(sp)):
            line = list(sp.iloc[i,:])
            s = ""
            for e in line:
                s+= str(e)+" "
            s += "\n"
            f.write(s)
    f.close()

    os.system(APP_STATIC+"/assets/./perseusMac simtop "+APP_STATIC+"/assets/grad.txt "+APP_STATIC+"/assets/grad")
    dim0 = pd.read_csv(path.join(APP_STATIC,"assets/grad_0.txt"),sep=" ",header=None)
    bar = []
    # fmax = np.max(grad.iloc[:,2])
    for i in range(0,len(dim0)):
        # bar.append(list(dim0.iloc[i,:]))
        if len(list(dim0.iloc[i,:]))>=2:
            row = list(dim0.iloc[i,:])
            birth = (row[0]-1)/100
            death = (row[1]-1)/100
            if death - birth > 0.1 or death < 0:
                bar.append({"birth":birth,"death":death})
    return jsonify(data=bar)



