from django.db import models

class MessageContact(models.Model):
    # On définit les "tiroirs" de notre boîte
    nom = models.CharField(max_length=100)      # Texte court
    email = models.EmailField()                # Format email
    sujet = models.CharField(max_length=200)   # Texte court
    motif = models.CharField(max_length=200)   # Texte court
    message = models.TextField()               # Texte long (le corps du message)
    date_envoi = models.DateTimeField(auto_now_add=True) # Date automatique

    def __str__(self):
        return self.nom  # Pour voir le nom de la personne dans l'admin