from flask import Flask
from flask_assets import Bundle, Environment
from .. import app

bundles = {
    'js': Bundle(
        # 'js/lib/jquery.3.2.1.min.js',
        # 'js/lib/popper.min.js',
        # 'js/lib/bootstrap.min.js',
        # 'js/lib/d3.min.js',
        # 'js/lib/three.min.js',
        # 'js/lib/STLLoader.js',
        # 'js/lib/TrackballControls.js',
        'js/animation.js',
        'js/moves.js',
        'js/sliders.js',
        'js/script.js',
        output='gen/script.js'
        # filters='jsmin'
        ),

        'css': Bundle(
        # 'css/lib/bootstrap.min.css',
        'css/style.css',
        output='gen/style.css'
        # filters='cssmin'
        )

}

assets = Environment(app)

assets.register(bundles)
