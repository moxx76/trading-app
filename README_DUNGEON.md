# 🏰 Dungeon Crawler - Gioco Testuale Python

Un gioco di esplorazione dungeon con combattimenti a turni, sviluppato in Python puro.

## 📋 Caratteristiche

### 🎮 Sistema di Gioco
- **Giocatore personalizzabile** con nome, HP, attacco, difesa e inventario (massimo 5 oggetti)
- **Mappa 10x10** con stanze interconnesse
- **Sistema di combattimento a turni** con attacco, difesa e pozioni
- **Progressione difficoltà** - nemici più forti nelle profondità del dungeon
- **Boss finale** con 100 HP in una stanza segreta

### 👹 Nemici
- **Goblin** - Nemico base, veloce ma debole
- **Orcetto** - Nemico medio con buona resistenza
- **Dragone** - Nemico forte con alto attacco
- **Boss Supremo** - Boss finale con statistiche elevate

### 🎒 Oggetti
- **Pozioni Vita** - Curano 50 HP
- **Armi** - Aumentano l'attacco (da +3 a +12)
  - Spada Arrugginita, Spada di Ferro, Spada d'Acciaio, Spada Leggendaria
  - Ascia Bipenne, Martello da Guerra
- **Armature** - Aumentano la difesa (da +2 a +10)
  - Giubbotto di Cuoio, Cotta di Maglia, Armatura di Ferro/Acciaio/Leggendaria

### ⚔️ Sistema di Combattimento
- **Attacco** = attacco_base + bonus_arma + danno_casuale(0-5)
- **Difesa** riduce i danni ricevuti (minimo 1 danno)
- **Combattimento a turni** con opzioni:
  1. Attacca
  2. Usa pozione
  3. Fuggi (50% probabilità)

## 🎯 Come Giocare

### Avvio del Gioco
```bash
python3 dungeon_crawler.py
```

### Comandi Disponibili

#### Movimento
- `nord` o `n` - Muoviti verso nord
- `sud` o `s` - Muoviti verso sud
- `est` o `e` - Muoviti verso est
- `ovest` o `o` - Muoviti verso ovest

#### Azioni
- `attacca` o `a` - Attacca il nemico nella stanza
- `raccogli` o `r` - Raccogli gli oggetti presenti

#### Informazioni
- `inventario` o `i` - Mostra l'inventario
- `statistiche` o `stats` - Mostra le tue statistiche

#### Sistema
- `salva` - Salva la partita
- `esci` - Esci dal gioco

## 🎲 Meccaniche di Gioco

### Esplorazione
- Inizi nella stanza (0, 0)
- Esplora il dungeon 10x10 per trovare il boss
- Ogni stanza può contenere:
  - Nemici (40% probabilità)
  - Oggetti (30% probabilità)
  - Entrambi o nessuno

### Progressione
- Le statistiche dei nemici aumentano con la profondità (x + y)
- Più ti addentri nel dungeon, più i nemici diventano forti
- Il boss si trova in una stanza casuale nell'angolo lontano (7-9, 7-9)

### Inventario
- Massimo 5 oggetti
- Le armi e armature migliori si equipaggiano automaticamente
- Le pozioni possono essere usate durante il combattimento

### Salvataggio
- Il gioco salva in `dungeon_save.pkl`
- Puoi caricare la partita dal menu principale
- Salva prima di affrontare il boss!

## 🏆 Obiettivo

Trova e sconfiggi il **Boss Supremo** nella stanza segreta per vincere!

## 🛡️ Consigli Strategici

1. **Esplora con cautela** - Raccogli oggetti prima di affrontare nemici forti
2. **Gestisci le pozioni** - Usale al momento giusto nei combattimenti difficili
3. **Equipaggiamento** - Cerca sempre armi e armature migliori
4. **Salva spesso** - Usa il comando `salva` regolarmente
5. **Fuga strategica** - A volte fuggire è meglio che morire

## 📊 Statistiche Iniziali

### Giocatore
- HP: 100
- Attacco: 10
- Difesa: 5

### Boss
- HP: 100
- Attacco: 20
- Difesa: 10

## 🐛 Gestione Errori

Il gioco include gestione completa degli errori:
- Input non validi vengono segnalati
- Comandi impossibili (es. muoversi con nemico vivo) sono bloccati
- Salvataggio/caricamento con gestione eccezioni
- Interruzione sicura con Ctrl+C

## 📝 Requisiti

- Python 3.6+
- Nessuna libreria esterna richiesta (solo librerie standard)

## 🎮 Esempio di Partita

```
🏰 DUNGEON CRAWLER - L'AVVENTURA INIZIA 🏰
==================================================

1. Nuova partita
2. Carica partita
3. Esci

Scelta: 1

==================================================
Come ti chiami, eroe? Arthas

Benvenuto, Arthas! La tua avventura inizia ora...

🏗️  Generazione del dungeon in corso...
✅ Dungeon generato con successo!

==================================================
📍 Posizione: (0, 0) - Profondità: 0
==================================================
✨ Vedi 1 oggetto/i a terra:
   1. Pozione Vita (Cura 50 HP)
🚪 Uscite: SUD, EST
==================================================

📜 COMANDI DISPONIBILI:
--------------------------------------------------
  nord/sud/est/ovest - Muoviti
  attacca            - Attacca il nemico
  raccogli           - Raccogli oggetti
  inventario         - Mostra inventario
  statistiche        - Mostra statistiche
  salva              - Salva partita
  esci               - Esci dal gioco
--------------------------------------------------

➤ Comando: raccogli
✨ Hai raccolto: Pozione Vita (Cura 50 HP)
📦 Hai raccolto 1 oggetto/i!
```

## 🎨 Features del Codice

- **Architettura OOP** - Classi ben strutturate e modulari
- **Design Patterns** - Factory pattern per nemici e oggetti
- **Type Hints** - Annotazioni di tipo per migliore leggibilità
- **Documentazione** - Docstrings per tutte le classi e metodi
- **Gestione errori** - Try-except per operazioni critiche
- **Clean Code** - Codice ben commentato e organizzato

Buona fortuna nella tua avventura! 🗡️🛡️
