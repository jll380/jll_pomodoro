import os
from flask import Flask, send_from_directory, render_template

app = Flask(__name__)

@app.route('/')
def home():
    root_index = os.path.join(app.root_path, 'index.html')
    if os.path.exists(root_index):
        return send_from_directory(app.root_path, 'index.thml')
    return render_template('index.html')

if __name__ == '__main__':
    app.run(debug=True)