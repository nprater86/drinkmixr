# import the function that will return an instance of a connection
from flask_app.config.mysqlconnection import connectToMySQL
from flask_app.models import user, ingredient, spirit
from flask import flash
# model the class after the table from our database
class Recipe:
    def __init__( self , data ):
        self.id = data['id']
        self.name = data['name']
        self.description = data['description']
        self.directions = data['directions']
        self.image_name = data['image_name']
        self.image_url = data['image_url']
        self.created_at = data['created_at']
        self.updated_at = data['updated_at']
        self.user_id = data['user_id']
        self.user_name = ''
        self.spirits = []
        self.ingredients = []
        self.comments = []
        self.favorited_users = []
    
    @classmethod
    def get_all(cls):
        query = 'SELECT * FROM recipes;'
        results = connectToMySQL('drinkmixr_schema').query_db(query)
        recipes = []
        for recipe_row in results:
            recipes.append( cls(recipe_row) )
        return recipes

    @classmethod
    def get_all_with_spirit_by_user_id_json(cls,data):
        query = 'SELECT * FROM recipes JOIN spirits_in_recipes ON spirits_in_recipes.recipe_id = recipes.id JOIN spirits ON spirits.id = spirits_in_recipes.spirit_id WHERE recipes.user_id = %(user_id)s ORDER BY recipes.name;'
        results = connectToMySQL('drinkmixr_schema').query_db(query,data)
        recipes = []
        for recipe_row in results:
            recipes.append( recipe_row )
        return recipes

    @classmethod
    def get_all_others_with_spirit_and_favorites_by_user_id_json(cls,data):
        #get the recipes
        recipes_query = 'SELECT * FROM recipes JOIN spirits_in_recipes ON spirits_in_recipes.recipe_id = recipes.id JOIN spirits ON spirits.id = spirits_in_recipes.spirit_id WHERE recipes.user_id != %(id)s;'
        recipes_results = connectToMySQL('drinkmixr_schema').query_db(recipes_query,data)
        #get the username that created the recipe
        username_query = 'SELECT id, user_name FROM users WHERE id != %(id)s'
        username_results = connectToMySQL('drinkmixr_schema').query_db(username_query,data)
        recipes = []
        for recipe_row in recipes_results:
            for username in username_results:
                if recipe_row['user_id'] == username['id']:
                    recipe_row['user_name'] = username['user_name']

            favorited_query = f"SELECT * FROM recipes LEFT JOIN favorites ON favorites.recipes_id = recipes.id LEFT JOIN users ON users.id = favorites.users_id WHERE recipes.id = {recipe_row['id']};"
            favorited_results = connectToMySQL('drinkmixr_schema').query_db(favorited_query)
            if len(favorited_results) > 0:
                recipe_row['favorited_users'] = []
                for favorited_user in favorited_results:
                    user_data = {
                        "id":favorited_user['users.id'],
                        "user_name":favorited_user['user_name']
                    }
                    recipe_row['favorited_users'].append(user_data)

            recipes.append( recipe_row )
        #get all of the favorited users

        return recipes

    @classmethod
    def get_recipe_with_spirit_by_recipe_id_json(cls,data):
        query = 'SELECT * FROM recipes JOIN spirits_in_recipes ON spirits_in_recipes.recipe_id = recipes.id JOIN spirits ON spirits.id = spirits_in_recipes.spirit_id WHERE recipes.id = %(id)s;'
        results = connectToMySQL('drinkmixr_schema').query_db(query,data)
        return results[0]

    @classmethod
    def get_recipe_by_id(cls, data):
        query = 'SELECT * FROM recipes JOIN ingredients ON ingredients.recipe_id = recipes.id WHERE recipes.id = %(id)s;'
        results = connectToMySQL('drinkmixr_schema').query_db(query, data)
        recipe = cls(results[0])
        for row in results:
            ingredient_data = {
                'id':row['ingredients.id'],
                'ingredient_name':row['ingredient_name'],
                'quantity':row['quantity'],
                'measurement':row['measurement'],
                'created_at':row['ingredients.created_at'],
                'updated_at':row['ingredients.updated_at'],
                'recipe_id':row['recipe_id']
            }
            recipe.ingredients.append( ingredient.Ingredient(ingredient_data) )
        query = 'SELECT * FROM recipes JOIN spirits_in_recipes ON spirits_in_recipes.recipe_id = recipes.id JOIN spirits ON spirits.id = spirits_in_recipes.spirit_id WHERE recipes.id = %(id)s;'
        results = connectToMySQL('drinkmixr_schema').query_db(query, data)
        spirit_data = {
            "id":results[0]['spirits.id'],
            "name":results[0]['spirits.name'],
            "created_at":results[0]['spirits.created_at'],
            "updated_at":results[0]['spirits.updated_at'],
            "recipe_quantity":results[0]['quantity']
        }
        recipe.spirits.append( spirit.Spirit(spirit_data) )

        #get creator username
        username_query = 'SELECT user_name FROM recipes JOIN users ON users.id = recipes.user_id WHERE recipes.id = %(id)s;'
        username_results = connectToMySQL('drinkmixr_schema').query_db(username_query, data)

        recipe.user_name = username_results[0]['user_name']

        return recipe

    @classmethod
    def get_recipe_by_id_json(cls, data):
        #get spirits and add to recipe
        spirit_query = 'SELECT * FROM recipes JOIN spirits_in_recipes ON spirits_in_recipes.recipe_id = recipes.id JOIN spirits ON spirits.id = spirits_in_recipes.spirit_id WHERE recipes.id=%(id)s;'
        spirit_results = connectToMySQL('drinkmixr_schema').query_db(spirit_query, data)
        recipe = spirit_results[0]

        #get ingredients and add to recipe
        ingredients_query = 'SELECT * FROM recipes JOIN ingredients ON ingredients.recipe_id = recipes.id WHERE recipes.id = %(id)s;'
        ingredients_results = connectToMySQL('drinkmixr_schema').query_db(ingredients_query, data)
        recipe['ingredients'] = []
        for row in ingredients_results:
            recipe['ingredients'].append(row)

        #get favorited users and add to recipe
        favorited_query = 'SELECT * FROM recipes LEFT JOIN favorites ON favorites.recipes_id = recipes.id LEFT JOIN users ON users.id = favorites.users_id WHERE recipes.id = %(id)s;'
        favorited_results = connectToMySQL('drinkmixr_schema').query_db(favorited_query, data)
        recipe['favorited_users'] = []
        if favorited_results[0]['favorites.id'] != None:
            for row in favorited_results:
                user_data = {
                    "id":row['users.id'],
                    "user_name":row['user_name']
                }

                recipe['favorited_users'].append(user_data)

        #get comments for recipe
        comments_query = 'SELECT * FROM recipes LEFT JOIN comments ON comments.recipes_id = recipes.id LEFT JOIN users ON users.id = comments.users_id WHERE recipes.id=%(id)s ORDER BY comments.created_at DESC;'
        comments_results = connectToMySQL('drinkmixr_schema').query_db(comments_query, data)
        recipe['comments'] = []
        if comments_results[0]['comments.id'] != None:
            for row in comments_results:
                comment_data = {
                    "id":row['comments.id'],
                    "content":row['content'],
                    "created_at":row['comments.created_at'],
                    "user_id":row['users_id'],
                    "user_name":row['user_name']
                }

                recipe['comments'].append(comment_data)

        return recipe

    @classmethod
    def save(cls, data):
        query = 'INSERT INTO recipes (name, description, directions, image_name, image_url, created_at, updated_at, user_id) VALUES (%(name)s,%(description)s,%(directions)s,%(image_name)s,%(image_url)s,NOW(),NOW(),%(user_id)s);'
        return connectToMySQL('drinkmixr_schema').query_db(query, data)

    @classmethod
    def update(cls, data):
        query = 'UPDATE recipes SET name = %(name)s, description=%(description)s, directions=%(directions)s, image_name=%(image_name)s, image_url=%(image_url)s,updated_at=NOW() WHERE id = %(id)s;'
        return connectToMySQL('drinkmixr_schema').query_db(query, data)

    @classmethod
    def delete(cls, data):
        query = 'DELETE FROM recipes WHERE id = %(id)s;'
        return connectToMySQL('drinkmixr_schema').query_db(query, data)

    @staticmethod
    def validate_recipe(data):
        is_valid = True

        #name, description, instructions >= 3 characters:
        if len(data["name"]) < 3 or len(data["description"]) < 3 or len(data["directions"]) < 3:
            flash("Name, description, and instructions must be longer than 3 characters.", "recipe_error")
            is_valid = False
        
        return is_valid