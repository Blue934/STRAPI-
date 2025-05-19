import psycopg2
from faker import Faker

# Connexion à Neon
connection = psycopg2.connect(
    host="ep-floral-morning-abfmbl1x.eu-west-2.aws.neon.tech",
    database="Hollow",
    user="Hollow_owner",
    password="npg_QxJTgr4Ws2Bw",
    sslmode="require"
)

cursor = connection.cursor()


def get_all_tables():
    try:
        connection = psycopg2.connect(
            host="ep-floral-morning-abfmbl1x.eu-west-2.aws.neon.tech",
            database="Hollow",
            user="Hollow_owner",
            password="npg_QxJTgr4Ws2Bw",
            sslmode="require"
        )
        cursor = connection.cursor()

        # Récupérer toutes les tables
        query = """
            SELECT table_name
            FROM information_schema.tables
            WHERE table_schema = 'public';
        """
        cursor.execute(query)
        tables = [table[0] for table in cursor.fetchall()]

        cursor.close()
        connection.close()
        print("\n".join(tables))  # Affichage directement
        return tables

    except psycopg2.Error as e:
        print(f"Erreur lors de la récupération des tables : {e}")

# Exemple d'utilisation
tables = get_all_tables()
print("Tables disponibles :", tables)

def get_all_data(table_name):
    connection = psycopg2.connect(
        host="ep-floral-morning-abfmbl1x.eu-west-2.aws.neon.tech",
        database="Hollow",
        user="Hollow_owner",
        password="npg_QxJTgr4Ws2Bw",
        sslmode="require"
    )
    cursor = connection.cursor()
    cursor.execute(f"SELECT * FROM {table_name};")
    rows = cursor.fetchall()
    cursor.close()
    connection.close()
    return rows


def get_table_columns():
    table_name = input("Entrez le nom de la table :\n")

    try:
        connection = psycopg2.connect(
            host="ep-floral-morning-abfmbl1x.eu-west-2.aws.neon.tech",
            database="Hollow",
            user="Hollow_owner",
            password="npg_QxJTgr4Ws2Bw",
            sslmode="require"
        )
        cursor = connection.cursor()

        query = """
            SELECT column_name, data_type
            FROM information_schema.columns
            WHERE table_name = %s;
        """
        cursor.execute(query, (table_name,))
        columns = cursor.fetchall()

        cursor.close()
        connection.close()

        # Afficher les colonnes
        print(f"Colonnes de la table '{table_name}' :")
        for column in columns:
            print(f"- {column[0]} (Type : {column[1]})")

        return columns

    except psycopg2.Error as e:
        print(f"Erreur lors de la récupération des colonnes : {e}")


columns = get_table_columns()
print("Colonnes de la table 'users' :")
for column in columns:
    print(f"- {column[0]} (Type : {column[1]})")


def insert_data():
    # Nom de la table
    table_name = input("Table:\n")

    # Entrer les colonnes (séparées par des virgules)
    columns = input(
        "Colonne (séparées par des virgules, exemple : col1,col2,col3) :\n").split(',')

    # Entrer les valeurs (séparées par des virgules)
    values = input(
        "Valeur (séparées par des virgules, exemple : val1,val2,val3) :\n").split(',')

    # Connexion à Neon
    connection = psycopg2.connect(
        host="ep-floral-morning-abfmbl1x.eu-west-2.aws.neon.tech",
        database="Hollow",
        user="Hollow_owner",
        password="npg_QxJTgr4Ws2Bw",
        sslmode="require"
    )
    cursor = connection.cursor()

    # Construction de la requête SQL
    placeholders = ', '.join(['%s'] * len(values))
    query = f"INSERT INTO {table_name} ({', '.join(columns)}) VALUES ({placeholders});"

    # Exécuter la requête
    # IMPORTANT : Convertir `values` en tuple
    cursor.execute(query, tuple(values))
    connection.commit()
    print("Données insérées avec succès !")

    cursor.close()
    connection.close()
insert_data()


def update_data():
    # Collecte des informations nécessaires
    table_name = input(
        "Dans quelle table souhaitez-vous modifier des données ?:\n")
    column = input("Quelle colonne souhaitez-vous modifier ?:\n")
    new_value = input(f"Nouvelle valeur pour la colonne '{column}' :\n")
    condition_column = input("Dans quelle colonne appliquer la condition ?:\n")
    condition_value = input(
        f"Valeur pour la condition sur '{condition_column}' :\n")

    # Connexion à la base de données
    connection = psycopg2.connect(
        host="ep-floral-morning-abfmbl1x.eu-west-2.aws.neon.tech",
        database="Hollow",
        user="Hollow_owner",
        password="npg_QxJTgr4Ws2Bw",
        sslmode="require"
    )
    cursor = connection.cursor()

    # Construction de la requête SQL pour la mise à jour
    query = f"""
        UPDATE {table_name} 
        SET {column} = %s 
        WHERE {condition_column} = %s;
    """
    cursor.execute(query, (new_value, condition_value))
    connection.commit()

    # Confirmation
    print(
        f"Données modifiées dans la table '{table_name}' : colonne '{column}' mise à jour avec '{new_value}' pour '{condition_column}' = '{condition_value}'.")

    cursor.close()
    connection.close()

update_data()