from flask import Flask, render_template, request, redirect, url_for, session, send_from_directory, flash
import os

app = Flask(__name__)
app.secret_key = os.environ.get('FLASK_SECRET', 'dev-secret-change-me')

# Identifiants de démonstration (préférer variables d'environnement en production)
CORRECT_USERNAME = os.environ.get('DEMO_USER', 'admin')
CORRECT_PASSWORD = os.environ.get('DEMO_PASS', 'Secret123')


@app.route('/')
def index():
    return redirect(url_for('login'))


@app.route('/login', methods=['GET', 'POST'])
def login():
    if request.method == 'POST':
        username = request.form.get('username', '').strip()
        password = request.form.get('pwd', '')
        if username == CORRECT_USERNAME and password == CORRECT_PASSWORD:
            session['logged_in'] = True
            return redirect(url_for('protected', filename='experiment-1.html'))
        else:
            flash("Nom d'utilisateur ou mot de passe incorrect.")
    return render_template('login.html')


@app.route('/logout')
def logout():
    session.clear()
    return redirect(url_for('login'))


@app.route('/experiments/<path:filename>')
def protected(filename):
    if not session.get('logged_in'):
        return redirect(url_for('login'))
    experiments_dir = os.path.join(app.root_path, 'experiments')
    return send_from_directory(experiments_dir, filename)


if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000, debug=True)
