from django.contrib import admin
from django.urls import path
from messagerie.views import page_accueil, enregistrer_message # Ajoute page_accueil ici

urlpatterns = [
    path('', page_accueil, name='accueil'),         # L'adresse vide (accueil)
    path('admin/', admin.site.urls),                # L'admin
    path('envoyer-contact/', enregistrer_message),   # La réception du formulaire
]