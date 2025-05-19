
from flask_login import LoginManager, UserMixin, login_user, login_required, logout_user, current_user
from flask import Flask, request, jsonify, session, redirect, url_for
from flask import Flask, request, jsonify, session
import requests
from flask import Flask, request, jsonify, render_template, redirect, url_for, session, send_from_directory
from flask_login import LoginManager, UserMixin, login_user, logout_user, login_required, current_user
from flask_socketio import SocketIO
import os
from werkzeug.utils import secure_filename
from datetime import datetime, timezone, timedelta
import stripe
import requests
# import libmoji
import jwt
import secrets
from email.mime.text import MIMEText
import smtplib
import random
import re
from flask_cors import CORS

app = Flask(__name__)
app.secret_key = "super_secret_key"  # Remplace par une clé sécurisée

# Stockage des spectateurs et des messages
messages = []
users = {}

# Configuration Strapi
STRAPI_URL = "http://localhost:1337/api"
HEADERS = {"Content-Type": "application/json", 'Authorization': 'Bearer 107871672080003a58950b2a671959121b69d23824f1c1f31c4fe1f44bbe6b34504a6c42a8570a340337409a29e0c87b8a59d30468117d9fa020e62b67c8b438be8135d68f8e778206016a3b8f6f9f13f8ea3441176abd2d0d99f4611a0986dc6ac1057a23dd0ef50e0e1ff1e942039195d9bd78257cd1afcdf2b44435d01a29'}


login_manager = LoginManager()
login_manager.init_app(app)
login_manager.login_view = "login"


class User(UserMixin):
    def __init__(self, user_data):
        self.id = user_data.get("id")
        self.username = user_data.get("username")
        self.email = user_data.get("email")


@login_manager.user_loader
def load_user():
    jwt_token = session.get("jwt")

    if not jwt_token:
        print("❌ Aucun token trouvé, utilisateur non connecté.")
        return None

    headers = {"Authorization": f"Bearer {jwt_token}"}
    response = requests.get(f"{STRAPI_URL}/users/me",
                            headers=headers) 
    if response.ok:
        try:
            user_data = response.json()
            return User(user_data)  # Création correcte de l'objet utilisateur
        except Exception as e:
            print(f"❌ Erreur de parsing JSON : {e}")
            return None
    else:
        print(
            f"❌ Erreur API Strapi : {response.status_code} - {response.text}")
        return None

@app.route('/')
def index1():
    return render_template('login.html')

@login_required
@app.route('/home')
def home():
    """ Page protégée accessible uniquement aux utilisateurs connectés """
    return render_template('index.html', user=current_user)

# 🔹 AUTHENTIFICATION
@app.route("/api/auth/local", methods=["POST"])
def login():
    """ Connexion utilisateur via Strapi """
    email = request.json.get("email")
    password = request.json.get("password")
    if not email or not password:
        return jsonify({"error": "Email et mot de passe requis"}), 400

    data = {"identifier": email, "password": password}
    response = requests.post(
        f"{STRAPI_URL}/auth/local", json=data, headers=HEADERS)
    
    if response.ok:
        user_data = response.json()["user"]
        jwt_token = response.json()["jwt"]
        session["jwt"] = jwt_token  # Stocker le JWT
        

    return jsonify({"message": "Connexion réussie", "user": user_data})

@app.route("/api/auth/local/register", methods=["POST"])
def register():
    """ Inscription utilisateur via Strapi """
    username = request.json.get("username")
    email = request.json.get("email")
    password = request.json.get("password")

    if not username or not email or not password:
        return jsonify({"error": "Tous les champs sont requis"}), 400

    data = {"username": username, "email": email, "password": password}
    response = requests.post(
        f"{STRAPI_URL}/auth/local/register", json=data, headers=HEADERS)
    return jsonify(response.json()) if response.ok else jsonify({"error": "Échec de l'inscription"})

@app.route("/api/auth/forgot-password", methods=["POST"])
def forgot_password():
    """ Demande de réinitialisation du mot de passe via Strapi """
    email = request.json.get("email")
    if not email:
        return jsonify({"error": "Email requis"}), 400

    response = requests.post(
        f"{STRAPI_URL}/auth/forgot-password", json={"email": email}, headers=HEADERS)
    return jsonify(response.json()) if response.ok else jsonify({"error": "Erreur dans la demande"})

@app.route("/api/auth/reset-password", methods=["POST"])
def reset_password():
    """ Réinitialisation du mot de passe via Strapi """
    code = request.json.get("code")
    new_password = request.json.get("password")

    if not code or not new_password:
        return jsonify({"error": "Code de réinitialisation et mot de passe requis"}), 400

    response = requests.post(f"{STRAPI_URL}/auth/reset-password", json={"code": code, "password": new_password}, headers=HEADERS)
    return jsonify(response.json()) if response.ok else jsonify({"error": "Erreur dans la réinitialisation"})

@app.route("/api/users/me", methods=["GET"])
def get_current_user():
    """ Récupérer l'utilisateur connecté via Strapi """
    if "jwt" not in session:
        return jsonify({"error": "Utilisateur non authentifié"}), 401

    headers = {"Authorization": f"Bearer {session['jwt']}"}
    response = requests.get(f"{STRAPI_URL}/users/me", headers=headers)
    return jsonify(response.json()) if response.ok else jsonify({"error": "Impossible de récupérer l'utilisateur"})

@app.route("/api/logout", methods=["POST"])
def logout():
    """ Déconnexion utilisateur """
    session.pop("jwt", None)
    session.pop("user_id", None)
    return jsonify({"message": "Déconnexion réussie"})







# 🔹 **1. Récupérer tous les utilisateurs**
@app.route("/api/users", methods=["GET"])
def get_users():
    """ Récupérer tous les utilisateurs via Strapi """
    response = requests.get(f"{STRAPI_URL}/users", headers=HEADERS)
    return jsonify(response.json()) if response.ok else jsonify({"error": "Impossible de récupérer les utilisateurs"})

# 🔹 **2. Récupérer un utilisateur spécifique**
@app.route("/api/users/<int:user_id>", methods=["GET"])
def get_user(user_id):
    """ Récupérer un utilisateur spécifique """
    response = requests.get(f"{STRAPI_URL}/users/{user_id}", headers=HEADERS)
    return jsonify(response.json()) if response.ok else jsonify({"error": f"Utilisateur ID {user_id} introuvable"})

# 🔹 **3. Créer un nouvel utilisateur**
@app.route("/api/users", methods=["POST"])
def create_user():
    """ Créer un nouvel utilisateur """
    username = request.json.get("username")
    email = request.json.get("email")
    password = request.json.get("password")

    if not username or not email or not password:
        return jsonify({"error": "Tous les champs sont requis"}), 400

    data = {"username": username, "email": email, "password": password}
    response = requests.post(f"{STRAPI_URL}/users", json=data, headers=HEADERS)
    return jsonify(response.json()) if response.ok else jsonify({"error": "Échec de la création de l'utilisateur"})

# 🔹 **4. Modifier un utilisateur**
@app.route("/api/users/<int:user_id>", methods=["PUT"])
def update_user(user_id):
    """ Mettre à jour un utilisateur """
    updated_data = request.json  # Récupère tous les champs envoyés
    response = requests.put(
        f"{STRAPI_URL}/users/{user_id}", json={"data": updated_data}, headers=HEADERS)
    return jsonify(response.json()) if response.ok else jsonify({"error": f"Échec de la mise à jour de l'utilisateur ID {user_id}"})

# 🔹 **5. Supprimer un utilisateur**
@app.route("/api/users/<int:user_id>", methods=["DELETE"])
def delete_user(user_id):
    """ Supprimer un utilisateur """
    response = requests.delete(
        f"{STRAPI_URL}/users/{user_id}", headers=HEADERS)
    return jsonify({"message": f"Utilisateur ID {user_id} supprimé"}) if response.ok else jsonify({"error": f"Échec de la suppression de l'utilisateur ID {user_id}"})

# 🔹 **1. Liste des rôles disponibles**
@app.route("/api/users-permissions/roles", methods=["GET"])
def get_roles():
    """ Récupérer la liste des rôles disponibles via Strapi """
    response = requests.get(f"{STRAPI_URL}/users-permissions/roles", headers=HEADERS)
    return jsonify(response.json()) if response.ok else jsonify({"error": "Impossible de récupérer les rôles"})

# 🔹 **2. Détails d'un rôle spécifique**
@app.route("/api/users-permissions/roles/<int:role_id>", methods=["GET"])
def get_role(role_id):
    """ Récupérer les détails d'un rôle spécifique """
    response = requests.get(f"{STRAPI_URL}/users-permissions/roles/{role_id}", headers=HEADERS)
    return jsonify(response.json()) if response.ok else jsonify({"error": f"Rôle ID {role_id} introuvable"})

# 🔹 **3. Créer un rôle**
@app.route("/api/users-permissions/roles", methods=["POST"])
def create_role():
    """ Créer un nouveau rôle via Strapi """
    role_name = request.json.get("name")
    description = request.json.get("description")

    if not role_name or not description:
        return jsonify({"error": "Nom et description du rôle requis"}), 400

    data = {"name": role_name, "description": description}
    response = requests.post(f"{STRAPI_URL}/users-permissions/roles", json=data, headers=HEADERS)
    return jsonify(response.json()) if response.ok else jsonify({"error": "Échec de la création du rôle"})

# 🔹 **4. Modifier un rôle**
@app.route("/api/users-permissions/roles/<int:role_id>", methods=["PUT"])
def update_role(role_id):
    """ Mettre à jour un rôle existant via Strapi """
    updated_data = request.json  # Récupère tous les champs envoyés
    response = requests.put(f"{STRAPI_URL}/users-permissions/roles/{role_id}", json=updated_data, headers=HEADERS)
    return jsonify(response.json()) if response.ok else jsonify({"error": f"Échec de la mise à jour du rôle ID {role_id}"})

# 🔹 **5. Supprimer un rôle**
@app.route("/api/users-permissions/roles/<int:role_id>", methods=["DELETE"])
def delete_role(role_id):
    """ Supprimer un rôle via Strapi """
    response = requests.delete(f"{STRAPI_URL}/users-permissions/roles/{role_id}", headers=HEADERS)
    return jsonify({"message": f"Rôle ID {role_id} supprimé"}) if response.ok else jsonify({"error": f"Échec de la suppression du rôle ID {role_id}"})



# 🔹 **1. Uploader un fichier**
@app.route("/api/upload", methods=["POST"])
def upload_file():
    """ Uploader un fichier via Strapi (multipart/form-data) """
    if 'file' not in request.files:
        return jsonify({"error": "Aucun fichier envoyé"}), 400

    file = request.files['file']
    files = {"files": (file.filename, file.stream, file.mimetype)}

    response = requests.post(f"{STRAPI_URL}/upload", files=files, headers=HEADERS)
    return jsonify(response.json()) if response.ok else jsonify({"error": "Échec de l'upload"})

# 🔹 **2. Récupérer la liste des fichiers uploadés**
@app.route("/api/upload/files", methods=["GET"])
def get_uploaded_files():
    """ Liste des fichiers uploadés via Strapi """
    response = requests.get(f"{STRAPI_URL}/upload/files", headers=HEADERS)
    return jsonify(response.json()) if response.ok else jsonify({"error": "Impossible de récupérer les fichiers"})

# 🔹 **3. Récupérer un fichier spécifique**
@app.route("/api/upload/files/<int:file_id>", methods=["GET"])
def get_uploaded_file(file_id):
    """ Récupérer un fichier spécifique par son ID """
    response = requests.get(f"{STRAPI_URL}/upload/files/{file_id}", headers=HEADERS)
    return jsonify(response.json()) if response.ok else jsonify({"error": f"Fichier ID {file_id} introuvable"})

# 🔹 **4. Supprimer un fichier**
@app.route("/api/upload/files/<int:file_id>", methods=["DELETE"])
def delete_uploaded_file(file_id):
    """ Supprimer un fichier via Strapi """
    response = requests.delete(f"{STRAPI_URL}/upload/files/{file_id}", headers=HEADERS)
    return jsonify({"message": f"Fichier ID {file_id} supprimé"}) if response.ok else jsonify({"error": f"Échec de la suppression du fichier ID {file_id}"})




# 🔹 **1. Liste des contenus d'un type spécifique**
@app.route("/api/<string:pluralApiId>", methods=["GET"])
def get_all_content(pluralApiId):
    """ Récupérer tous les éléments d'un type spécifique """
    response = requests.get(f"{STRAPI_URL}/{pluralApiId}", headers=HEADERS)
    return jsonify(response.json()) if response.ok else jsonify({"error": f"Impossible de récupérer les contenus de {pluralApiId}"})

# 🔹 **2. Récupérer un élément par ID**
@app.route("/api/<string:pluralApiId>/<int:item_id>", methods=["GET"])
def get_content_by_id(pluralApiId, item_id):
    """ Récupérer un élément spécifique par son ID """
    response = requests.get(f"{STRAPI_URL}/{pluralApiId}/{item_id}", headers=HEADERS)
    return jsonify(response.json()) if response.ok else jsonify({"error": f"Élément ID {item_id} introuvable dans {pluralApiId}"})

# 🔹 **3. Ajouter un nouvel élément**
@app.route("/api/<string:pluralApiId>", methods=["POST"])
def add_content(pluralApiId):
    """ Ajouter un nouvel élément à un type de contenu """
    new_data = request.json  # Récupère les champs envoyés
    response = requests.post(f"{STRAPI_URL}/{pluralApiId}", json={"data": new_data}, headers=HEADERS)
    return jsonify(response.json()) if response.ok else jsonify({"error": f"Échec de l'ajout dans {pluralApiId}"})

# 🔹 **4. Modifier un élément existant**
@app.route("/api/<string:pluralApiId>/<int:item_id>", methods=["PUT"])
def update_content(pluralApiId, item_id):
    """ Mettre à jour un élément """
    updated_data = request.json
    response = requests.put(f"{STRAPI_URL}/{pluralApiId}/{item_id}", json={"data": updated_data}, headers=HEADERS)
    return jsonify(response.json()) if response.ok else jsonify({"error": f"Échec de la mise à jour de l'élément ID {item_id} dans {pluralApiId}"})

# 🔹 **5. Supprimer un élément**
@app.route("/api/<string:pluralApiId>/<int:item_id>", methods=["DELETE"])
def delete_content(pluralApiId, item_id):
    """ Supprimer un élément """
    response = requests.delete(f"{STRAPI_URL}/{pluralApiId}/{item_id}", headers=HEADERS)
    return jsonify({"message": f"Élément ID {item_id} supprimé de {pluralApiId}"}) if response.ok else jsonify({"error": f"Échec de la suppression de l'élément ID {item_id} dans {pluralApiId}"})






# 🔹 **1. Récupérer tous les messages**
CORS(app)  # Autorise toutes les origines
@app.route("/api/messages", methods=["GET"])
def get_messages():
    """ Récupérer les messages """
    user = session.get("user")  # Vérifie si l'utilisateur est connecté
    if not user:
        return jsonify({"error": "Utilisateur non connecté"}), 401

    """ Récupérer tous les messages via Strapi """
    response = requests.get(
        f"{STRAPI_URL}/messages?populate=*", headers=HEADERS)
    print(response.json())
    return jsonify(response.json()) if response.ok else jsonify({"error": "Impossible de récupérer les messages"}), 200


# 🔹 **2. Ajouter un message**
@app.route("/api/messages", methods=["POST"])
def create_message():
    """ Ajouter un nouveau message """
    user = session.get("user")  # Récupération de l'utilisateur en session
    print("User:", user)
    content = request.json.get("content")
    print("Content:", content)
    if not user or not content:
        return jsonify({"error": "Utilisateur et message requis"}), 400
    
    data = {"data": {"user": user, "message": content}}
    response = requests.post(
        f"{STRAPI_URL}/messages", json=data, headers=HEADERS)
    return jsonify(response.json()) if response.ok else jsonify({"error": "Échec de l'ajout du message"})

# 🔹 **3. Récupérer tous les commentaires**
@app.route("/api/comments", methods=["GET"])
def get_comments():
    """ Récupérer tous les commentaires via Strapi """
    response = requests.get(f"{STRAPI_URL}/comments", headers=HEADERS)
    return jsonify(response.json()) if response.ok else jsonify({"error": "Impossible de récupérer les commentaires"})

# 🔹 **4. Ajouter un commentaire**
@app.route("/api/comments", methods=["POST"])
def create_comment():
    """ Ajouter un commentaire à un message ou un média """
    user = request.json.get("user")
    media_id = request.json.get("media_id")
    comment = request.json.get("comment")

    if not user or not media_id or not comment:
        return jsonify({"error": "Utilisateur, media ID et commentaire requis"}), 400

    data = {"data": {"user": user, "media_id": media_id, "comment": comment}}
    response = requests.post(f"{STRAPI_URL}/comments", json=data, headers=HEADERS)
    return jsonify(response.json()) if response.ok else jsonify({"error": "Échec de l'ajout du commentaire"})

# 🔹 **5. Récupérer tous les likes**
@app.route("/api/likes", methods=["GET"])
def get_likes():
    """ Récupérer tous les likes via Strapi """
    response = requests.get(f"{STRAPI_URL}/likes", headers=HEADERS)
    return jsonify(response.json()) if response.ok else jsonify({"error": "Impossible de récupérer les likes"})

# 🔹 **6. Ajouter un like**
@app.route("/api/likes", methods=["POST"])
def create_like():
    """ Ajouter un like à un message ou un média """
    user = request.json.get("user")
    media_id = request.json.get("media_id")

    if not user or not media_id:
        return jsonify({"error": "Utilisateur et media ID requis"}), 400

    data = {"data": {"user": user, "media_id": media_id}}
    response = requests.post(f"{STRAPI_URL}/likes", json=data, headers=HEADERS)
    return jsonify(response.json()) if response.ok else jsonify({"error": "Échec de l'ajout du like"})


if __name__ == '__main__':
    app.run(debug=True)
