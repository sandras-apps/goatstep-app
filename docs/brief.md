# Goatstep — Brief per Claude Code (MVP v1)

> Incolla questo file in Claude Code all'inizio del progetto.
> Sono una principiante (SQL e Python base): spiegami ogni scelta tecnica in modo semplice, lavora a piccoli passi e chiedimi conferma prima delle decisioni importanti.

> **Aggiornamento 22/10/2026 — niente limiti rigidi.** Il vecchio "massimo 3 abitudini" non esiste più. L'app **consiglia, non blocca**: nessun limite su categorie o abitudini, niente da sbloccare. Le abitudini sono raggruppate in **categorie** (obiettivi), hanno una **priorità** (essenziale / bonus) e si possono **mettere in pausa**. Vedi 3.2, 3.3 e 3.7.

---

## 1. Il prodotto in breve

**Goatstep** — *"the stubborn goat's step"*
Un'app gratuita, senza AI, che aiuta a costruire abitudini nuove (consiglia di iniziare con poche alla volta, ma non mette mai limiti) e a tenere in un unico posto tutto il materiale di ogni routine.

- Target: persone sopraffatte, che si sentono perse e non hanno struttura.
- Tono: un'amica che crede in te. Caldo ma con energia, mai punitivo, mai militare.
- Mascotte: **Rocco**, capra di montagna testarda con corno spezzato e cerotto. Si fa male, si cura e va avanti.

**Questa prima versione contiene solo la sezione Abitudini.** La sezione Sogni arriverà dopo: prepara solo una voce di menu "Dreams — coming soon".

---

## 2. Scelte tecniche

- **PWA** (installabile da browser, funziona su telefono e desktop), pubblicata su **GitHub Pages**.
- **Backend: Supabase** (proponimi alternative solo se c'è un motivo serio)
  - Progetto in **regione UE** (GDPR).
  - Auth con email + password, verifica email, reset password.
  - Database Postgres con **Row Level Security attiva su tutte le tabelle**: ogni utente vede solo i propri dati.
  - Storage per PDF e immagini in **bucket privati**, accesso solo tramite signed URL temporanei.
- Lingue: **inglese e italiano** all'inizio, struttura pronta per aggiungere lo spagnolo (testi in file di traduzione, niente testi scritti nel codice).
- Stack frontend semplice e leggero: proponimelo tu e spiegami perché.
- Mai mettere chiavi segrete nel codice pubblico (solo la chiave pubblica "anon" di Supabase nel frontend, protetta dalla RLS).

---

## 3. Funzioni della v1

### 3.1 Account
- Registrazione, login, logout, verifica email, password dimenticata.
- **Esporta i miei dati** (file scaricabile con abitudini, storico, note e link).
- **Elimina il mio account** (cancella davvero tutti i dati e i file).
- Accettazione di Privacy Policy e Termini alla registrazione (checkbox, non preselezionata).

### 3.2 Categorie e abitudini — consigliare, mai bloccare

**Categorie (obiettivi)**
- Le abitudini sono raggruppate in **categorie**, cioè obiettivi. Esempio: "Get stronger" contiene: andare a correre, mangiare sano, allenarsi 3-5 volte a settimana, bere più acqua.
- Ogni categoria ha: nome, icona, colore, il perché, ordine, archiviazione.
- In futuro ogni categoria sarà collegata a un **sogno** della sezione Sogni: lo schema deve permetterlo.

**Due tipi di abitudini**
| Tipo | Cosa sono |
| --- | --- |
| **Already mine** ("Già mie") | Routine che l'utente fa già e vuole solo tracciare |
| **In progress** ("In costruzione") | Abitudini nuove |

- **Nessun limite** su categorie o abitudini, niente da sbloccare, nessun blocco tecnico. L'utente aggiunge quello che vuole: i blocchi fanno disinstallare l'app.
- All'onboarding l'app chiede: "Hai già delle routine che vuoi tenere d'occhio?"
- Quando un'abitudine in costruzione è ormai consolidata, l'utente può spostarla in "Già mie".

**Consigli gentili**
- L'app **consiglia** di iniziare con 3 abitudini nuove e spiega perché ("Poche alla volta restano davvero").
- Ogni abitudine ha una **priorità**:
  - **Essential** ("Essenziale"): da fare ogni giorno, mostrata per prima.
  - **Bonus**: va bene saltarla all'inizio.
- **Avvisi gentili e incoraggianti**, sempre chiudibili, quando:
  - l'utente aggiunge più di 3 abitudini nuove in poco tempo;
  - i minuti totali pianificati nella giornata diventano tanti.
  - Esempio di tono: "That's a lot of new things at once. Which ones matter most every day? Mark them as essential, the rest can wait without guilt."
- Le abitudini **"Già mie" non contano mai** per nessun avviso.

**Pausa**
- Un'abitudine può essere **messa in pausa**: sparisce da Oggi e non conta nel calendario, ma conserva tutto lo storico e il materiale.
- Si riprende in qualsiasi momento con un tocco.

### 3.3 Check-in ogni 2 settimane
- Finestrella con 3 domande veloci, calde e brevi (es. "Come ti stai trovando?", "Riesci a seguirle?", "Come ti senti?").
- **Se è andata bene** → si festeggia quello che l'utente ha fatto, niente di più. **Mai spingere ad aggiungere abitudini.** Al massimo una riga finale molto discreta, facile da ignorare, es. "Whenever you feel like it, there's room for something new." Niente pulsanti, pop-up o badge per aggiungere abitudini.
- **Se non è andata bene** → niente colpa, niente rimprovero. Rocco normalizza e propone di alleggerire, es. "Life gets busy sometimes, that's ok. Want to put some bonus habits on pause for a while? They'll be waiting for you, nothing gets lost." Poi mostra le abitudini bonus con un semplice interruttore per metterle in pausa.
- **Parole vietate in tutta l'app**: "failed", "missed", "behind", "streak lost" (e le traduzioni: "fallito", "mancato", "indietro", "serie persa").

### 3.4 Home — Oggi
- Lista delle routine del giorno da spuntare.
- Saluto + "Rocco's tip" del giorno.
- Anello di progresso del giorno (es. 1/3).

### 3.5 Calendario
- Vista mensile per vedere come sono andati i giorni passati, filtrabile per routine.
- **Niente streak che si azzerano**: si mostra quante volte l'abitudine è stata fatta nel mese.

### 3.6 Libreria — la "casa" di ogni routine
Una scheda per ogni routine, raggiungibile anche toccando la routine dalla home. Contiene:
- **Il perché**: una frase scritta dall'utente.
- **Quando**: giorni, orario, promemoria (notifiche web push dove supportate).
- **Versione minima** per i giorni no (es. "2 pagine invece di 15").
- **Sequenze con timer**: più passi uno dopo l'altro, i timer partono in automatico. Esempio routine serale: scrittura con prompt 10 min → lettura non-fiction 15 min → lettura fiction 15 min.
- **Materiale**: link, PDF, immagini, note.
  - Viste: **Tutto** (i link con anteprima a quadratino), **Documenti**, **Link**, **Immagini**, **Preferiti**.
  - **Fissa in alto** un elemento (es. il PDF attuale). Le versioni vecchie vanno in **Archivio**, non si cancellano.

### 3.7 Chat della routine
- Ogni routine ha la sua chat, in ordine cronologico, dove l'utente "butta" tutto: testo, link, PDF, immagini.
- **Smistamento automatico senza AI**: l'app riconosce il tipo (PDF, immagine, link, testo) e lo mostra anche nella vista giusta della libreria.
- Se l'utente carica un file dello stesso tipo di uno fissato, l'app chiede: "È la nuova versione di questo?" → se sì, il nuovo viene fissato e il vecchio va in archivio.
- Limiti di spazio (gli unici limiti dell'app, per sostenibilità tecnica): max **10 MB per file**, **25 MB in totale per utente**. Le foto vengono ridotte prima del caricamento.

---

## 4. Rocco nei vari momenti

Le immagini le fornisco io (PNG con sfondo trasparente) in `assets/rocco/`:

| File | Momento |
| --- | --- |
| `rocco-logo.png` | Logo con la scritta Goatstep |
| `rocco-base.png` | Immagine principale |
| `rocco-wave.png` | Benvenuto / onboarding |
| `rocco-point.png` | Spinta motivazionale, promemoria |
| `rocco-jump.png` | Abitudine completata |
| `rocco-checkin.png` | Check-in ogni 2 settimane |
| `rocco-sprout.png` | Check-in andato bene, si festeggia |
| `rocco-tired.png` | Giorno no |
| `rocco-sleep.png` | Notte, giorni di riposo |
| `rocco-read.png` | Routine di lettura |
| `promo-focus-today.png` | Schermata di login |
| `promo-keep-going.png` | Schermata di benvenuto |

> Le immagini attuali non hanno ancora lo sfondo trasparente: verranno sostituite con versioni trasparenti (stessi nomi file).

Esempi di tono:
- Abitudine fatta: "One more step. Rocco is proud of you."
- Giorno saltato: "Yesterday didn't go as planned. It happens. Today 2 pages and you're back on track."
- Tante abitudini nuove insieme: "That's a lot of new things at once. Which ones matter most every day? Mark them as essential, the rest can wait without guilt."
- Check-in difficile: "Life gets busy sometimes, that's ok. Want to put some bonus habits on pause for a while? They'll be waiting for you, nothing gets lost."

---

## 5. Design

**Colori** (ogni colore ha un significato fisso):

| Colore | Codice | Uso |
| --- | --- | --- |
| Bianco caldo | `#FAF7F2` | Sfondo, base quasi ovunque |
| Blu notte | `#2B3A67` | Testi, titoli, sogni |
| Corallo | `#F07C5E` | Solo pulsanti d'azione principali |
| Menta | `#5BB8A6` | Solo spunte e progressi completati |
| Giallo burro | `#F6D88B` | Solo vittorie, stelline, traguardi |

- Icone delle abitudini in colore neutro o scelto dall'utente (non menta o giallo).
- Sul giallo usare icone blu notte, non bianche (contrasto).
- Rispettare il contrasto WCAG AA per i testi.

**Font**
- Logo e titoli grandi: serif morbido tipo **Fraunces** (Google Fonts).
- Testo dell'app: **Manrope** (Google Fonts).
- Niente font gommosi, scritti a mano o vintage.

**Stile**: pulito, arioso, poche cose per schermata (l'utente è facilmente sovrastimolato). Angoli arrotondati, spunte, anelli di progresso, piccole stelline. Responsive, prima il mobile.

Navigazione in basso: **Today · Habits · Dreams (coming soon) · You**

---

## 6. Privacy, sicurezza, legale

I dati possono essere personali e sensibili (abitudini legate a salute, umore, file privati). Trattali come tali.

- RLS su tutte le tabelle, bucket privati, signed URL a scadenza breve.
- Nessun tracker pubblicitario, nessuna analytics di terze parti nella v1 → servono **solo cookie tecnici**, quindi un banner informativo semplice (niente consensi per marketing).
- Pagine da preparare in bozza (EN + IT): **Privacy Policy**, **Terms of Service**, **Cookie Policy**. Indica chiaramente: titolare, dati raccolti, finalità, dove sono salvati (Supabase, UE), per quanto tempo, diritti GDPR (accesso, export, cancellazione), contatto.
- ⚠️ Le bozze legali vanno riviste da un professionista o con un servizio dedicato (es. iubenda) prima del lancio pubblico. Segnalami ogni punto dubbio.
- Protezione base: limite tentativi di login, password minima sicura, HTTPS ovunque.

---

## 7. Fuori dalla v1 (non costruire ora)

- Sezione **Sogni** (percorso per aree, suggerimenti di abitudini, revisione ogni 6 mesi).
- Funzioni **Pro** e AI (es. assistente per creare routine).
- Login con Google/Apple, lingua spagnola, statistiche avanzate, temi.

---

## 8. Come lavorare

1. Prima proponimi la struttura del progetto e lo schema del database, e aspetta il mio ok.
2. Poi costruisci un pezzo alla volta in questo ordine: account → categorie, abitudini e consigli → home Oggi → calendario → libreria → chat della routine → check-in → pagine legali → pubblicazione.
3. Dopo ogni pezzo: dimmi cosa hai fatto, come provarlo, e cosa devo fare io (es. creare il progetto Supabase).
4. Scrivi un `README.md` semplice con i passi per far girare e pubblicare l'app.
