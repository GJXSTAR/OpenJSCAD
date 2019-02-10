# -*- coding: utf-8 -*-
import os

from flask import Blueprint, render_template

# 定义蓝图
scad_blueprint = Blueprint('scad', __name__, static_folder=os.path.abspath(os.path.dirname(__file__)) + '/' + 'static', template_folder=os.path.abspath(os.path.dirname(__file__)) + '/' + 'templates')


@scad_blueprint.route('/')
def index():
    return render_template('index.html')


@scad_blueprint.route('/options')
def options():
    return render_template('options.html')


@scad_blueprint.route('/minimal')
def minimal():
    return render_template('minimal.html')


@scad_blueprint.route('/converter')
def converter():
    return render_template('converter.html')


if __name__ == '__main__':
    print(os.path.abspath(os.path.dirname(__file__)) + '/' + 'templates')
