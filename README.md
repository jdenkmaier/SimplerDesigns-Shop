Simpler Designs Onlineshop
Im Rahmen meines Wifi Kurses habe ich als Abschlussprojekt ein Mockup für einen Onlineshop ertstellt.

Das Projekt ist in drei Ordner geteilt:
  Backend - SimplerDesigns.DataService
  Kunden Frontend - SimplerDesigns.CustomerWeb
  Admin Frontend - SimplerDesigns.Web

SimplerDesigns.DataService ist das Backend des Projekts. Alle Klassen, API-Aufrufe, Datenverarbeitung finden hier statt.
Es muss als erstes gestartet werden, damit die beiden Frontends funktionieren.


Es gibt zwei Frontends: Kunden Frontend und Admin Frontend.

Admin Frontend:
Das Admin Frontend befindet sich im SimplerDesigns.Web Ordner. Nach dem Start kann im Browser über http://localhost:5500/ darauf zugeriffen werden.
Im Admin Frontend kann sich der Betreiber der Website oder ein Mitarbeiter anmelden um die Produkte zu verwalten, den Stand der Bestellungen einzusehen oder zu bearbeiten und die Nutzerverwaltung zu bedienen. Die Änderungen werden in die Datenbank gespeichert und sind im Kunden Frontend sichtbar. Es gibt auch einen Bereich wo man die Bilder der Artikel und die Kategorien verwalten kann. Außerdem kann man über eine Übersicht den Gewinn pro Monat / Jahr betrachten.


Kunden Frontend:
Das Kunden Frontend befindet sich im SimplerDesigns.CustomerWeb Ordner. Nach dem Start kann im Browser über http://localhost:5501/ darauf zugeriffen werden.
Im Kunden Frontend kann man die Artikel betrachten, einen Kunden-Nutzer anlegen und mit diesem einen Kauf tätigen. Nach dem Kauf können die Details der Bestellung im Account eingesehen werden. Im Account kann man die Nutzerdaten (Name, Adresse, Lieferadresse, Passwort, Newsletter-Abo, Nutzername, Passwort) verwalten.
Das Styling der Übersichtsseite und der Artikelseiten befindet sich noch in Arbeit.
