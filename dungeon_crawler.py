#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Dungeon Crawler Testuale
Un gioco di esplorazione di dungeon con combattimenti a turni
"""

import random
import pickle
import os
from typing import List, Dict, Optional, Tuple
from enum import Enum


# ==================== ENUMERAZIONI ====================

class Direzione(Enum):
    """Direzioni di movimento possibili"""
    NORD = "nord"
    SUD = "sud"
    EST = "est"
    OVEST = "ovest"


class TipoOggetto(Enum):
    """Tipi di oggetti raccoglibili"""
    POZIONE = "pozione"
    ARMA = "arma"
    ARMATURA = "armatura"


# ==================== CLASSI OGGETTI ====================

class Oggetto:
    """Classe base per gli oggetti del gioco"""

    def __init__(self, nome: str, tipo: TipoOggetto, valore: int):
        self.nome = nome
        self.tipo = tipo
        self.valore = valore

    def __str__(self) -> str:
        return f"{self.nome} ({self.tipo.value})"

    def __repr__(self) -> str:
        return self.__str__()


class Arma(Oggetto):
    """Arma che aumenta l'attacco del giocatore"""

    def __init__(self, nome: str, bonus_attacco: int):
        super().__init__(nome, TipoOggetto.ARMA, bonus_attacco)
        self.bonus_attacco = bonus_attacco

    def __str__(self) -> str:
        return f"{self.nome} (+{self.bonus_attacco} ATK)"


class Armatura(Oggetto):
    """Armatura che aumenta la difesa del giocatore"""

    def __init__(self, nome: str, bonus_difesa: int):
        super().__init__(nome, TipoOggetto.ARMATURA, bonus_difesa)
        self.bonus_difesa = bonus_difesa

    def __str__(self) -> str:
        return f"{self.nome} (+{self.bonus_difesa} DEF)"


class Pozione(Oggetto):
    """Pozione che cura il giocatore"""

    def __init__(self, nome: str = "Pozione Vita", cura: int = 50):
        super().__init__(nome, TipoOggetto.POZIONE, cura)
        self.cura = cura

    def __str__(self) -> str:
        return f"{self.nome} (Cura {self.cura} HP)"


# ==================== CLASSI PERSONAGGI ====================

class Personaggio:
    """Classe base per giocatore e nemici"""

    def __init__(self, nome: str, hp: int, attacco: int, difesa: int):
        self.nome = nome
        self.hp_max = hp
        self.hp = hp
        self.attacco = attacco
        self.difesa = difesa

    def e_vivo(self) -> bool:
        """Verifica se il personaggio è ancora vivo"""
        return self.hp > 0

    def subisci_danno(self, danno: int):
        """Applica danno al personaggio considerando la difesa"""
        danno_effettivo = max(1, danno - self.difesa)  # Minimo 1 danno
        self.hp -= danno_effettivo
        return danno_effettivo

    def cura(self, quantita: int):
        """Cura il personaggio"""
        hp_precedenti = self.hp
        self.hp = min(self.hp_max, self.hp + quantita)
        return self.hp - hp_precedenti


class Giocatore(Personaggio):
    """Classe del giocatore con inventario e equipaggiamento"""

    MAX_INVENTARIO = 5

    def __init__(self, nome: str):
        super().__init__(nome, hp=100, attacco=10, difesa=5)
        self.inventario: List[Oggetto] = []
        self.arma_equipaggiata: Optional[Arma] = None
        self.armatura_equipaggiata: Optional[Armatura] = None
        self.posizione: Tuple[int, int] = (0, 0)

    def attacco_totale(self) -> int:
        """Calcola l'attacco totale con bonus arma"""
        bonus = self.arma_equipaggiata.bonus_attacco if self.arma_equipaggiata else 0
        return self.attacco + bonus

    def difesa_totale(self) -> int:
        """Calcola la difesa totale con bonus armatura"""
        bonus = self.armatura_equipaggiata.bonus_difesa if self.armatura_equipaggiata else 0
        return self.difesa + bonus

    def aggiungi_oggetto(self, oggetto: Oggetto) -> bool:
        """Aggiunge un oggetto all'inventario se c'è spazio"""
        if len(self.inventario) >= self.MAX_INVENTARIO:
            return False

        self.inventario.append(oggetto)

        # Equipaggia automaticamente se è meglio di quello attuale
        if isinstance(oggetto, Arma):
            if not self.arma_equipaggiata or oggetto.bonus_attacco > self.arma_equipaggiata.bonus_attacco:
                self.arma_equipaggiata = oggetto
        elif isinstance(oggetto, Armatura):
            if not self.armatura_equipaggiata or oggetto.bonus_difesa > self.armatura_equipaggiata.bonus_difesa:
                self.armatura_equipaggiata = oggetto

        return True

    def usa_pozione(self) -> Optional[int]:
        """Usa una pozione dall'inventario"""
        for i, oggetto in enumerate(self.inventario):
            if isinstance(oggetto, Pozione):
                hp_curati = self.cura(oggetto.cura)
                self.inventario.pop(i)
                return hp_curati
        return None

    def mostra_inventario(self):
        """Mostra il contenuto dell'inventario"""
        print("\n" + "="*50)
        print(f"📦 INVENTARIO ({len(self.inventario)}/{self.MAX_INVENTARIO})")
        print("="*50)

        if not self.inventario:
            print("  Inventario vuoto")
        else:
            for i, oggetto in enumerate(self.inventario, 1):
                equipaggiato = ""
                if oggetto == self.arma_equipaggiata:
                    equipaggiato = " [EQUIPAGGIATA]"
                elif oggetto == self.armatura_equipaggiata:
                    equipaggiato = " [EQUIPAGGIATA]"
                print(f"  {i}. {oggetto}{equipaggiato}")
        print("="*50)

    def mostra_statistiche(self):
        """Mostra le statistiche del giocatore"""
        print("\n" + "="*50)
        print(f"⚔️  {self.nome} - STATISTICHE")
        print("="*50)
        print(f"  ❤️  HP: {self.hp}/{self.hp_max}")
        print(f"  ⚔️  Attacco: {self.attacco_totale()} (base: {self.attacco})")
        print(f"  🛡️  Difesa: {self.difesa_totale()} (base: {self.difesa})")
        print(f"  📍 Posizione: ({self.posizione[0]}, {self.posizione[1]})")

        if self.arma_equipaggiata:
            print(f"  🗡️  Arma: {self.arma_equipaggiata.nome} (+{self.arma_equipaggiata.bonus_attacco})")
        else:
            print(f"  🗡️  Arma: Nessuna")

        if self.armatura_equipaggiata:
            print(f"  🛡️  Armatura: {self.armatura_equipaggiata.nome} (+{self.armatura_equipaggiata.bonus_difesa})")
        else:
            print(f"  🛡️  Armatura: Nessuna")

        print("="*50)


class Nemico(Personaggio):
    """Classe per i nemici del dungeon"""

    def __init__(self, nome: str, hp: int, attacco: int, difesa: int, livello: int = 1):
        super().__init__(nome, hp, attacco, difesa)
        self.livello = livello

    def __str__(self) -> str:
        return f"{self.nome} (Liv.{self.livello}) - HP: {self.hp}/{self.hp_max}"


# ==================== FACTORY NEMICI ====================

class NemicoFactory:
    """Factory per creare nemici con difficoltà basata sul livello"""

    @staticmethod
    def crea_nemico(profondita: int) -> Nemico:
        """Crea un nemico casuale con statistiche basate sulla profondità"""
        tipo = random.choice(["goblin", "orcetto", "dragone"])

        # Aumenta le statistiche con la profondità
        moltiplicatore = 1 + (profondita * 0.3)

        if tipo == "goblin":
            hp = int(30 * moltiplicatore)
            attacco = int(8 * moltiplicatore)
            difesa = int(2 * moltiplicatore)
            return Nemico("Goblin", hp, attacco, difesa, profondita)

        elif tipo == "orcetto":
            hp = int(50 * moltiplicatore)
            attacco = int(12 * moltiplicatore)
            difesa = int(5 * moltiplicatore)
            return Nemico("Orcetto", hp, attacco, difesa, profondita)

        else:  # dragone
            hp = int(70 * moltiplicatore)
            attacco = int(15 * moltiplicatore)
            difesa = int(8 * moltiplicatore)
            return Nemico("Dragone", hp, attacco, difesa, profondita)

    @staticmethod
    def crea_boss() -> Nemico:
        """Crea il boss finale"""
        return Nemico("BOSS SUPREMO", 100, 20, 10, 99)


# ==================== FACTORY OGGETTI ====================

class OggettoFactory:
    """Factory per creare oggetti casuali"""

    ARMI = [
        ("Spada Arrugginita", 3),
        ("Spada di Ferro", 5),
        ("Spada d'Acciaio", 8),
        ("Spada Leggendaria", 12),
        ("Ascia Bipenne", 10),
        ("Martello da Guerra", 9),
    ]

    ARMATURE = [
        ("Giubbotto di Cuoio", 2),
        ("Cotta di Maglia", 4),
        ("Armatura di Ferro", 6),
        ("Armatura di Acciaio", 8),
        ("Armatura Leggendaria", 10),
    ]

    @staticmethod
    def crea_oggetto_casuale() -> Oggetto:
        """Crea un oggetto casuale"""
        tipo = random.choice([TipoOggetto.POZIONE, TipoOggetto.ARMA, TipoOggetto.ARMATURA])

        if tipo == TipoOggetto.POZIONE:
            return Pozione()
        elif tipo == TipoOggetto.ARMA:
            nome, bonus = random.choice(OggettoFactory.ARMI)
            return Arma(nome, bonus)
        else:
            nome, bonus = random.choice(OggettoFactory.ARMATURE)
            return Armatura(nome, bonus)


# ==================== STANZA ====================

class Stanza:
    """Rappresenta una stanza del dungeon"""

    def __init__(self, x: int, y: int, profondita: int):
        self.x = x
        self.y = y
        self.profondita = profondita
        self.visitata = False
        self.nemico: Optional[Nemico] = None
        self.oggetti: List[Oggetto] = []
        self.e_stanza_boss = False

        # Collegamenti alle stanze adiacenti
        self.collegamenti: Dict[Direzione, Optional['Stanza']] = {
            Direzione.NORD: None,
            Direzione.SUD: None,
            Direzione.EST: None,
            Direzione.OVEST: None,
        }

    def inizializza_contenuto(self):
        """Inizializza nemici e oggetti nella stanza"""
        if self.e_stanza_boss:
            self.nemico = NemicoFactory.crea_boss()
            return

        # 40% probabilità di nemico
        if random.random() < 0.4:
            self.nemico = NemicoFactory.crea_nemico(self.profondita)

        # 30% probabilità di oggetto
        if random.random() < 0.3:
            self.oggetti.append(OggettoFactory.crea_oggetto_casuale())

    def mostra_descrizione(self):
        """Mostra la descrizione della stanza"""
        print("\n" + "="*50)
        print(f"📍 Posizione: ({self.x}, {self.y}) - Profondità: {self.profondita}")
        print("="*50)

        if self.e_stanza_boss:
            print("🏰 SEI NELLA STANZA DEL BOSS! 🏰")

        if self.nemico and self.nemico.e_vivo():
            print(f"👹 C'è un {self.nemico}!")

        if self.oggetti:
            print(f"✨ Vedi {len(self.oggetti)} oggetto/i a terra:")
            for i, obj in enumerate(self.oggetti, 1):
                print(f"   {i}. {obj}")

        # Mostra le uscite disponibili
        uscite = []
        if self.collegamenti[Direzione.NORD]:
            uscite.append("NORD")
        if self.collegamenti[Direzione.SUD]:
            uscite.append("SUD")
        if self.collegamenti[Direzione.EST]:
            uscite.append("EST")
        if self.collegamenti[Direzione.OVEST]:
            uscite.append("OVEST")

        if uscite:
            print(f"🚪 Uscite: {', '.join(uscite)}")

        print("="*50)


# ==================== MAPPA ====================

class Mappa:
    """Gestisce la mappa del dungeon (griglia 10x10)"""

    DIMENSIONE = 10

    def __init__(self):
        self.griglia: Dict[Tuple[int, int], Stanza] = {}
        self.genera_dungeon()

    def genera_dungeon(self):
        """Genera il dungeon con stanze collegate"""
        print("🏗️  Generazione del dungeon in corso...")

        # Crea tutte le stanze
        for x in range(self.DIMENSIONE):
            for y in range(self.DIMENSIONE):
                profondita = x + y  # Profondità aumenta andando verso angolo opposto
                stanza = Stanza(x, y, profondita)
                self.griglia[(x, y)] = stanza

        # Collega le stanze
        for x in range(self.DIMENSIONE):
            for y in range(self.DIMENSIONE):
                stanza = self.griglia[(x, y)]

                # Collegamento NORD (y-1)
                if y > 0:
                    stanza.collegamenti[Direzione.NORD] = self.griglia[(x, y-1)]

                # Collegamento SUD (y+1)
                if y < self.DIMENSIONE - 1:
                    stanza.collegamenti[Direzione.SUD] = self.griglia[(x, y+1)]

                # Collegamento OVEST (x-1)
                if x > 0:
                    stanza.collegamenti[Direzione.OVEST] = self.griglia[(x-1, y)]

                # Collegamento EST (x+1)
                if x < self.DIMENSIONE - 1:
                    stanza.collegamenti[Direzione.EST] = self.griglia[(x+1, y)]

        # Inizializza il contenuto delle stanze
        for stanza in self.griglia.values():
            stanza.inizializza_contenuto()

        # Imposta la stanza del boss in una posizione lontana dall'inizio
        x_boss = random.randint(7, 9)
        y_boss = random.randint(7, 9)
        self.griglia[(x_boss, y_boss)].e_stanza_boss = True
        self.griglia[(x_boss, y_boss)].inizializza_contenuto()

        print("✅ Dungeon generato con successo!")

    def get_stanza(self, x: int, y: int) -> Optional[Stanza]:
        """Ottiene la stanza alle coordinate specificate"""
        return self.griglia.get((x, y))


# ==================== SISTEMA DI COMBATTIMENTO ====================

class SistemaCombattimento:
    """Gestisce i combattimenti a turni"""

    @staticmethod
    def combatti(giocatore: Giocatore, nemico: Nemico):
        """Esegue un combattimento a turni tra giocatore e nemico"""
        print("\n" + "⚔️ "*25)
        print(f"💥 INIZIA IL COMBATTIMENTO!")
        print(f"   {giocatore.nome} VS {nemico.nome}")
        print("⚔️ "*25 + "\n")

        turno = 1

        while giocatore.e_vivo() and nemico.e_vivo():
            print(f"\n--- TURNO {turno} ---")
            print(f"❤️  {giocatore.nome}: {giocatore.hp}/{giocatore.hp_max} HP")
            print(f"👹 {nemico.nome}: {nemico.hp}/{nemico.hp_max} HP")

            # Turno del giocatore
            print(f"\n🎯 Cosa vuoi fare?")
            print("1. Attacca")
            print("2. Usa pozione")
            print("3. Fuggi")

            scelta = input("Scelta: ").strip()

            if scelta == "1":
                # Attacco del giocatore
                danno_base = giocatore.attacco_totale()
                danno_critico = random.randint(0, 5)  # Danno casuale extra
                danno_totale = danno_base + danno_critico
                danno_inflitto = nemico.subisci_danno(danno_totale)

                print(f"\n⚔️  {giocatore.nome} attacca!")
                print(f"💥 Danno inflitto: {danno_inflitto} HP")

                if not nemico.e_vivo():
                    print(f"\n🎉 Hai sconfitto {nemico.nome}!")
                    break

            elif scelta == "2":
                # Usa pozione
                hp_curati = giocatore.usa_pozione()
                if hp_curati is not None:
                    print(f"\n💚 Hai usato una pozione! Recuperati {hp_curati} HP")
                else:
                    print(f"\n❌ Non hai pozioni!")
                    continue  # Non conta come turno

            elif scelta == "3":
                # Fuggi
                if random.random() < 0.5:
                    print(f"\n🏃 Sei fuggito dal combattimento!")
                    return False
                else:
                    print(f"\n❌ Non sei riuscito a fuggire!")

            else:
                print("❌ Scelta non valida!")
                continue

            # Turno del nemico (se ancora vivo)
            if nemico.e_vivo():
                print(f"\n👹 {nemico.nome} contrattacca!")
                danno_nemico = nemico.attacco
                danno_subito = giocatore.subisci_danno(danno_nemico)
                print(f"💢 Hai subito {danno_subito} HP di danno!")

                if not giocatore.e_vivo():
                    print(f"\n💀 Sei stato sconfitto da {nemico.nome}...")
                    return False

            turno += 1

        return True


# ==================== SISTEMA SALVATAGGIO ====================

class SistemaSalvataggio:
    """Gestisce il salvataggio e caricamento del gioco"""

    SAVE_FILE = "dungeon_save.pkl"

    @staticmethod
    def salva_partita(giocatore: Giocatore, mappa: Mappa):
        """Salva lo stato del gioco"""
        try:
            with open(SistemaSalvataggio.SAVE_FILE, 'wb') as f:
                pickle.dump((giocatore, mappa), f)
            print("💾 Partita salvata con successo!")
            return True
        except Exception as e:
            print(f"❌ Errore nel salvataggio: {e}")
            return False

    @staticmethod
    def carica_partita() -> Optional[Tuple[Giocatore, Mappa]]:
        """Carica lo stato del gioco"""
        try:
            if not os.path.exists(SistemaSalvataggio.SAVE_FILE):
                return None

            with open(SistemaSalvataggio.SAVE_FILE, 'rb') as f:
                giocatore, mappa = pickle.load(f)
            print("📂 Partita caricata con successo!")
            return giocatore, mappa
        except Exception as e:
            print(f"❌ Errore nel caricamento: {e}")
            return None


# ==================== GIOCO PRINCIPALE ====================

class DungeonCrawler:
    """Classe principale del gioco"""

    def __init__(self):
        self.giocatore: Optional[Giocatore] = None
        self.mappa: Optional[Mappa] = None
        self.stanza_corrente: Optional[Stanza] = None
        self.in_gioco = True

    def inizia_gioco(self):
        """Inizializza e avvia il gioco"""
        print("\n" + "="*50)
        print("🏰 DUNGEON CRAWLER - L'AVVENTURA INIZIA 🏰")
        print("="*50)

        # Menu principale
        print("\n1. Nuova partita")
        print("2. Carica partita")
        print("3. Esci")

        scelta = input("\nScelta: ").strip()

        if scelta == "1":
            self.nuova_partita()
        elif scelta == "2":
            self.carica_partita()
        elif scelta == "3":
            print("👋 Arrivederci!")
            return
        else:
            print("❌ Scelta non valida!")
            self.inizia_gioco()
            return

        if self.giocatore and self.mappa:
            self.loop_principale()

    def nuova_partita(self):
        """Inizia una nuova partita"""
        print("\n" + "="*50)
        nome = input("Come ti chiami, eroe? ").strip()

        if not nome:
            nome = "Avventuriero"

        self.giocatore = Giocatore(nome)
        self.mappa = Mappa()
        self.stanza_corrente = self.mappa.get_stanza(0, 0)
        self.giocatore.posizione = (0, 0)

        print(f"\nBenvenuto, {nome}! La tua avventura inizia ora...")

    def carica_partita(self):
        """Carica una partita salvata"""
        risultato = SistemaSalvataggio.carica_partita()

        if risultato:
            self.giocatore, self.mappa = risultato
            x, y = self.giocatore.posizione
            self.stanza_corrente = self.mappa.get_stanza(x, y)
        else:
            print("❌ Nessun salvataggio trovato. Inizia una nuova partita.")
            self.nuova_partita()

    def loop_principale(self):
        """Loop principale del gioco"""
        while self.in_gioco and self.giocatore.e_vivo():
            # Mostra la stanza corrente
            self.stanza_corrente.visitata = True
            self.stanza_corrente.mostra_descrizione()

            # Mostra il menu
            self.mostra_menu()

            # Gestisci input
            comando = input("\n➤ Comando: ").strip().lower()
            self.gestisci_comando(comando)

            # Controlla vittoria
            if self.stanza_corrente.e_stanza_boss and not self.stanza_corrente.nemico.e_vivo():
                self.vittoria()
                break

        if not self.giocatore.e_vivo():
            self.game_over()

    def mostra_menu(self):
        """Mostra il menu dei comandi"""
        print("\n" + "-"*50)
        print("📜 COMANDI DISPONIBILI:")
        print("-"*50)
        print("  nord/sud/est/ovest - Muoviti")
        print("  attacca            - Attacca il nemico")
        print("  raccogli           - Raccogli oggetti")
        print("  inventario         - Mostra inventario")
        print("  statistiche        - Mostra statistiche")
        print("  salva              - Salva partita")
        print("  esci               - Esci dal gioco")
        print("-"*50)

    def gestisci_comando(self, comando: str):
        """Gestisce i comandi del giocatore"""
        # Comandi di movimento
        if comando in ["nord", "n"]:
            self.muovi(Direzione.NORD)
        elif comando in ["sud", "s"]:
            self.muovi(Direzione.SUD)
        elif comando in ["est", "e"]:
            self.muovi(Direzione.EST)
        elif comando in ["ovest", "o"]:
            self.muovi(Direzione.OVEST)

        # Comando attacco
        elif comando in ["attacca", "a"]:
            self.attacca_nemico()

        # Comando raccogli
        elif comando in ["raccogli", "r"]:
            self.raccogli_oggetti()

        # Mostra informazioni
        elif comando in ["inventario", "i"]:
            self.giocatore.mostra_inventario()
        elif comando in ["statistiche", "stat", "stats"]:
            self.giocatore.mostra_statistiche()

        # Salva/esci
        elif comando == "salva":
            SistemaSalvataggio.salva_partita(self.giocatore, self.mappa)
        elif comando == "esci":
            print("Vuoi salvare prima di uscire? (s/n)")
            if input().strip().lower() == "s":
                SistemaSalvataggio.salva_partita(self.giocatore, self.mappa)
            self.in_gioco = False

        else:
            print("❌ Comando non riconosciuto!")

    def muovi(self, direzione: Direzione):
        """Muove il giocatore in una direzione"""
        # Controlla se c'è un nemico vivo
        if self.stanza_corrente.nemico and self.stanza_corrente.nemico.e_vivo():
            print("❌ Non puoi muoverti! C'è un nemico da sconfiggere!")
            return

        # Controlla se la direzione è valida
        nuova_stanza = self.stanza_corrente.collegamenti.get(direzione)

        if nuova_stanza:
            print(f"🚶 Ti muovi verso {direzione.value}...")
            self.stanza_corrente = nuova_stanza
            self.giocatore.posizione = (nuova_stanza.x, nuova_stanza.y)
        else:
            print(f"❌ Non puoi andare a {direzione.value}! C'è un muro.")

    def attacca_nemico(self):
        """Attacca il nemico nella stanza"""
        if not self.stanza_corrente.nemico:
            print("❌ Non c'è nessun nemico da attaccare!")
            return

        if not self.stanza_corrente.nemico.e_vivo():
            print("❌ Il nemico è già stato sconfitto!")
            return

        # Inizia il combattimento
        vittoria = SistemaCombattimento.combatti(self.giocatore, self.stanza_corrente.nemico)

        if not vittoria and not self.giocatore.e_vivo():
            self.in_gioco = False

    def raccogli_oggetti(self):
        """Raccoglie gli oggetti nella stanza"""
        if not self.stanza_corrente.oggetti:
            print("❌ Non ci sono oggetti da raccogliere!")
            return

        if len(self.giocatore.inventario) >= Giocatore.MAX_INVENTARIO:
            print("❌ Inventario pieno! Non puoi raccogliere altri oggetti.")
            return

        # Raccogli tutti gli oggetti possibili
        oggetti_raccolti = 0
        while self.stanza_corrente.oggetti and len(self.giocatore.inventario) < Giocatore.MAX_INVENTARIO:
            oggetto = self.stanza_corrente.oggetti.pop(0)
            self.giocatore.aggiungi_oggetto(oggetto)
            print(f"✨ Hai raccolto: {oggetto}")
            oggetti_raccolti += 1

        if oggetti_raccolti > 0:
            print(f"📦 Hai raccolto {oggetti_raccolti} oggetto/i!")

    def vittoria(self):
        """Gestisce la vittoria del giocatore"""
        print("\n" + "🎉"*25)
        print("="*50)
        print("🏆 VITTORIA! HAI SCONFITTO IL BOSS! 🏆")
        print("="*50)
        print(f"Congratulazioni, {self.giocatore.nome}!")
        print(f"Hai completato il dungeon con {self.giocatore.hp} HP rimanenti!")
        print("="*50)
        print("🎉"*25 + "\n")
        self.in_gioco = False

    def game_over(self):
        """Gestisce la sconfitta del giocatore"""
        print("\n" + "💀"*25)
        print("="*50)
        print("☠️  GAME OVER ☠️")
        print("="*50)
        print(f"{self.giocatore.nome} è caduto nel dungeon...")
        print("Riprova!")
        print("="*50)
        print("💀"*25 + "\n")


# ==================== MAIN ====================

def main():
    """Funzione principale"""
    try:
        gioco = DungeonCrawler()
        gioco.inizia_gioco()
    except KeyboardInterrupt:
        print("\n\n👋 Gioco interrotto. Arrivederci!")
    except Exception as e:
        print(f"\n❌ Errore imprevisto: {e}")
        import traceback
        traceback.print_exc()


if __name__ == "__main__":
    main()
