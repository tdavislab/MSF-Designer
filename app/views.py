from flask import render_template,request, url_for, jsonify, redirect, Response, send_from_directory
from app import app
from app import APP_STATIC
from app import APP_ROOT
from os import path
from os.path import splitext

@app.route('/')
@app.route('/simple')
def index():
    return render_template('simple.html')


@app.route('/export', methods=['POST','GET'])
def demo1():
    print("i am here")