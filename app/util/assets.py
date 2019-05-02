from flask import Flask
from flask_assets import Bundle, Environment
from .. import app

bundles = {
    'js': Bundle(
        'js/animation.js',
        'js/moves.js',
        'js/sliders.js',
        'js/persistence.js',
        'js/records.js',
        'js/script.js',
        output='gen/script.js'
        ),

        'css': Bundle(
        'css/style.css',
        output='gen/style.css'
        )
}

assets = Environment(app)

assets.register(bundles)
