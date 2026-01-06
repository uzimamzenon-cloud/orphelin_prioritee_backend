from django.contrib import admin
from .models import MessageContact, Newsletter # Vérifie bien le nom du modèle

admin.site.register(MessageContact)
admin.site.register(Newsletter)