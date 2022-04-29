# import the function that will return an instance of a connection
from flask_app.config.mysqlconnection import connectToMySQL
from flask import flash
# model the class after the table from our database
class Comment:
    def __init__( self , data ):
        self.id = data['id']
        self.content = data['content']
        self.created_at = data['created_at']
        self.updated_at = data['updated_at']
        self.users_id = data['users_id']
        self.recipes_id = data['recipes_id']

    @classmethod
    def get_creator_id(cls, data):
        query = "SELECT users_id FROM comments WHERE comments.id = %(id)s;"
        results = connectToMySQL('drinkmixr_schema').query_db(query, data)
        return results[0]['users_id']

    @classmethod
    def save(cls, data):
        query = 'INSERT INTO comments (content, created_at, updated_at, users_id, recipes_id) VALUES (%(content)s,NOW(),NOW(),%(users_id)s,%(recipes_id)s);'
        return connectToMySQL('drinkmixr_schema').query_db(query, data)

    @classmethod
    def delete(cls, data):
        query = 'DELETE FROM comments WHERE id = %(id)s;'
        return connectToMySQL('drinkmixr_schema').query_db(query, data)

    @staticmethod
    def validate_user_id(data):
        is_valid = True

        user_id = Comment.get_creator_id({"id":data['comment_id']})
        if data['user_id'] != user_id:
            is_valid = False
        
        return is_valid
