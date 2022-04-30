from flask_app import app
from flask import render_template,redirect,request,session,flash,jsonify,url_for
from flask_app.models.recipe import Recipe
from flask_app.models.comment import Comment
from flask_app.models.ingredient import Ingredient
from flask_app.models.spirit import Spirit
from werkzeug.utils import secure_filename
import os
from os.path import join, dirname, realpath

UPLOAD_FOLDER = "./flask_app/static/user_images"
ALLOWED_EXTENSIONS = {'png', 'jpg', 'jpeg', 'gif'}
app.config['UPLOAD_FOLDER'] = UPLOAD_FOLDER

def allowed_file(filename):
    return '.' in filename and \
        filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS

#===============================
# Create Recipe Routes
#===============================

@app.route('/recipes/new/create', methods=["POST"])
def create_recipe():

    #First create the recipe
    recipe_data = {
        "name":request.form ["name"],
        "description":request.form["description"],
        "directions":request.form["directions"],
        "image_name":None,
        "image_url":None,
        "user_id":session["id"]
    }

    # if not Recipe.validate_recipe(data):
    #     return jsonify(message='invalid data!')

    recipe_id = Recipe.save(recipe_data)

    # check if the post request has the file part
    if 'file' in request.files:
        file = request.files['file']

        # if user does not select file, browser also submit an empty part without filename
        if file.filename == '':
                return jsonify(message='No selected filename')

        if file and allowed_file(file.filename):
            filename = str(recipe_id) + secure_filename(file.filename)
            file_url = f'../static/user_images/{filename}'
            file.save(os.path.join(app.config['UPLOAD_FOLDER'], filename))

        recipe_data['image_name'] = filename
        recipe_data['image_url'] = file_url
        recipe_data['id'] = recipe_id

        Recipe.update(recipe_data)

    #Now create ingredients and associate with recipe_id
    for i in range(1, int(request.form['num_of_ingredients'])+1):
        ingredient_data = {
            "ingredient_name":request.form[f"ingredient_name{i}"],
            "quantity":request.form[f"quantity{i}"],
            "measurement":request.form[f"measurement{i}"],
            "recipe_id":recipe_id
        }

        Ingredient.save(ingredient_data)

    #now save the spirit to the spirits_in_recipes table
    spirit_data = {
        "quantity":request.form['spirit_quantity'],
        "spirit_id":request.form['spirit_id'],
        "recipe_id":recipe_id
    }

    Spirit.save_spirit_to_recipe(spirit_data)

    return jsonify(Recipe.get_recipe_with_spirit_by_recipe_id_json({"id":recipe_id}))

#===============================
# Show Recipe Route
#===============================

@app.route('/recipes/<int:recipe_id>')
def show_recipe(recipe_id):
    if "id" not in session:
        return redirect('/')

    recipe_data = {"id":recipe_id}
    recipe = Recipe.get_recipe_by_id(recipe_data)
    return render_template('showRecipe.html', recipe=recipe)

@app.route('/recipes/get/<int:recipe_id>')
def get_recipe_json(recipe_id):
    if "id" not in session:
        return redirect('/')

    recipe = Recipe.get_recipe_by_id_json({"id":recipe_id})

    directions = recipe['directions']
    updated_directions = directions.replace('\r\n','<br/>')
    recipe['directions'] = updated_directions
    
    return jsonify( recipe )

#===============================
# Add / Delete Comments Routes
#===============================

@app.route('/add_comment', methods=["POST"])
def add_comment():
    #make comment data and send to query

    comment_data = {
        "content":request.form['content'],
        "users_id":session['id'],
        "recipes_id":request.form['recipe_id']
    }

    Comment.save(comment_data)

    return jsonify(message="success!")

@app.route('/delete_comment/<int:comment_id>')
def delete_comment(comment_id):

    data = {
        "user_id":session['id'],
        "comment_id":comment_id
    }

    if not Comment.validate_user_id(data):
        return redirect('/dashboard')

    Comment.delete({"id":comment_id})
    return ('', 204)

#===============================
# Update Recipe Routes
#===============================

@app.route('/recipes/edit/<recipe_id>', methods=["POST"])
def edit_recipe_form(recipe_id):
    if "id" not in session:
        return redirect('/')

    data = {"id":recipe_id}
    recipe = Recipe.get_recipe_by_id_json(data)

    if recipe['user_id'] != session["id"]:
        return redirect('/dashboard')

    return jsonify(recipe)

@app.route('/recipes/update', methods=["POST"])
def edit_recipe():

    #first gather data on the recipe being edited
    recipe = Recipe.get_recipe_by_id({"id":request.form['recipe_id']})

    #now save new image after checking validations
    if 'file' in request.files:
        file = request.files['file']

        #if drink has an image already, then delete it from folder
        if recipe.image_name != None:
            os.remove(os.path.join(app.config['UPLOAD_FOLDER'], recipe.image_name))

        # if user does not select file, browser also submit an empty part without filename
        if file.filename == '':
                return jsonify(message='No selected filename')

        if file and allowed_file(file.filename):
            filename = str( recipe.id ) + secure_filename(file.filename)
            file_url = f'../static/user_images/{filename}'
            file.save(os.path.join(app.config['UPLOAD_FOLDER'], filename))

    #if no new image was selected, then just keep old image info
    else:
        filename = recipe.image_name
        file_url = recipe.image_url


    #Now update the recipe
    recipe_data = {
        "name":request.form['name'],
        "description":request.form['description'],
        "directions":request.form['directions'],
        "image_name":filename,
        "image_url":file_url,
        "id":request.form['recipe_id']
    }

    Recipe.update(recipe_data)

    #now delete all current ingredients associated with drink
    delete_ingredient_data = {"recipe_id":request.form['recipe_id']}
    Ingredient.delete(delete_ingredient_data)

    #now add all submitted ingredients to recipe
    for i in range(1, int(request.form['num_of_ingredients'])+1):
        ingredient_data = {
            "ingredient_name":request.form[f"ingredient_name{i}"],
            "quantity":request.form[f"quantity{i}"],
            "measurement":request.form[f"measurement{i}"],
            "recipe_id":request.form['recipe_id']
        }

        Ingredient.save(ingredient_data)

    #delete the spirit data
    delete_spirit_data = {"recipe_id":request.form['recipe_id']}
    Spirit.delete_spirit_from_recipe(delete_spirit_data)

    #lastly save the new spirit to the spirits_in_recipes table
    spirit_data = {
        "quantity":request.form['spirit_quantity'],
        "spirit_id":request.form['spirit_id'],
        "recipe_id":request.form['recipe_id']
    }

    Spirit.save_spirit_to_recipe(spirit_data)

    # if not Recipe.validate_recipe(data):
    #     return jsonify(message="not valid!")

    return Recipe.get_recipe_with_spirit_by_recipe_id_json({"id":request.form["recipe_id"]})

#===============================
# Get All Recipes Route
#===============================

@app.route('/all_recipes', methods=["POST"])
def get_all_others():
    if "id" not in session:
        return redirect('/')

    data = {"id":session["id"]}
    recipes = Recipe.get_all_others_with_spirit_and_favorites_by_user_id_json(data)
    
    return jsonify(recipes)

#===============================
# Get All Recipes By Spirit Route
#===============================

@app.route('/all_recipes_by_spirit/<int:spirit_id>', methods=["POST"])
def get_all_others_by_spirit(spirit_id):
    if "id" not in session:
        return redirect('/')

    data = {"id":session["id"]}
    recipes = Recipe.get_all_others_with_spirit_and_favorites_by_user_id_json(data)

    filtered_recipes = []
    for recipe in recipes:
        if recipe['spirit_id'] == spirit_id:
            filtered_recipes.append(recipe)
    
    return jsonify(filtered_recipes)

#===============================
# Delete Recipe Route
#===============================

@app.route ('/delete_recipe/<recipe_id>', methods=["POST"])
def delete_recipe(recipe_id):
    if "id" not in session:
        return redirect('/')
    
    data = {"id":recipe_id}
    recipe = Recipe.get_recipe_by_id(data)

    if recipe.user_id != session["id"]:
        return redirect('/dashboard')

    if recipe.image_name != None:
        os.remove(os.path.join(app.config['UPLOAD_FOLDER'], recipe.image_name))

    Recipe.delete(data)
    
    return jsonify(deleted_id=recipe.id)