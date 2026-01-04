from django.shortcuts import render
from django.http import JsonResponse
from .models import MessageContact
from django.views.decorators.csrf import csrf_exempt
import json

# 1. Affiche le site
def page_accueil(request):
    return render(request, 'index.html')

# 2. Reçoit et Stocke les informations
@csrf_exempt
def enregistrer_message(request):
    if request.method == 'POST':
        try:
            # On transforme le JSON reçu en dictionnaire Python
            donnees = json.loads(request.body)
            
            # --- ZONE DE DÉBOGAGE : Regarde ton terminal Django quand tu cliques ---
            print("Données reçues par le serveur :", donnees) 

            # Extraction et Stockage dans la Base de Données
            # On vérifie bien que les noms entre parenthèses '...' 
            # correspondent à ce que ton JavaScript envoie !
            nouveau_message = MessageContact.objects.create(
                nom=donnees.get('nom'),
                email=donnees.get('email'),
                sujet=donnees.get('sujet'),
                motif=donnees.get('motif'),
                message=donnees.get('message')
            )
            
            # Sauvegarde forcée (facultatif avec .create() mais rassurant pour un débutant)
            nouveau_message.save()

            print(f"Succès ! Message de {nouveau_message.nom} enregistré sous l'ID {nouveau_message.id}")

            return JsonResponse({
                "status": "success",
                "message": "Félicitations Zenon, le message a été stocké avec succès !"
            }, status=201)

        except Exception as e:
            print("ERREUR LORS DE L'ENREGISTREMENT :", str(e))
            return JsonResponse({
                "status": "error",
                "message": f"Désolé Zenon, ça a échoué : {str(e)}"
            }, status=400)
            
    return JsonResponse({"message": "Seules les requêtes POST sont acceptées"}, status=405)