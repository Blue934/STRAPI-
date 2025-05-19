import requests

# Configuration de base
BASE_URL = 'http://localhost:1337/api'
HEADERS = {
    'Authorization': 'Bearer 866249dfc66359fc8112846c58f83c69bd5d543f32dbac4cef5dd0f1c9780b035e4ac6f294330f4363704f8170560e0b04757fba78bc06ffaad1fa510535848a7f2b4313f1d57debe4209eae36a8d61af75b379c6f8f595b3dc27e29103776b71bdd9cba1e6edf280d4efcc741de41c9c63de5bbd356b20a6338b241200439f6'
}


def list_content(content_type):
    """ Affiche tous les éléments d'un type de contenu """
    try:
        response = requests.get(f"{BASE_URL}/{content_type}", headers=HEADERS)
        response.raise_for_status()
        all_items = response.json()

        if isinstance(all_items, dict) and 'data' in all_items:
            print(all_items)
            for item in all_items['data']:
                print(
                    f"ID: {item['documentId']}, Titre: {item.get('title', 'Sans titre')}")
        else:
            print("Format de réponse inattendu :", all_items)

    except requests.RequestException as error:
        print("Erreur lors de la récupération des éléments :", error)


def modify_content(content_type, item_id, new_title):
    """ Met à jour le titre d'un élément spécifique """
    try:
        update_data = {
            'data': {'title': new_title}
        }
        response = requests.put(
            f"{BASE_URL}/{content_type}/{item_id}", json=update_data, headers=HEADERS)
        response.raise_for_status()
        print(f"✅ Élément avec ID {item_id} mis à jour avec succès.")

    except requests.RequestException as error:
        print("Erreur lors de la modification :", error)


def delete_content(content_type, item_id):
    """ Supprime un élément spécifique """
    try:
        response = requests.delete(
            f"{BASE_URL}/{content_type}/{item_id}", headers=HEADERS)
        response.raise_for_status()
        print(f"🗑️ Élément avec ID {item_id} supprimé avec succès.")

    except requests.RequestException as error:
        print("Erreur lors de la suppression :", error)


def add_content(content_type, title, description):
    """ Ajoute un nouvel élément à une collection """
    try:
        new_item_data = {
            'data': {
                'title': title,
                'description': description
            }
        }
        response = requests.post(
            f"{BASE_URL}/{content_type}", json=new_item_data, headers=HEADERS)
        response.raise_for_status()
        print(f"✅ Élément ajouté avec succès :", response.json())

    except requests.RequestException as error:
        print("🚨 Erreur lors de l'ajout :", error)

# Interface utilisateur en boucle
while True:
    action = input(
        "\nChoisissez une action (lister/modifier/supprimer/ajouter/exit) : ").strip().lower()

    if action == "exit":
        print("Fin du programme.")
        break

    content_type = input(
        "Entrez le type de contenu (ex: articles, authors...) : ").strip()

    if action == "lister":
        list_content(content_type)

    elif action in ["modifier", "supprimer"]:
        item_id = input("Entrez l'ID de l'élément à traiter : ").strip()
        if action == "modifier":
            new_title = input("Entrez le nouveau titre : ").strip()
            modify_content(content_type, item_id, new_title)
        elif action == "supprimer":
            delete_content(content_type, item_id)
    elif action == 'ajouter':
        new_title = input("Entrez le nouveau titre : ").strip()
        new_describ = input("Entrez votre description: ").strip()
        add_content(content_type, new_title, new_describ)
    else:
        print("🚨 Action inconnue, veuillez réessayer.")
