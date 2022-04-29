# import the function that will return an instance of a connection
from flask_app.config.mysqlconnection import connectToMySQL
from flask_app.models import recipe
from flask import flash
# model the class after the table from our database
class Spirit:
    def __init__( self , data ):
        self.id = data['id']
        self.name = data['name']
        self.created_at = data['created_at']
        self.updated_at = data['updated_at']
        self.recipe_quantity = data['recipe_quantity'];
        self.recipes = []
    # Now we use class methods to query our database
    @classmethod
    def get_all(cls):
        query = 'SELECT * FROM spirits;'
        # make sure to call the connectToMySQL function with the schema you are targeting.
        results = connectToMySQL('drinkmixr_schema').query_db(query)
        # Create an empty list to append our instances of table
        spirits = []
        # Iterate over the db results and create instances of table with cls.
        for row in results:
            row.append( cls(row) )
        return spirits

    @classmethod
    def save_spirit_to_recipe(cls,data):
        query = 'INSERT INTO spirits_in_recipes (quantity,spirit_id,recipe_id,created_at,updated_at) VALUES (%(quantity)s,%(spirit_id)s,%(recipe_id)s,NOW(),NOW());'
        return connectToMySQL('drinkmixr_schema').query_db(query,data)

    @classmethod
    def delete_spirit_from_recipe(cls,data):
        query = 'DELETE FROM spirits_in_recipes WHERE recipe_id = %(recipe_id)s;'
        return connectToMySQL('drinkmixr_schema').query_db(query,data)
