# -*- coding: utf-8 -*-
from flask import Flask, render_template


app = Flask(__name__)
app.config['SECRET_KEY'] = 'ruo_you_shi_ci_cang_yu_xin'


DEBUG = True


@app.route('/')
def index():
    if DEBUG:
        print('index')
    return render_template('index.html')


@app.route('/options')
def options():
    if DEBUG:
        print('options')
    return render_template('options.html')


@app.route('/minimal')
def minimal():
    if DEBUG:
        print('minimal')
    return render_template('minimal.html')


@app.route('/converter')
def converter():
    if DEBUG:
        print('converter')
    return render_template('converter.html')


if __name__ == '__main__':
    app.run('127.0.0.1')
