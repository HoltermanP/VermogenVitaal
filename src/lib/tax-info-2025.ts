import { 
  TrendingUp, 
  Building2, 
  Calculator, 
  Shield, 
  FileText,
  Home,
  Briefcase,
  PiggyBank,
  LucideIcon
} from "lucide-react"

export interface TaxTopic {
  id: string
  title: string
  shortDescription: string
  icon: LucideIcon
  category: string
  color: string
  sections: TaxSection[]
  importantNotes?: string[]
  relatedTopics?: string[]
}

export interface TaxSection {
  title: string
  content: string
  subsections?: {
    title: string
    content: string
  }[]
  important?: boolean
}

export const taxTopics2025: TaxTopic[] = [
  {
    id: "inkomstenbelasting",
    title: "Inkomstenbelasting 2025",
    shortDescription: "Alles over de tarieven, schijven en heffingskortingen voor inkomstenbelasting in 2025",
    icon: TrendingUp,
    category: "Belastingtarieven",
    color: "blue",
    relatedTopics: ["aftrekposten", "heffingskortingen"],
    sections: [
      {
        title: "Belastingtarieven 2025",
        important: true,
        content: "De inkomstenbelasting kent in 2025 twee belastingschijven:",
        subsections: [
          {
            title: "Schijf 1: Tot €75.518",
            content: "Het tarief voor de eerste schijf bedraagt 36,97%. Dit tarief geldt voor het belastbare inkomen tot en met €75.518."
          },
          {
            title: "Schijf 2: Vanaf €75.518",
            content: "Voor het belastbare inkomen boven €75.518 geldt een tarief van 49,50%. Dit is het hoogste tarief in het Nederlandse belastingstelsel."
          }
        ]
      },
      {
        title: "Heffingskortingen",
        content: "Heffingskortingen verminderen het bedrag aan belasting dat je moet betalen. In 2025 zijn de belangrijkste heffingskortingen:",
        subsections: [
          {
            title: "Algemene heffingskorting",
            content: "De algemene heffingskorting bedraagt in 2025 €3.070 voor personen tot 65 jaar en €1.535 voor personen vanaf 65 jaar. Deze korting wordt automatisch toegepast."
          },
          {
            title: "Arbeidskorting",
            content: "De arbeidskorting is afhankelijk van je arbeidsinkomen. Het maximum bedraagt €5.052 voor 2025. Hoe hoger je inkomen, hoe lager de arbeidskorting wordt."
          },
          {
            title: "Inkomensafhankelijke combinatiekorting",
            content: "Als je een partner hebt en jullie allebei werken, kunnen jullie recht hebben op de inkomensafhankelijke combinatiekorting. Het maximum bedraagt €2.888 in 2025."
          }
        ]
      },
      {
        title: "Aftrekposten",
        content: "Aftrekposten verminderen je belastbare inkomen. Belangrijke aftrekposten zijn:",
        subsections: [
          {
            title: "Hypotheekrenteaftrek",
            content: "Je kunt de betaalde hypotheekrente aftrekken van je inkomen. Let op: voor nieuwe hypotheken vanaf 2013 gelden strengere regels. Alleen de rente over de annuïteitenhypotheek of lineaire hypotheek is aftrekbaar."
          },
          {
            title: "Studiekosten",
            content: "Bepaalde studiekosten zijn aftrekbaar, zoals collegegeld, studiematerialen en reiskosten. De studiefinanciering wordt wel als inkomen gezien."
          },
          {
            title: "Giften aan goede doelen",
            content: "Giften aan erkende goede doelen zijn aftrekbaar als je minimaal €60 per jaar geeft en dit kunt aantonen met kwitanties."
          },
          {
            title: "Uitgaven voor inkomensvoorziening",
            content: "Premies voor lijfrenteverzekeringen en bepaalde pensioenregelingen zijn aftrekbaar binnen de jaarruimte en reserveringsruimte."
          }
        ]
      },
      {
        title: "Box 1: Belastbaar inkomen uit werk en woning",
        content: "In box 1 worden alle inkomsten uit werk en woning belast. Dit omvat:",
        subsections: [
          {
            title: "Loon uit dienstbetrekking",
            content: "Je loon, vakantiegeld, bonussen en andere beloningen vallen onder box 1."
          },
          {
            title: "Winst uit onderneming",
            content: "Als ondernemer valt je winst uit onderneming in box 1. Je kunt gebruik maken van de zelfstandigenaftrek en MKB-winstvrijstelling."
          },
          {
            title: "Resultaat uit overige werkzaamheden",
            content: "Inkomsten uit freelance werk of nevenactiviteiten vallen onder het resultaat uit overige werkzaamheden (BOW)."
          }
        ]
      },
      {
        title: "Praktische tips",
        important: true,
        content: "Om optimaal gebruik te maken van de inkomstenbelastingregels:",
        subsections: [
          {
            title: "Houd je administratie bij",
            content: "Bewaar alle bonnetjes en documenten die nodig zijn voor aftrekposten. Een goede administratie bespaart tijd en geld."
          },
          {
            title: "Plan je uitgaven",
            content: "Bepaalde uitgaven (zoals giften) kun je strategisch plannen om optimaal gebruik te maken van de aftrek."
          },
          {
            title: "Controleer je voorheffing",
            content: "Controleer of je loonheffing correct is ingehouden. Te veel voorheffing betekent dat je geld terugkrijgt, te weinig betekent een naheffing."
          }
        ]
      }
    ],
    importantNotes: [
      "De tarieven gelden voor het belastbare inkomen na aftrek van alle aftrekposten.",
      "Heffingskortingen worden pas toegepast nadat de belasting is berekend.",
      "Voor 2025 zijn de tarieven licht aangepast ten opzichte van 2024."
    ]
  },
  {
    id: "vennootschapsbelasting",
    title: "Vennootschapsbelasting 2025",
    shortDescription: "Tarieven, MKB-winstvrijstelling en optimalisatiemogelijkheden voor vennootschapsbelasting",
    icon: Building2,
    category: "Ondernemers",
    color: "purple",
    relatedTopics: ["inkomstenbelasting", "dividendbelasting"],
    sections: [
      {
        title: "Belastingtarieven 2025",
        important: true,
        content: "De vennootschapsbelasting (VPB) kent in 2025 twee tarieven:",
        subsections: [
          {
            title: "Tarief tot €200.000",
            content: "Voor de eerste €200.000 aan winst geldt een tarief van 19%. Dit is het lage tarief dat vooral gunstig is voor het midden- en kleinbedrijf."
          },
          {
            title: "Tarief vanaf €200.000",
            content: "Voor winst boven €200.000 geldt een tarief van 25,8%. Dit is het hoge tarief dat van toepassing is op grotere winsten."
          }
        ]
      },
      {
        title: "MKB-winstvrijstelling",
        important: true,
        content: "De MKB-winstvrijstelling is een belangrijke fiscale faciliteit voor kleine en middelgrote ondernemingen:",
        subsections: [
          {
            title: "Percentage",
            content: "De MKB-winstvrijstelling bedraagt 14% van de winst tot €200.000. Dit betekent dat je over 14% van je winst geen vennootschapsbelasting hoeft te betalen."
          },
          {
            title: "Effectief tarief",
            content: "Door de MKB-winstvrijstelling is het effectieve tarief voor de eerste €200.000 ongeveer 14,44% in plaats van 19%."
          },
          {
            title: "Voorwaarden",
            content: "Om gebruik te kunnen maken van de MKB-winstvrijstelling moet je voldoen aan bepaalde voorwaarden, zoals het hebben van minimaal 5% van de aandelen."
          }
        ]
      },
      {
        title: "Innovatiebox",
        important: true,
        content: "De innovatiebox biedt een verlaagd tarief van 9% voor winst uit innovatieve activiteiten:",
        subsections: [
          {
            title: "WBSO-eisen",
            content: "Om gebruik te maken van de innovatiebox moet je voldoen aan de WBSO-eisen (Wet Bevordering Speur- en Ontwikkelingswerk). Dit betekent dat je daadwerkelijk onderzoek en ontwikkeling doet."
          },
          {
            title: "Maximum",
            content: "Het maximumbedrag voor de innovatiebox is €350.000 per jaar. Boven dit bedrag geldt het normale VPB-tarief."
          },
          {
            title: "Voordelen",
            content: "De innovatiebox kan aanzienlijke belastingbesparingen opleveren voor innovatieve bedrijven, vooral in de technologie- en farmaceutische sector."
          }
        ]
      },
      {
        title: "Fiscale reserves",
        content: "Er zijn verschillende fiscale reserves die je kunt gebruiken om belasting uit te stellen:",
        subsections: [
          {
            title: "Investeringsreserve (Vamil/MIA)",
            content: "Voor duurzame investeringen kun je gebruik maken van de Vamil (Willekeurige afschrijving milieu-investeringen) en MIA (Milieu-investeringsaftrek). Dit kan leiden tot een lagere belastingaanslag."
          },
          {
            title: "Reserve voor uitbreiding",
            content: "Je kunt een reserve vormen voor toekomstige investeringen, waardoor je belasting uitstelt tot het moment dat je daadwerkelijk investeert."
          },
          {
            title: "Reserve voor pensioenen",
            content: "Voor pensioenvoorzieningen voor werknemers kun je reserves vormen die fiscaal aftrekbaar zijn."
          }
        ]
      },
      {
        title: "DGA-salaris en dividend",
        content: "Als directeur-grootaandeelhouder (DGA) moet je een marktconform salaris uitkeren:",
        subsections: [
          {
            title: "Minimum DGA-salaris 2025",
            content: "Het minimum DGA-salaris bedraagt €51.000 bij een winst tot €200.000 en €75.000 bij een winst vanaf €200.000. Dit salaris is belast in box 1."
          },
          {
            title: "Dividendbelasting",
            content: "Dividenduitkeringen zijn belast tegen 26,5% dividendbelasting. Dit is een definitieve heffing, dus je hoeft hierover geen inkomstenbelasting meer te betalen."
          },
          {
            title: "Optimalisatie",
            content: "De verhouding tussen DGA-salaris en dividend kan worden geoptimaliseerd om het totale belastingtarief te minimaliseren."
          }
        ]
      },
      {
        title: "Praktische tips",
        important: true,
        content: "Voor optimale fiscale planning:",
        subsections: [
          {
            title: "Plan je winst",
            content: "Door strategisch te plannen wanneer je kosten maakt en wanneer je opbrengsten ontvangt, kun je je winst optimaliseren."
          },
          {
            title: "Gebruik fiscale reserves",
            content: "Maak optimaal gebruik van fiscale reserves om belasting uit te stellen en je liquiditeit te verbeteren."
          },
          {
            title: "Overweeg de innovatiebox",
            content: "Als je innovatief bezig bent, overweeg dan om gebruik te maken van de innovatiebox voor een lager tarief."
          },
          {
            title: "Optimaliseer DGA-salaris",
            content: "Zorg voor een goede balans tussen DGA-salaris en dividend om het totale belastingtarief te minimaliseren."
          }
        ]
      }
    ],
    importantNotes: [
      "De MKB-winstvrijstelling geldt alleen voor winst tot €200.000.",
      "Het DGA-salaris moet marktconform zijn, anders kan de Belastingdienst dit corrigeren.",
      "Dividendbelasting is een definitieve heffing en kan niet worden verrekend met andere belastingen."
    ]
  },
  {
    id: "btw",
    title: "BTW (Omzetbelasting) 2025",
    shortDescription: "BTW-tarieven, aangifte, vrijstellingen en optimalisatiemogelijkheden",
    icon: Calculator,
    category: "BTW",
    color: "green",
    relatedTopics: ["inkomstenbelasting"],
    sections: [
      {
        title: "BTW-tarieven 2025",
        important: true,
        content: "In Nederland gelden drie BTW-tarieven:",
        subsections: [
          {
            title: "Algemeen tarief: 21%",
            content: "Het algemene BTW-tarief bedraagt 21%. Dit tarief geldt voor de meeste goederen en diensten, zoals elektronica, kleding, en de meeste diensten."
          },
          {
            title: "Verlaagd tarief: 9%",
            content: "Het verlaagde tarief van 9% geldt voor voedingsmiddelen (behalve alcohol), boeken, medicijnen, openbaar vervoer, en culturele evenementen zoals musea en concerten."
          },
          {
            title: "Nultarief: 0%",
            content: "Het nultarief geldt voor export naar landen buiten de EU en bepaalde internationale diensten. Je hoeft geen BTW te berekenen, maar je kunt wel BTW op je kosten terugvorderen."
          }
        ]
      },
      {
        title: "BTW-aangifte",
        important: true,
        content: "Als ondernemer moet je regelmatig BTW-aangifte doen:",
        subsections: [
          {
            title: "Aangiftefrequentie",
            content: "De meeste ondernemers doen maandelijks of per kwartaal BTW-aangifte. Als je weinig BTW afdraagt, kun je soms jaarlijks aangifte doen."
          },
          {
            title: "Aangiftetermijn",
            content: "De BTW-aangifte moet uiterlijk op de laatste dag van de maand na het aangiftetijdvak worden ingediend. Voor een kwartaalaangifte betekent dit uiterlijk 30 april, 31 juli, 31 oktober of 31 januari."
          },
          {
            title: "Betalingsverplichting",
            content: "De verschuldigde BTW moet uiterlijk op dezelfde datum worden betaald als de aangifte moet zijn ingediend."
          },
          {
            title: "BTW-teruggaaf",
            content: "Als je meer BTW hebt betaald (op je kosten) dan je hebt ontvangen (op je verkopen), krijg je BTW terug. Dit kan interessant zijn voor starters of bedrijven met veel investeringen."
          }
        ]
      },
      {
        title: "BTW-vrijstellingen",
        content: "Sommige activiteiten zijn vrijgesteld van BTW:",
        subsections: [
          {
            title: "Medische diensten",
            content: "Bepaalde medische diensten zijn vrijgesteld van BTW, zoals behandelingen door artsen, tandartsen en fysiotherapeuten."
          },
          {
            title: "Onderwijs",
            content: "Onderwijsinstellingen zijn meestal vrijgesteld van BTW. Dit geldt voor scholen, universiteiten en bepaalde opleidingsinstellingen."
          },
          {
            title: "Financiële diensten",
            content: "Veel financiële diensten zijn vrijgesteld van BTW, zoals verzekeringen, leningen en bepaalde beleggingsdiensten."
          },
          {
            title: "Kleineondernemersregeling",
            content: "Als je omzet onder €20.000 per jaar blijft, kun je gebruik maken van de kleineondernemersregeling en hoef je geen BTW af te dragen."
          }
        ]
      },
      {
        title: "BTW op kosten",
        content: "Als ondernemer kun je de BTW die je betaalt op je kosten terugvorderen:",
        subsections: [
          {
            title: "Voorwaarde",
            content: "De kosten moeten zakelijk zijn en gebruikt worden voor je onderneming. Privé-kosten zijn niet aftrekbaar."
          },
          {
            title: "BTW-bewijs",
            content: "Je moet een factuur hebben met BTW-aanduiding om de BTW terug te kunnen vorderen. Zorg dus dat je altijd een factuur vraagt."
          },
          {
            title: "Privégebruik",
            content: "Als je goederen of diensten zowel zakelijk als privé gebruikt, moet je de BTW naar rato verdelen."
          }
        ]
      },
      {
        title: "Intracommunautaire leveringen",
        content: "Bij handel binnen de EU gelden speciale regels:",
        subsections: [
          {
            title: "Leveringen aan andere EU-landen",
            content: "Bij leveringen aan ondernemers in andere EU-landen hoef je geen BTW te berekenen (0%). De klant moet het BTW-nummer opgeven."
          },
          {
            title: "Aankopen uit andere EU-landen",
            content: "Bij aankopen uit andere EU-landen moet je zelf BTW betalen via de zogenaamde 'intracommunautaire verwerving'. Dit moet je aangeven in je BTW-aangifte."
          },
          {
            title: "BTW-nummer",
            content: "Voor intracommunautaire handel moet je een BTW-nummer hebben. Dit krijg je automatisch als je je inschrijft bij de Kamer van Koophandel."
          }
        ]
      },
      {
        title: "Praktische tips",
        important: true,
        content: "Voor een goede BTW-administratie:",
        subsections: [
          {
            title: "Houd alle facturen bij",
            content: "Bewaar alle inkomende en uitgaande facturen. Je moet deze minimaal 7 jaar bewaren voor de Belastingdienst."
          },
          {
            title: "Controleer BTW-nummers",
            content: "Controleer bij intracommunautaire leveringen altijd of het BTW-nummer van je klant geldig is via de EU-website."
          },
          {
            title: "Gebruik boekhoudsoftware",
            content: "Goede boekhoudsoftware helpt je bij het bijhouden van BTW en het doen van aangifte. Dit voorkomt fouten en bespaart tijd."
          },
          {
            title: "Plan je uitgaven",
            content: "Als je veel BTW terugkrijgt, kan het voordelig zijn om grote uitgaven te doen aan het einde van een kwartaal, zodat je sneller BTW terugkrijgt."
          }
        ]
      }
    ],
    importantNotes: [
      "BTW-aangifte moet altijd tijdig worden ingediend om boetes te voorkomen.",
      "Bij export naar landen buiten de EU geldt het nultarief, maar je moet wel kunnen aantonen dat de goederen daadwerkelijk zijn geëxporteerd.",
      "De kleineondernemersregeling is alleen interessant als je weinig BTW terugkrijgt op je kosten."
    ]
  },
  {
    id: "aftrekposten",
    title: "Aftrekposten & Kortingen 2025",
    shortDescription: "Zelfstandigenaftrek, MKB-winstvrijstelling, investeringsaftrek en andere fiscale voordelen",
    icon: Shield,
    category: "Optimalisatie",
    color: "orange",
    relatedTopics: ["inkomstenbelasting", "vennootschapsbelasting"],
    sections: [
      {
        title: "Zelfstandigenaftrek",
        important: true,
        content: "De zelfstandigenaftrek is een belangrijke aftrek voor ondernemers:",
        subsections: [
          {
            title: "Bedrag 2025",
            content: "De zelfstandigenaftrek bedraagt in 2025 €5.030. Dit bedrag wordt afgetrokken van je winst uit onderneming."
          },
          {
            title: "Urencriterium",
            content: "Om recht te hebben op de zelfstandigenaftrek moet je minimaal 1.225 uur per jaar besteden aan je onderneming. Dit komt neer op ongeveer 24 uur per week."
          },
          {
            title: "Meewerkfactor",
            content: "Als je een partner hebt die meewerkt in je onderneming, kan deze ook meetellen voor het urencriterium. De partner moet dan wel minimaal 800 uur per jaar meewerken."
          },
          {
            title: "Startersaftrek",
            content: "Nieuwe ondernemers kunnen naast de zelfstandigenaftrek ook gebruik maken van de startersaftrek van €2.123. Dit geldt voor de eerste 5 jaar van je onderneming."
          }
        ]
      },
      {
        title: "MKB-winstvrijstelling",
        important: true,
        content: "De MKB-winstvrijstelling is een belangrijke fiscale faciliteit:",
        subsections: [
          {
            title: "Percentage",
            content: "De MKB-winstvrijstelling bedraagt 14% van je winst uit onderneming. Dit betekent dat je over 14% van je winst geen inkomstenbelasting hoeft te betalen."
          },
          {
            title: "Maximum",
            content: "De MKB-winstvrijstelling is beperkt tot een maximum van €14.000 per jaar. Dit komt overeen met een winst van ongeveer €100.000."
          },
          {
            title: "Voorwaarden",
            content: "Om gebruik te kunnen maken van de MKB-winstvrijstelling moet je voldoen aan het urencriterium (minimaal 1.225 uur per jaar)."
          }
        ]
      },
      {
        title: "Investeringsaftrek",
        content: "Er zijn verschillende vormen van investeringsaftrek:",
        subsections: [
          {
            title: "Kleinschaligheidsinvesteringsaftrek (KIA)",
            content: "Bij investeringen in bedrijfsmiddelen kun je gebruik maken van de KIA. Het percentage hangt af van het investeringsbedrag en varieert van 28% tot 7,5%."
          },
          {
            title: "Milieu-investeringsaftrek (MIA)",
            content: "Voor duurzame investeringen kun je gebruik maken van de MIA. Het percentage kan oplopen tot 45% van het investeringsbedrag, afhankelijk van het type investering."
          },
          {
            title: "Willekeurige afschrijving milieu-investeringen (Vamil)",
            content: "Naast de MIA kun je ook gebruik maken van de Vamil, waarmee je 75% van de investering willekeurig mag afschrijven."
          },
          {
            title: "Energie-investeringsaftrek (EIA)",
            content: "Voor energiebesparende investeringen kun je gebruik maken van de EIA met een percentage van 45,5%."
          }
        ]
      },
      {
        title: "Arbeidskorting",
        content: "De arbeidskorting is een belangrijke heffingskorting voor werkenden:",
        subsections: [
          {
            title: "Berekeningswijze",
            content: "De arbeidskorting wordt berekend op basis van je arbeidsinkomen. Het maximum bedraagt €5.052 in 2025."
          },
          {
            title: "Afbouw",
            content: "De arbeidskorting wordt afgebouwd bij een inkomen boven €75.518. Bij een inkomen van €120.000 of hoger is er geen arbeidskorting meer."
          },
          {
            title: "Voor wie",
            content: "De arbeidskorting geldt voor iedereen met arbeidsinkomen, zowel werknemers als ondernemers."
          }
        ]
      },
      {
        title: "Andere aftrekposten",
        content: "Er zijn nog meer aftrekposten waar je gebruik van kunt maken:",
        subsections: [
          {
            title: "Ondernemersfaciliteiten",
            content: "Als ondernemer kun je gebruik maken van verschillende faciliteiten, zoals de fiscale oudedagsreserve (FOR) en de investeringsreserve."
          },
          {
            title: "Pensioenpremies",
            content: "Premies voor lijfrenteverzekeringen en pensioenregelingen zijn aftrekbaar binnen de jaarruimte en reserveringsruimte."
          },
          {
            title: "Giften",
            content: "Giften aan erkende goede doelen zijn aftrekbaar als je minimaal €60 per jaar geeft en dit kunt aantonen."
          },
          {
            title: "Studiekosten",
            content: "Bepaalde studiekosten zijn aftrekbaar, zoals collegegeld en studiematerialen."
          }
        ]
      },
      {
        title: "Praktische tips",
        important: true,
        content: "Om optimaal gebruik te maken van aftrekposten:",
        subsections: [
          {
            title: "Houd je uren bij",
            content: "Voor de zelfstandigenaftrek is het belangrijk om je uren goed bij te houden. Gebruik hiervoor een urenregistratiesysteem."
          },
          {
            title: "Plan je investeringen",
            content: "Plan grote investeringen strategisch om optimaal gebruik te maken van investeringsaftrekken zoals MIA en EIA."
          },
          {
            title: "Controleer alle mogelijkheden",
            content: "Er zijn veel verschillende aftrekposten en kortingen. Laat je adviseren door een belastingadviseur om te zien waar je recht op hebt."
          },
          {
            title: "Bewaar bewijsstukken",
            content: "Bewaar alle bewijsstukken voor aftrekposten, zoals facturen, kwitanties en urenregistraties. Je moet deze minimaal 7 jaar bewaren."
          }
        ]
      }
    ],
    importantNotes: [
      "De zelfstandigenaftrek en MKB-winstvrijstelling gelden alleen als je voldoet aan het urencriterium van 1.225 uur per jaar.",
      "De startersaftrek geldt alleen voor de eerste 5 jaar van je onderneming.",
      "Investeringsaftrekken kunnen worden gecombineerd, maar er gelden maximumbedragen."
    ]
  },
  {
    id: "pensioen",
    title: "Pensioen & Lijfrente 2025",
    shortDescription: "Lijfrentepremieaftrek, pensioenregelingen en fiscale oudedagsreserve voor ondernemers",
    icon: FileText,
    category: "Pensioen",
    color: "teal",
    relatedTopics: ["inkomstenbelasting", "aftrekposten"],
    sections: [
      {
        title: "Lijfrentepremieaftrek",
        important: true,
        content: "Je kunt premies voor lijfrenteverzekeringen aftrekken van je inkomen:",
        subsections: [
          {
            title: "Jaarruimte",
            content: "De jaarruimte is het bedrag dat je jaarlijks mag aftrekken voor lijfrentepremies. Dit wordt berekend op basis van je inkomen en je opgebouwde pensioenrechten."
          },
          {
            title: "Reserveringsruimte",
            content: "Als je in voorgaande jaren niet volledig gebruik hebt gemaakt van je jaarruimte, kun je dit alsnog doen via de reserveringsruimte. Dit kan tot 7 jaar terug."
          },
          {
            title: "Maximum",
            content: "Het maximumbedrag voor lijfrentepremies is beperkt. Voor 2025 bedraagt het maximum ongeveer €17.000, afhankelijk van je inkomen en pensioenopbouw."
          },
          {
            title: "Voorwaarden",
            content: "De lijfrente moet voldoen aan bepaalde voorwaarden, zoals een uitkering vanaf je AOW-leeftijd en een minimum uitkeringsduur van 20 jaar."
          }
        ]
      },
      {
        title: "Pensioenregelingen voor zelfstandigen",
        content: "Als zelfstandige kun je verschillende pensioenregelingen opzetten:",
        subsections: [
          {
            title: "Lijfrenteverzekering",
            content: "Een lijfrenteverzekering is een verzekering waarbij je premies betaalt die je later als uitkering ontvangt. De premies zijn aftrekbaar, de uitkering is belast."
          },
          {
            title: "Pensioenrekening",
            content: "Een pensioenrekening is een spaarrekening speciaal voor pensioen. Je stort hierop geld dat je later als pensioen ontvangt."
          },
          {
            title: "Pensioenbeleggingsrekening",
            content: "Met een pensioenbeleggingsrekening beleg je je pensioenvermogen. Dit kan meer rendement opleveren, maar brengt ook meer risico met zich mee."
          },
          {
            title: "Banksparen",
            content: "Banksparen is een vorm van pensioensparen waarbij je geld op een speciale rekening zet. Dit is vaak eenvoudiger dan een lijfrenteverzekering."
          }
        ]
      },
      {
        title: "Fiscale oudedagsreserve (FOR)",
        important: true,
        content: "De FOR is een interessante optie voor ondernemers:",
        subsections: [
          {
            title: "Wat is de FOR?",
            content: "De FOR is een reserve die je als ondernemer kunt vormen voor je pensioen. Je stelt hiermee belasting uit tot het moment dat je de reserve opneemt."
          },
          {
            title: "Maximum",
            content: "Het maximumbedrag voor de FOR bedraagt ongeveer €10.000 per jaar. Dit bedrag wordt jaarlijks geïndexeerd."
          },
          {
            title: "Opname",
            content: "Je kunt de FOR opnemen vanaf je 65e jaar. Bij opname wordt het bedrag belast in box 1 tegen je normale inkomstenbelastingtarief."
          },
          {
            title: "Voordelen",
            content: "De FOR heeft als voordeel dat je belasting uitstelt en dat je flexibel bent in wanneer je de reserve opneemt."
          }
        ]
      },
      {
        title: "Pensioen voor werknemers",
        content: "Als werknemer bouw je meestal pensioen op via je werkgever:",
        subsections: [
          {
            title: "Pensioenfonds",
            content: "Veel werknemers bouwen pensioen op via een pensioenfonds. De premies worden betaald door jou en je werkgever."
          },
          {
            title: "Pensioenverzekering",
            content: "Sommige werkgevers hebben een pensioenverzekering. Dit werkt vergelijkbaar met een pensioenfonds."
          },
          {
            title: "Pensioenopbouw",
            content: "Je pensioenopbouw wordt bijgehouden door je pensioenfonds of verzekeraar. Je kunt dit online inzien via Mijn Pensioenoverzicht."
          }
        ]
      },
      {
        title: "AOW",
        content: "De AOW is het basispensioen voor iedereen:",
        subsections: [
          {
            title: "Wat is AOW?",
            content: "De AOW (Algemene Ouderdomswet) is een basispensioen dat iedereen ontvangt vanaf de AOW-leeftijd. Dit wordt betaald door de Sociale Verzekeringsbank (SVB)."
          },
          {
            title: "AOW-leeftijd",
            content: "De AOW-leeftijd wordt jaarlijks verhoogd en is afhankelijk van je geboortejaar. Voor mensen geboren in 1965 is de AOW-leeftijd 67 jaar en 3 maanden."
          },
          {
            title: "AOW-bedrag",
            content: "Het AOW-bedrag is afhankelijk van je woonsituatie. Voor alleenstaanden is het hoger dan voor gehuwden of samenwonenden."
          }
        ]
      },
      {
        title: "Praktische tips",
        important: true,
        content: "Voor een goede pensioenvoorziening:",
        subsections: [
          {
            title: "Start op tijd",
            content: "Hoe eerder je begint met pensioenopbouw, hoe meer je later hebt. Start dus zo vroeg mogelijk."
          },
          {
            title: "Maak gebruik van jaarruimte",
            content: "Maak elk jaar optimaal gebruik van je jaarruimte. Dit geeft je belastingvoordeel en zorgt voor een beter pensioen."
          },
          {
            title: "Diversifieer",
            content: "Zorg voor een goede spreiding van je pensioenvermogen. Combineer bijvoorbeeld een lijfrente met een pensioenbeleggingsrekening."
          },
          {
            title: "Laat je adviseren",
            content: "Pensioen is complex. Laat je adviseren door een pensioenadviseur of financieel planner om de beste keuzes te maken."
          }
        ]
      }
    ],
    importantNotes: [
      "Lijfrentepremies zijn aftrekbaar, maar de uitkering later is belast tegen je normale inkomstenbelastingtarief.",
      "De FOR kan alleen worden gebruikt door ondernemers die voldoen aan het urencriterium.",
      "De jaarruimte wordt jaarlijks berekend op basis van je inkomen en pensioenopbouw."
    ]
  },
  {
    id: "box3",
    title: "Box 3: Vermogensbelasting 2025",
    shortDescription: "Belasting over sparen en beleggen, nieuwe box 3 regeling en heffingsvrije voet",
    icon: PiggyBank,
    category: "Vermogen",
    color: "indigo",
    relatedTopics: ["inkomstenbelasting"],
    sections: [
      {
        title: "Wat is Box 3?",
        important: true,
        content: "Box 3 is de belasting over je vermogen:",
        subsections: [
          {
            title: "Belastbaar vermogen",
            content: "In box 3 wordt belasting geheven over je vermogen, zoals spaargeld, beleggingen en onroerend goed (dat niet je eigen woning is)."
          },
          {
            title: "Heffingsvrije voet",
            content: "Er is een heffingsvrije voet van €57.000 per persoon (€114.000 voor fiscale partners) in 2025. Over dit bedrag hoef je geen belasting te betalen."
          },
          {
            title: "Tarief",
            content: "Over het belastbare vermogen wordt een forfaitair rendement berekend, waarover je 36% belasting betaalt. Het werkelijke rendement maakt niet uit."
          }
        ]
      },
      {
        title: "Nieuwe Box 3 regeling 2025",
        important: true,
        content: "Vanaf 2025 geldt een nieuwe box 3 regeling:",
        subsections: [
          {
            title: "Vermogenscategorieën",
            content: "Je vermogen wordt verdeeld in drie categorieën: banktegoeden, beleggingen/andere bezittingen, en schulden."
          },
          {
            title: "Forfaitair rendement",
            content: "Voor elke categorie geldt een ander forfaitair rendement: banktegoeden 0,36%, beleggingen 6,17%, en schulden 2,57%."
          },
          {
            title: "Belasting",
            content: "Over het totale forfaitaire rendement betaal je 36% belasting. Dit is een vereenvoudiging ten opzichte van de oude regeling."
          }
        ]
      },
      {
        title: "Wat valt in Box 3?",
        content: "De volgende zaken vallen in box 3:",
        subsections: [
          {
            title: "Spaargeld",
            content: "Al je spaargeld op bankrekeningen valt in box 3, behalve als het onder de heffingsvrije voet valt."
          },
          {
            title: "Beleggingen",
            content: "Aandelen, obligaties, beleggingsfondsen en andere beleggingen vallen in box 3."
          },
          {
            title: "Onroerend goed",
            content: "Onroerend goed dat niet je eigen woning is (zoals een tweede huis of verhuurde woning) valt in box 3."
          },
          {
            title: "Schulden",
            content: "Schulden (zoals een lening) worden afgetrokken van je bezittingen. Alleen schulden die niet gerelateerd zijn aan je eigen woning tellen mee."
          }
        ]
      },
      {
        title: "Wat valt NIET in Box 3?",
        content: "De volgende zaken vallen niet in box 3:",
        subsections: [
          {
            title: "Eigen woning",
            content: "Je eigen woning valt in box 1, niet in box 3. Hier geldt de hypotheekrenteaftrek."
          },
          {
            title: "Bedrijfsmiddelen",
            content: "Vermogen dat je gebruikt voor je onderneming valt niet in box 3, maar wordt belast via je winst uit onderneming."
          },
          {
            title: "Pensioenvermogen",
            content: "Pensioenvermogen (zoals lijfrenteverzekeringen) valt niet in box 3, maar wordt later belast bij uitkering."
          }
        ]
      },
      {
        title: "Optimalisatiemogelijkheden",
        content: "Er zijn verschillende manieren om box 3 te optimaliseren:",
        subsections: [
          {
            title: "Gebruik de heffingsvrije voet",
            content: "Zorg dat je optimaal gebruik maakt van de heffingsvrije voet van €57.000 per persoon."
          },
          {
            title: "Spreid vermogen",
            content: "Als je fiscaal partner hebt, kun je vermogen spreiden om optimaal gebruik te maken van beide heffingsvrije voeten."
          },
          {
            title: "Investeer in je eigen woning",
            content: "Vermogen in je eigen woning valt niet in box 3. Overweeg om extra af te lossen op je hypotheek."
          },
          {
            title: "Pensioenopbouw",
            content: "Vermogen in pensioenregelingen valt niet in box 3. Overweeg om extra pensioen op te bouwen."
          }
        ]
      },
      {
        title: "Praktische tips",
        important: true,
        content: "Voor box 3 planning:",
        subsections: [
          {
            title: "Houd je vermogen bij",
            content: "Houd goed bij wat je vermogen is per 1 januari. Dit is het peildatum voor box 3."
          },
          {
            title: "Bereken je belasting",
            content: "Bereken vooraf hoeveel box 3 belasting je moet betalen, zodat je hier rekening mee kunt houden."
          },
          {
            title: "Plan strategisch",
            content: "Plan grote uitgaven of investeringen strategisch om je box 3 vermogen te optimaliseren."
          },
          {
            title: "Laat je adviseren",
            content: "Box 3 kan complex zijn. Laat je adviseren door een belastingadviseur of financieel planner."
          }
        ]
      }
    ],
    importantNotes: [
      "De heffingsvrije voet is €57.000 per persoon in 2025.",
      "Box 3 belasting wordt berekend over je vermogen per 1 januari.",
      "De nieuwe box 3 regeling geldt vanaf 2025 en is een vereenvoudiging van de oude regeling."
    ]
  },
  {
    id: "eigenwoning",
    title: "Eigen Woning & Hypotheek 2025",
    shortDescription: "Hypotheekrenteaftrek, eigenwoningforfait en fiscale regelingen voor eigen woning",
    icon: Home,
    category: "Woning",
    color: "pink",
    relatedTopics: ["inkomstenbelasting", "box3"],
    sections: [
      {
        title: "Hypotheekrenteaftrek",
        important: true,
        content: "De hypotheekrenteaftrek is een belangrijke aftrekpost:",
        subsections: [
          {
            title: "Wat is aftrekbaar?",
            content: "Je kunt de betaalde hypotheekrente aftrekken van je inkomen in box 1. Dit geldt alleen voor rente, niet voor aflossing."
          },
          {
            title: "Voorwaarden nieuwe hypotheken",
            content: "Voor hypotheken afgesloten vanaf 2013 gelden strengere regels. Alleen de rente over een annuïteitenhypotheek of lineaire hypotheek is volledig aftrekbaar."
          },
          {
            title: "Afbouw",
            content: "De hypotheekrenteaftrek wordt geleidelijk afgebouwd. Het maximumpercentage daalt jaarlijks met 0,5% tot 37,05% in 2025."
          },
          {
            title: "Maximum",
            content: "De hypotheekrenteaftrek is beperkt tot een maximum van 30 jaar en een maximumbedrag van €1.000.000 aan schuld."
          }
        ]
      },
      {
        title: "Eigenwoningforfait",
        content: "Het eigenwoningforfait is een forfaitair bedrag dat je moet optellen bij je inkomen:",
        subsections: [
          {
            title: "Berekeningswijze",
            content: "Het eigenwoningforfait wordt berekend als een percentage van de WOZ-waarde van je woning. Voor 2025 bedraagt dit 0,35%."
          },
          {
            title: "WOZ-waarde",
            content: "De WOZ-waarde wordt jaarlijks vastgesteld door de gemeente. Je ontvangt hiervan een beschikking."
          },
          {
            title: "Maximum",
            content: "Het eigenwoningforfait is beperkt tot een maximum. Voor 2025 is dit ongeveer €1.200 per jaar."
          }
        ]
      },
      {
        title: "Onderhoudskosten",
        content: "Bepaalde onderhoudskosten zijn aftrekbaar:",
        subsections: [
          {
            title: "Groot onderhoud",
            content: "Groot onderhoud aan je eigen woning is niet aftrekbaar. Dit wordt gezien als privé-uitgave."
          },
          {
            title: "Klein onderhoud",
            content: "Klein onderhoud is ook niet aftrekbaar. Dit geldt voor alle onderhoud aan je eigen woning."
          },
          {
            title: "Verduurzaming",
            content: "Investeringen in verduurzaming (zoals zonnepanelen) zijn niet aftrekbaar, maar kunnen wel andere voordelen opleveren."
          }
        ]
      },
      {
        title: "Verhuurde kamer",
        content: "Als je een kamer verhuurt in je eigen woning:",
        subsections: [
          {
            title: "Vrijstelling",
            content: "Je kunt gebruik maken van de verhuurde kamer vrijstelling als je maximaal 2 kamers verhuurt en de huur niet te hoog is."
          },
          {
            title: "Belasting",
            content: "Als je niet gebruik kunt maken van de vrijstelling, moet je de huurinkomsten aangeven in box 1 of box 3."
          }
        ]
      },
      {
        title: "Tweede woning",
        content: "Een tweede woning valt in box 3:",
        subsections: [
          {
            title: "Box 3",
            content: "Een tweede woning (zoals een vakantiewoning) valt in box 3 en wordt belast over de waarde minus eventuele schuld."
          },
          {
            title: "Verhuur",
            content: "Als je een tweede woning verhuurt, moet je de huurinkomsten aangeven. De kosten zijn aftrekbaar."
          }
        ]
      },
      {
        title: "Praktische tips",
        important: true,
        content: "Voor fiscale optimalisatie van je woning:",
        subsections: [
          {
            title: "Optimaliseer je hypotheek",
            content: "Zorg dat je hypotheek voldoet aan de voorwaarden voor hypotheekrenteaftrek. Overweeg om over te sluiten als dit niet het geval is."
          },
          {
            title: "Controleer WOZ-waarde",
            content: "Controleer of de WOZ-waarde van je woning correct is. Als deze te hoog is, kun je bezwaar maken."
          },
          {
            title: "Plan verduurzaming",
            content: "Overweeg verduurzaming van je woning. Hoewel dit niet aftrekbaar is, kan het andere voordelen opleveren."
          },
          {
            title: "Laat je adviseren",
            content: "Hypotheek en woning kunnen complex zijn. Laat je adviseren door een hypotheekadviseur of belastingadviseur."
          }
        ]
      }
    ],
    importantNotes: [
      "De hypotheekrenteaftrek wordt geleidelijk afgebouwd en is beperkt tot 30 jaar.",
      "Voor nieuwe hypotheken vanaf 2013 gelden strengere regels voor aftrekbaarheid.",
      "Het eigenwoningforfait wordt berekend over de WOZ-waarde van je woning."
    ]
  },
  {
    id: "dividendbelasting",
    title: "Dividendbelasting 2025",
    shortDescription: "Dividendbelasting, verrekening en optimalisatie voor aandeelhouders",
    icon: Briefcase,
    category: "Ondernemers",
    color: "cyan",
    relatedTopics: ["vennootschapsbelasting"],
    sections: [
      {
        title: "Wat is dividendbelasting?",
        important: true,
        content: "Dividendbelasting is belasting over uitgekeerde winst:",
        subsections: [
          {
            title: "Tarief",
            content: "Het tarief voor dividendbelasting bedraagt 26,5% in 2025. Dit is een definitieve heffing."
          },
          {
            title: "Wie betaalt?",
            content: "Dividendbelasting wordt ingehouden door de vennootschap die het dividend uitkeert. Als aandeelhouder ontvang je het dividend na aftrek van belasting."
          },
          {
            title: "Definitieve heffing",
            content: "Dividendbelasting is een definitieve heffing. Dit betekent dat je hierover geen inkomstenbelasting meer hoeft te betalen."
          }
        ]
      },
      {
        title: "Verrekening",
        content: "Dividendbelasting kan worden verrekend:",
        subsections: [
          {
            title: "Met andere belastingen",
            content: "Dividendbelasting kan worden verrekend met andere belastingen die je moet betalen, zoals inkomstenbelasting."
          },
          {
            title: "Teruggaaf",
            content: "Als je meer dividendbelasting hebt betaald dan je verschuldigd bent, kun je dit terugkrijgen via je aangifte."
          },
          {
            title: "Buitenland",
            content: "Bij dividend uit het buitenland kan er sprake zijn van dubbele belasting. Dit kan worden verrekend via belastingverdragen."
          }
        ]
      },
      {
        title: "Optimalisatie",
        content: "Er zijn verschillende manieren om dividendbelasting te optimaliseren:",
        subsections: [
          {
            title: "Timing",
            content: "Je kunt de timing van dividenduitkeringen optimaliseren om het totale belastingtarief te minimaliseren."
          },
          {
            title: "Verhouding salaris/dividend",
            content: "Als DGA kun je de verhouding tussen salaris en dividend optimaliseren. Salaris is belast in box 1, dividend in box 2."
          },
          {
            title: "Fiscale reserves",
            content: "Door gebruik te maken van fiscale reserves kun je dividenduitkeringen uitstellen en belasting uitstellen."
          }
        ]
      },
      {
        title: "Box 2",
        content: "Dividend valt in box 2:",
        subsections: [
          {
            title: "Box 2 tarief",
            content: "Dividend wordt belast in box 2 tegen een tarief van 26,5%. Dit is gelijk aan het dividendbelastingtarief."
          },
          {
            title: "Verrekening",
            content: "De ingehouden dividendbelasting wordt verrekend met de box 2 belasting die je moet betalen."
          }
        ]
      },
      {
        title: "Praktische tips",
        important: true,
        content: "Voor dividendbelasting:",
        subsections: [
          {
            title: "Houd bij wat je ontvangt",
            content: "Houd goed bij hoeveel dividend je ontvangt en hoeveel dividendbelasting er is ingehouden."
          },
          {
            title: "Controleer je aangifte",
            content: "Controleer of de dividendbelasting correct is verrekend in je aangifte inkomstenbelasting."
          },
          {
            title: "Optimaliseer uitkeringen",
            content: "Plan dividenduitkeringen strategisch om het totale belastingtarief te minimaliseren."
          },
          {
            title: "Laat je adviseren",
            content: "Dividendbelasting kan complex zijn, vooral bij internationale situaties. Laat je adviseren door een belastingadviseur."
          }
        ]
      }
    ],
    importantNotes: [
      "Dividendbelasting is een definitieve heffing van 26,5%.",
      "Dividendbelasting kan worden verrekend met andere belastingen.",
      "Als DGA kun je de verhouding tussen salaris en dividend optimaliseren."
    ]
  }
]

export function getTaxTopicById(id: string): TaxTopic | undefined {
  return taxTopics2025.find(topic => topic.id === id)
}

export function getRelatedTopics(topicId: string): TaxTopic[] {
  const topic = getTaxTopicById(topicId)
  if (!topic || !topic.relatedTopics) return []
  
  return topic.relatedTopics
    .map(id => getTaxTopicById(id))
    .filter((t): t is TaxTopic => t !== undefined)
}

