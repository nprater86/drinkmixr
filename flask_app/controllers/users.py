from flask_app import app
from flask import render_template,redirect,request,session,flash,jsonify
from flask_app.models.user import User
from flask_app.models.recipe import Recipe
from flask_bcrypt import Bcrypt
bcrypt = Bcrypt(app)

#===============================
# Landing Page
#===============================

@app.route('/')
def index():
    if "id" in session:
        return redirect('/dashboard')
    return render_template('index.html')

#===============================
# Login / Register Route
#===============================

@app.route('/reg_login', methods=["POST"])
def reg_login():
    #if user is registering
    if (request.form["which_form"] == "register"):
        #validate data
        errors = User.validate_registration(request.form)
        if not errors[0]:
            return jsonify(errors[1])

        #hash password:
        pw_hash = bcrypt.generate_password_hash(request.form["password"])

        #gather data for User.save
        data = {
            "first_name": request.form["first_name"],
            "last_name": request.form["last_name"],
            "birthday": request.form["birthday"],
            "user_name": request.form["user_name"],
            "email": request.form["email"],
            "password": pw_hash
        }

        #send data to User.save:
        id = User.save(data)
        session["id"] = id
        session["first_name"] = request.form["first_name"]
        session["last_name"] = request.form["last_name"]
        session["user_name"] = request.form["user_name"]

        return jsonify(url='/dashboard')

    #if user is logging in
    if (request.form["which_form"] == "login"):

        data = {
            "email":request.form['email']
        }

        if not User.get_user_by_email(data):
            return jsonify(error="Invalid email/password.")
        
        user = User.get_user_by_email(data)

        if not bcrypt.check_password_hash(user.password, request.form['password']):
            return jsonify(error="Invalid email/password.")

        session["id"] = user.id
        session["user_name"] = user.user_name;
        session["first_name"] = user.first_name
        session["last_name"] = user.last_name

        return jsonify(url='/dashboard')


    return redirect('/')

#===============================
# Dashboard Route
#===============================

@app.route('/dashboard')
def dashboard():
    if "id" not in session:
        return redirect('/')

    data = {"id":session["id"]}
    user = User.get_user_by_id(data)

    return render_template('dashboard.html', user = user)

@app.route('/recipes_by_user')
def recipes():
    data = {"user_id":session['id']}
    return jsonify(Recipe.get_all_with_spirit_by_user_id_json(data))

@app.route('/get_faved_recipes')
def faved_recipes():
    data = {"user_id":session['id']}
    return jsonify(Recipe.get_all_with_spirit_by_user_id_json(data))

@app.route('/user')
def user():
    return jsonify(id = session['id'])

#===============================
# Browse Route
#===============================

@app.route('/browse')
def browse():
    if "id" not in session:
        return redirect('/')

    data = {"id":session["id"]}
    user = User.get_user_by_id(data)

    return render_template('browse.html', user = user)

#===============================
# Add/Remove Recipe to Favorites Route
#===============================

@app.route('/addFavorite/<int:recipe_id>', methods=["POST"])
def add_favorite(recipe_id):
    if "id" not in session:
        return redirect('/')

    data = {"recipe_id":recipe_id, "user_id":session['id']}

    #check if user already favorited
    user = User.get_user_by_id_jsonify({'id':session['id']})
    if 'favorited_recipes' in user:
        for favored in user['favorited_recipes']:
            if favored['id'] == recipe_id:
                return redirect('/browse')

    User.add_favorite_recipe(data)

    return ('', 204)

@app.route('/unFavorite/<int:recipe_id>', methods=["POST"])
def unfavorite(recipe_id):
    if "id" not in session:
        return redirect('/')

    data = {"recipe_id":recipe_id, "user_id":session['id']}

    User.remove_favorite_recipe(data)

    return ('', 204)

#===============================
# User Info Route
#===============================

@app.route('/get_user_info', methods=["POST"])
def get_user_info():
    data = {"id":session['id']}
    return jsonify(User.get_user_by_id_jsonify(data))

#===============================
# Logout Route
#===============================

@app.route('/logout')
def logout():
    session.clear()
    return redirect('/')
