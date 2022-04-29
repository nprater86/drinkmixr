from flask import Flask, flash, session
import logging

app = Flask(__name__)
app.secret_key = 'zebra6328potato'