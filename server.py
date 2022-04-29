from flask_app.controllers import recipes, users
from flask_app import app
import logging

if __name__ != '__main__':
    gunicorn_logger = logging.getLogger('gunicorn.error')
    app.logger.handlers = gunicorn_logger.handlers
    app.logger.setLevel(gunicorn_logger.level)

if __name__=='__main__':
    app.run(debug=True)