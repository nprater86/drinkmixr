# import the function that will return an instance of a connection
from flask_app.config.mysqlconnection import connectToMySQL
from flask_app.models import user, recipe
from flask import flash
# model the class after the table from our database
class Ingredient:
    def __init__( self , data ):
        self.id = data['id']
        self.ingredient_name = data['ingredient_name']
        self.quantity = data['quantity']
        self.measurement = data['measurement']
        self.created_at = data['created_at']
        self.updated_at = data['updated_at']
        self.recipe_id = data['recipe_id']
    
    @classmethod
    def get_all(cls):
        query = 'SELECT * FROM ingredients;'
        results = connectToMySQL('drinkmixr_schema').query_db(query)
        recipes = []
        for recipe_row in results:
            recipes.append( cls(recipe_row) )
        return recipes

    @classmethod
    def get_all_json(cls):
        query = 'SELECT * FROM ingredients;'
        results = connectToMySQL('drinkmixr_schema').query_db(query)
        recipes = []
        for recipe_row in results:
            recipes.append( recipe_row )
        return recipes

    @classmethod
    def get_recipe_by_id(cls, data):
        query = 'SELECT * FROM ingredients WHERE id=%(id)s;'
        results = connectToMySQL('drinkmixr_schema').query_db(query, data)
        return cls(results[0])

    @classmethod
    def get_recipe_by_id_json(cls, data):
        query = 'SELECT * FROM ingredients WHERE id=%(id)s;'
        results = connectToMySQL('drinkmixr_schema').query_db(query, data)
        return results[0]

    @classmethod
    def save(cls, data):
        query = 'INSERT INTO ingredients (ingredient_name, quantity, measurement, created_at, updated_at, recipe_id) VALUES (%(ingredient_name)s,%(quantity)s,%(measurement)s,NOW(),NOW(),%(recipe_id)s);'
        return connectToMySQL('drinkmixr_schema').query_db(query, data)

    @classmethod
    def update(cls, data):
        query = 'UPDATE ingredients SET ingredient_name = %(ingredient_name)s, quantity=%(quantity)s, measurement=%(measurement)s, updated_at=NOW() WHERE id = %(id)s;'
        return connectToMySQL('drinkmixr_schema').query_db(query, data)

    @classmethod
    def delete(cls, data):
        query = 'DELETE FROM ingredients WHERE recipe_id = %(recipe_id)s;'
        return connectToMySQL('drinkmixr_schema').query_db(query, data)