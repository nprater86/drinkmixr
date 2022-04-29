# import the function that will return an instance of a connection
from flask_app.config.mysqlconnection import connectToMySQL
from flask import flash
from flask_app.models import recipe
from datetime import date
import re
EMAIL_REGEX = re.compile(r'^[a-zA-Z0-9.+_-]+@[a-zA-Z0-9._-]+[a-zA-Z]+$')
NAME_REGEX = re.compile('[@_!#$%^&*()<>?/}{~:1234567890]')

# model the class after the table from our database
class User:
    def __init__( self , data ):
        self.id = data['id']
        self.first_name = data['first_name']
        self.last_name = data['last_name']
        self.email = data['email']
        self.birthday = data['birthday']
        self.user_name = data['user_name']
        self.password = data['password']
        self.recipes = []
        self.favorited_recipes = []
        self.comments = []
    # Now we use class methods to query our database
    @classmethod
    def get_all(cls):
        query = 'SELECT * FROM users;'
        # make sure to call the connectToMySQL function with the schema you are targeting.
        results = connectToMySQL('drinkmixr_schema').query_db(query)
        # Create an empty list to append our instances of table
        users = []
        # Iterate over the db results and create instances of table with cls.
        for user_row in results:
            users.append( cls(user_row) )
        return users

    @classmethod
    def save(cls, data):
        query = 'INSERT INTO users (first_name, last_name, email, birthday, user_name, password, created_at, updated_at) VALUES (%(first_name)s,%(last_name)s,%(email)s,%(birthday)s,%(user_name)s,%(password)s,NOW(),NOW());'
        results = connectToMySQL('drinkmixr_schema').query_db(query, data)
        return results

    @classmethod
    def get_user_by_id(cls, data):
        query = 'SELECT * FROM users LEFT JOIN recipes ON user_id = users.id WHERE users.id = %(id)s;'
        results = connectToMySQL('drinkmixr_schema').query_db(query, data)
        
        user = cls( results[0] )

        if results[0]["recipes.id"] != None:
            for row in results:
                recipe_data = {
                    "id": row["recipes.id"],
                    "name": row["name"],
                    "description": row["description"],
                    "directions": row["directions"],
                    "image_name":row["image_name"],
                    "image_url": row["image_url"],
                    "created_at": row["recipes.created_at"],
                    "updated_at": row["recipes.updated_at"],
                    "user_id": row["user_id"]
                }

                user.recipes.append( recipe.Recipe(recipe_data) )

        return user

    @classmethod
    def get_user_by_id_jsonify(cls, data):
        query = 'SELECT * FROM users LEFT JOIN recipes ON user_id = users.id WHERE users.id = %(id)s;'
        results = connectToMySQL('drinkmixr_schema').query_db(query, data)
        
        user_data = {
            "id":results[0]['id'],
            "first_name":results[0]['first_name'],
            "last_name":results[0]['last_name'],
            "user_name":results[0]['user_name']
        }
        user = user_data

        if results[0]["recipes.id"] != None:
            user['recipes'] = []
            for row in results:
                recipe_data = {
                    "id": row["recipes.id"],
                    "name": row["name"],
                    "description": row["description"],
                    "directions": row["directions"],
                    "image_name":row["image_name"],
                    "image_url": row["image_url"],
                    "created_at": row["recipes.created_at"],
                    "updated_at": row["recipes.updated_at"],
                    "user_id": row["user_id"]
                }

                user['recipes'].append(recipe_data)
        
        favorites_query = 'SELECT * FROM users LEFT JOIN favorites ON favorites.users_id = users.id LEFT JOIN recipes ON recipes.id = favorites.recipes_id LEFT JOIN spirits_in_recipes ON spirits_in_recipes.recipe_id = recipes.id LEFT JOIN spirits ON spirits.id = spirits_in_recipes.spirit_id LEFT JOIN users AS creators ON creators.id = recipes.user_id WHERE users.id = %(id)s ORDER BY recipes.name;'
        results = connectToMySQL('drinkmixr_schema').query_db(favorites_query, data)

        if results[0]["favorites.id"] != None:
            user['favorited_recipes'] = []
            for row in results:
                recipe_data = {
                    "id": row["recipes.id"],
                    "name": row["name"],
                    "description": row["description"],
                    "directions": row["directions"],
                    "image_name":row["image_name"],
                    "image_url": row["image_url"],
                    "created_at": row["recipes.created_at"],
                    "updated_at": row["recipes.updated_at"],
                    "user_id": row["user_id"],
                    "user_name":row['creators.user_name'],
                    "spirit_name":row['spirits.name']
                }

                user['favorited_recipes'].append(recipe_data)

        return user

    @classmethod
    def get_user_by_email(cls, data):
        query = 'SELECT * FROM users LEFT JOIN recipes ON user_id = users.id WHERE email = %(email)s;'
        results = connectToMySQL('drinkmixr_schema').query_db(query, data)
        if len(results) < 1:
            return False
        
        user = cls( results[0] )
        
        return user

    @classmethod
    def get_all_emails_user_names(cls):
        query = 'SELECT email, user_name FROM users;'
        results = connectToMySQL('drinkmixr_schema').query_db(query)
        emails_user_names = {
            "emails":[],
            "user_names":[]
        }
        for row in results:
            emails_user_names['emails'].append(row['email'])
            emails_user_names['user_names'].append(row['user_name'])
        return emails_user_names

    @classmethod
    def add_favorite_recipe(cls,data):
        query = 'INSERT INTO favorites (recipes_id, users_id) VALUES (%(recipe_id)s,%(user_id)s);'
        results = connectToMySQL('drinkmixr_schema').query_db(query, data)
        return results

    @classmethod
    def remove_favorite_recipe(cls,data):
        query = 'DELETE FROM favorites WHERE users_id = %(user_id)s AND recipes_id = %(recipe_id)s'
        results = connectToMySQL('drinkmixr_schema').query_db(query, data)
        return results

    @staticmethod
    def validate_registration(user):
        is_valid = True
        registration_errors = {
            'first_name':'',
            'last_name':'',
            'email':'',
            'age':'',
            'user_name':'',
            'password':''
        }

        #validate age is filled out and user is over 21
        if user['birthday'] == '':
            registration_errors['age'] = "Please enter your birthdate."
            is_valid = False

        else:
            def calculateAge(birthDate):
                today = date.today()
                age = today.year - birthDate.year - ((today.month, today.day) < (birthDate.month, birthDate.day))
                return age
        
            year = int(user['birthday'][0:4])
            month = int(user['birthday'][5:7])
            day = int(user['birthday'][8:])
            
            if calculateAge(date(year, month, day)) < 21:
                registration_errors['age'] = "Must be 21 years or older to register."
                is_valid = False

        #first and last name min of 2 characters
        if len(user['first_name']) < 2 or len(user['last_name']) < 2:
            registration_errors['first_name'] = "First name must be greater than 2 characters."
            is_valid = False

        if NAME_REGEX.search(user['first_name']):
            registration_errors['first_name'] = "Invalid characters for first name."
            is_valid = False

        if NAME_REGEX.search(user['last_name']):
            registration_errors['last_name'] = "Invalid characters for last name."
            is_valid = False

        if len(user['last_name']) < 2:
            registration_errors['last_name'] = "Last name must be greater than 2 characters."
            is_valid = False

        if len(user['user_name']) < 2:
            registration_errors['user_name'] = "User name must be greater than 2 characters."
            is_valid = False

        #valid email
        if not EMAIL_REGEX.match(user['email']):
            registration_errors['email'] = "Invalid email address."
            is_valid = False

        emails_user_names = User.get_all_emails_user_names()

        if user['email'] in emails_user_names['emails']:
            registration_errors['email'] = "Email already registered."
            is_valid = False
        
        if user['user_name'] in emails_user_names['user_names']:
            registration_errors['user_name'] = 'User Name has been taken.'
            is_valid = False

        #invalid password
        if (user['password'] != user['password_check']):
            registration_errors['password'] = "Passwords do not match."
            is_valid = False

        elif len(user['password']) < 8:
            registration_errors['password'] = "Password must be at least 8 characters."
            is_valid = False

        return is_valid, registration_errors