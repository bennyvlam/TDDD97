import sqlite3
from flask import g

DATABASE = 'database.db'


def get_db():
    db = getattr(g, '_database', None)
    if db is None:
        db = g._database = sqlite3.connect(DATABASE)
    return db


def init_db(app):
    db = get_db()
    with app.open_resource('schema.sql', mode='r') as f:
        db.cursor().executescript(f.read())
    db.commit()


def connect_db(app):
    """Connects to the specific database."""
    rv = sqlite3.connect(app.config['DATABASE'])
    rv.row_factory = sqlite3.Row
    return rv


def query_db(query, args=(), one=False):
    cur = get_db().execute(query, args)
    rv = cur.fetchall()
    cur.close()
    return (rv[0] if rv else None) if one else rv



def add_user(email, password, firstname, familyname, gender, city, country):
    query_db('INSERT INTO users VALUES (?,?,?,?,?,?,?)',
             [email, password, firstname, familyname, gender, city, country])
    get_db().commit()


    #Checks so that user is not taken
def user_exist(email):
    user = query_db('SELECT email FROM users WHERE email = ?', [email], one=True)
    if user is None:
        return False
    else:
        return True

    #Checks login
def is_valid_user(email, password):
    user = query_db('SELECT email, password FROM users WHERE email = ? AND password = ?',
                    [email, password], one=True)
    if user is None:
        return False
    else:
        return True

def change_password(email, password):
    query_db('UPDATE users SET password = ? WHERE email = ?', [password, email], one=True)
    get_db().commit()

def get_user_data(email):
    user = query_db('SELECT email, firstname, familyname, gender, city, country FROM users WHERE email=?', [email])
    return user

def add_message(message, fromUser, toUser):
    query_db('INSERT INTO messages(message, fromUser, toUser) VALUES (?,?,?)', [message, fromUser, toUser])
    get_db().commit()


def get_messages(email):
    messages = query_db('SELECT message, fromUser FROM messages where toUser = ?', [email])
    get_db().commit()
    return messages