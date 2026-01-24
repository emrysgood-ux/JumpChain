/**
 * Year 1 Maximum Stress Test
 *
 * This test pushes the planning system to its limits for Year 1 content generation.
 * It creates a comprehensive outline with:
 * - Detailed arcs and events
 * - Multiple subplots
 * - Character arcs
 * - Prophecies
 * - World state tracking
 * - JumpChain integration
 */

import {
  MillenniumPlanner,
  MillenniumPlan,
  Era,
  Arc,
  ArcType,
  ResolutionType,
  EventType,
  EraTonet,
  MillenniumThreadType,
  Prophecy,
  LongLivedCharacter,
  CrucibleMoment,
  WorldState,
} from '../../src/engines/millennium-planner';

describe('Year 1 Maximum Stress Test', () => {
  let planner: MillenniumPlanner;
  let plan: MillenniumPlan;
  let year1Era: Era;

  beforeAll(() => {
    planner = new MillenniumPlanner();

    // Create a 1000-year plan for Book 1
    // BOOK 1 STRUCTURE:
    // - Book 1 = ENTIRE 1000-year saga (all 12,008 chapters)
    // - Each chapter = 1 month (12 chapters per year)
    // - SINGLE UNIVERSE (Tenchi Muyo) - no JumpChain hopping in Book 1
    // - Sheldon has NO prophecy in Book 1
    plan = planner.createPlan({
      name: 'Son of Cosmos: The Complete Saga',
      description: `A 1000-year epic following Sheldon Carter's journey in the Tenchi Muyo universe.
      Book 1 takes place entirely in a SINGLE UNIVERSE - the Tenchi Muyo setting.
      Sheldon crash-lands on Earth near the Masaki Shrine and spends a millennium navigating alien
      politics, romance, found family, and the discovery that physics is far stranger than he ever
      theorized. Each chapter = 1 month. Total: 12,008 chapters covering 1000 years + 8 months.
      NOTE: Sheldon has NO prophecy attached to him in Book 1.`,
      totalYears: 1000,
      startYear: 0,
      isJumpChain: false, // Book 1 is SINGLE UNIVERSE - no JumpChain hopping
    });

    // Generate base era structure
    const eras = planner.generateEraStructure(plan.id, {
      minEraLength: 50,
      maxEraLength: 150,
      preferredCount: 12,
    });

    year1Era = eras[0];
  });

  describe('Year 1 Detailed Planning', () => {
    it('should create comprehensive Year 1 arcs', () => {
      // Arc 1: The Arrival (Months 1-3)
      const arrivalArc = planner.createArc(plan.id, year1Era.id, {
        name: 'The Arrival',
        description: `Sheldon Carter, theoretical physicist, dies in his original universe and
        awakens in a ROB's (Random Omnipotent Being) domain. After selecting the Tenchi Muyo
        universe as his first jump and purchasing perks/powers, he arrives via a spectacular
        crash-landing near the Masaki household. The first quarter of Year 1 establishes his
        integration into this new world while maintaining his characteristic personality.`,
        startYear: 0,
        endYear: 0.25,
        arcType: ArcType.DISCOVERY,
        centralConflict: 'Sheldon must accept that his scientific worldview was woefully incomplete while adapting to a universe where tree spaceships and demon goddesses are real',
        resolution: ResolutionType.TRANSFORMATION,
        keyEvents: [
          {
            id: 'arrival-crash',
            name: 'The Crash Landing',
            description: `Sheldon materializes 10,000 feet above the Masaki property in a ball of golden light.
            His arrival creates a minor crater in Tenchi's carrot field. Ryoko senses the energy signature and
            investigates, expecting a threat. Tenchi finds an unconscious man in pajamas clutching a notebook
            filled with equations. First words upon waking: "This is clearly a vivid hallucination induced by
            the Thai food Leonard insisted we try."`,
            year: 0,
            eventType: EventType.DISCOVERY,
            importance: 'pivotal',
            participants: ['Sheldon Carter', 'Tenchi Masaki', 'Ryoko'],
            consequences: [
              'Sheldon begins keeping a detailed scientific journal of "anomalous phenomena"',
              'Ryoko becomes curious about the stranger who survived a fall that should have killed him',
              'Tenchi feels obligated to help the confused visitor',
            ],
            foreshadows: ['sheldon-power-awakening', 'ryoko-respect'],
          },
          {
            id: 'first-contact-washu',
            name: 'Meeting the Greatest Scientific Mind',
            description: `Washu, detecting unusual dimensional residue on Sheldon, teleports him to her lab
            for "examination." What follows is a 72-hour debate about physics, the nature of reality, and
            whether string theory is "adorable but fundamentally misguided." Washu is simultaneously annoyed
            and fascinated by someone who can actually follow her explanations—even if he argues with every
            conclusion. She discovers traces of his JumpChain origin but keeps this secret.`,
            year: 0.02,
            eventType: EventType.MEETING,
            importance: 'pivotal',
            participants: ['Sheldon Carter', 'Washu Hakubi'],
            consequences: [
              'Washu becomes a mentor figure (whether Sheldon likes it or not)',
              'Sheldon gains access to advanced Juraian scientific databases',
              'A rivalry-friendship forms based on intellectual competition',
            ],
            foreshadowedBy: ['arrival-crash'],
            foreshadows: ['washu-collaboration'],
          },
          {
            id: 'ayeka-introduction',
            name: 'Royal Complications',
            description: `Princess Ayeka arrives at the Masaki household during one of her regular visits,
            only to find a strange man correcting Sasami's homework with "proper scientific notation."
            Sheldon's complete lack of deference to royalty both offends and intrigues Ayeka. When he
            casually dismisses the Juraian Empire's achievements as "impressive for a species that has
            yet to develop faster-than-light travel without biological components," a cold war begins.`,
            year: 0.05,
            eventType: EventType.MEETING,
            importance: 'major',
            participants: ['Sheldon Carter', 'Ayeka Jurai', 'Sasami Jurai'],
            consequences: [
              'Ayeka sees Sheldon as a challenge to her worldview',
              "Sasami becomes fond of Sheldon's teaching style",
              'Political implications begin as word of the "strange visitor" reaches Jurai',
            ],
          },
          {
            id: 'first-combat',
            name: 'The Misunderstanding',
            description: `A group of Galaxy Police officers, investigating reports of unusual dimensional
            activity, mistake Sheldon for a threat when they detect his JumpChain-enhanced energy signature.
            The confrontation forces Sheldon to instinctively use abilities he didn't know he had, creating
            a perfect geometric forcefield that Mihoshi accidentally crashes into. Kiyone's subsequent
            paperwork takes three weeks to complete.`,
            year: 0.08,
            eventType: EventType.BATTLE,
            importance: 'major',
            participants: ['Sheldon Carter', 'Mihoshi Kuramitsu', 'Kiyone Makibi'],
            consequences: [
              'Sheldon realizes his JumpChain powers are real and instinctual',
              'Galaxy Police opens a file on "Subject Carter"',
              'Kiyone becomes determined to understand who/what Sheldon really is',
            ],
            foreshadows: ['sheldon-power-awakening'],
          },
          {
            id: 'integration-complete',
            name: 'Finding His Place',
            description: `After three months of chaos, Sheldon has carved out a routine: morning debates
            with Washu, afternoon tutoring with Sasami, evening arguments with Ayeka, and late-night
            stargazing sessions with Tenchi (who he's decided is "the least objectionable option for a
            roommate despite his alarming popularity with dangerous women"). He's still convinced he'll
            wake up from this "elaborate coma dream" any day now.`,
            year: 0.25,
            eventType: EventType.ACHIEVEMENT,
            importance: 'significant',
            participants: ['Sheldon Carter', 'Masaki Household'],
            consequences: [
              'Sheldon is officially considered part of the extended household',
              'His denial about his situation begins to crack',
              'Routine established that will define the next several months',
            ],
          },
        ],
        majorCharacters: ['Sheldon Carter', 'Tenchi Masaki', 'Ryoko', 'Ayeka Jurai', 'Washu Hakubi', 'Sasami Jurai', 'Mihoshi Kuramitsu', 'Kiyone Makibi'],
        characterArcs: [
          {
            characterId: 'sheldon',
            arcType: 'growth',
            startState: 'Denial, arrogance, rigid worldview, emotionally guarded',
            endState: 'Beginning to accept new reality, first cracks in emotional armor',
            keyMoments: ['Crash landing', 'Washu debate', 'First power manifestation'],
            internalConflict: "His entire identity was built on being the smartest person in any room—what happens when that's no longer true?",
          },
          {
            characterId: 'ryoko',
            arcType: 'flat',
            startState: 'Bored, competitive with Ayeka, devoted to Tenchi',
            endState: "Intrigued by the newcomer's lack of fear toward her",
            keyMoments: ['Finding Sheldon in the crater', 'Realizing he genuinely doesn\'t find her intimidating'],
            internalConflict: 'Why does his indifference bother her more than fear would?',
          },
        ],
        subplots: [
          {
            id: 'subplot-sasami-student',
            name: 'The Unlikely Teacher',
            type: 'personal',
            description: "Sasami becomes Sheldon\'s first true student, approaching learning with enthusiasm that reminds him of his younger self",
            resolution: 'Sets up a long-term mentorship that will span decades',
          },
          {
            id: 'subplot-gp-investigation',
            name: 'The Galaxy Police Files',
            type: 'mystery',
            description: "Kiyone begins her investigation into Sheldon\'s true nature",
            resolution: 'Investigation ongoing—becomes a recurring subplot',
          },
        ],
        promises: [
          'Sheldon will eventually accept this reality',
          'His powers will continue to develop',
          'The Washu-Sheldon dynamic will produce breakthroughs',
        ],
        payoffs: [],
        targetWordCount: 150000,
      });

      expect(arrivalArc).toBeDefined();
      expect(arrivalArc.keyEvents.length).toBe(5);
      expect(arrivalArc.characterArcs.length).toBe(2);
      expect(arrivalArc.subplots.length).toBe(2);

      // Arc 2: The Tournament (Months 4-6)
      const tournamentArc = planner.createArc(plan.id, year1Era.id, {
        name: 'The Tournament of Lights',
        description: `Word of Sheldon's unusual abilities reaches the Juraian court. To assess this
        potential threat or asset, Emperor Azusa arranges for a "friendly exhibition" during the
        centennial Tournament of Lights—a competition showcasing the empire's finest. Sheldon is
        "invited" (conscripted) to participate, forcing him to quickly master abilities he barely
        understands while navigating deadly political intrigue.`,
        startYear: 0.25,
        endYear: 0.5,
        arcType: ArcType.ADVENTURE,
        centralConflict: 'Sheldon must survive a tournament designed to either kill him or prove his worth to the Juraian Empire',
        resolution: ResolutionType.PYRRHIC_VICTORY,
        keyEvents: [
          {
            id: 'imperial-summons',
            name: 'The Imperial Summons',
            description: `Lady Funaho arrives at the Masaki household with an "invitation" that cannot be
            refused. Sheldon's response—"I don't do tournaments, I don't do athletic competitions, and I
            certainly don't do anything that requires leaving my research to satisfy the ego of some
            bureaucratic monarchy"—earns him Funaho's respect but doesn't change the outcome. Washu
            decides to accompany him as his "second."`,
            year: 0.26,
            eventType: EventType.DECISION,
            importance: 'pivotal',
            participants: ['Sheldon Carter', 'Lady Funaho', 'Washu Hakubi'],
            consequences: [
              'Sheldon is thrust into Juraian politics',
              'Washu sees an opportunity to gather data on his abilities',
              "Ayeka is conflicted about her family\'s treatment of her household guest",
            ],
          },
          {
            id: 'training-montage',
            name: 'Crash Course in Combat',
            description: `With three weeks until the tournament, Washu subjects Sheldon to an intense
            training regimen. Using her lab's time dilation, they compress three months of training into
            three weeks external time. Sheldon's analytical mind proves surprisingly adept at combat when
            he treats it as "applied physics with hostile variables." He develops a fighting style based
            on predictive algorithms and energy geometry.`,
            year: 0.28,
            eventType: EventType.TRANSFORMATION,
            importance: 'major',
            participants: ['Sheldon Carter', 'Washu Hakubi'],
            consequences: [
              'Sheldon develops his signature "Geometric Combat" style',
              'His bond with Washu deepens through shared intensity',
              'He experiences subjective time dilation for the first time',
            ],
          },
          {
            id: 'first-round',
            name: 'Opening Ceremonies',
            description: `The tournament begins with a brutal first round: a free-for-all elimination
            among 128 competitors. Sheldon survives by creating a perfect sphere of interlocking
            forcefields and simply waiting while other competitors eliminate each other. His "cowardly
            but mathematically optimal" strategy infuriates traditionalists but advances him to round two.`,
            year: 0.35,
            eventType: EventType.BATTLE,
            importance: 'major',
            participants: ['Sheldon Carter', 'Various Juraian competitors'],
            consequences: [
              'Sheldon earns the mockery of Juraian warriors',
              'Washu is secretly proud of his pragmatism',
              'Emperor Azusa notes his "unusual tactical thinking"',
            ],
          },
          {
            id: 'semifinal-battle',
            name: 'The Honor Duel',
            description: `In the semifinals, Sheldon faces Prince Yosho's grandson, a talented warrior
            who sees the tournament as a chance to prove his worth. The young prince's genuine honor
            and skill force Sheldon to actually fight rather than avoid. Their battle showcases Sheldon's
            growth—he loses, but earns respect by nearly winning against a lifelong warrior. His defeat
            speech: "I demand a statistical recount."`,
            year: 0.4,
            eventType: EventType.BATTLE,
            importance: 'pivotal',
            participants: ['Sheldon Carter', 'Prince Kenshi Masaki-Jurai'],
            consequences: [
              'Sheldon experiences his first honorable defeat',
              'He gains Kenshi as a friend and sparring partner',
              'His fighting style earns grudging respect',
            ],
          },
          {
            id: 'conspiracy-revealed',
            name: 'The Assassination Plot',
            description: `During the finals, Sheldon—now watching from the stands—notices anomalies in
            the arena's energy patterns. His analysis reveals a plot to assassinate Emperor Azusa during
            the championship match. Racing against time, he must convince people who don't trust him of
            a threat they can't see. His warning comes just in time, but the assassins escape.`,
            year: 0.45,
            eventType: EventType.REVELATION,
            importance: 'pivotal',
            participants: ['Sheldon Carter', 'Emperor Azusa', 'Unknown Assassins'],
            consequences: [
              "Sheldon saves the Emperor\'s life",
              'A new enemy faction is revealed',
              'Azusa offers Sheldon a position at court (declined)',
              'Political debt is established that will pay off later',
            ],
          },
          {
            id: 'return-home',
            name: 'Coming Home Changed',
            description: `Sheldon returns to the Masaki household, outwardly complaining about the
            "barbaric customs" and "primitive combat obsession" of Juraian culture. But something has
            shifted. He's no longer dismissing this world as a delusion. For the first time, he asks
            Tenchi about his grandfather's past—genuinely curious rather than condescending.`,
            year: 0.5,
            eventType: EventType.RETURN,
            importance: 'significant',
            participants: ['Sheldon Carter', 'Tenchi Masaki', 'Masaki Household'],
            consequences: [
              'Sheldon begins truly integrating rather than waiting to wake up',
              'His relationship with the household deepens',
              'He starts keeping a journal "for scientific posterity"',
            ],
          },
        ],
        majorCharacters: ['Sheldon Carter', 'Washu Hakubi', 'Emperor Azusa', 'Lady Funaho', 'Prince Kenshi', 'Ayeka Jurai'],
        characterArcs: [
          {
            characterId: 'sheldon',
            arcType: 'growth',
            startState: 'Physically weak, dismissive of combat, emotionally closed',
            endState: 'Physically capable, respectful of warriors, beginning emotional growth',
            keyMoments: ['Training with Washu', 'Loss to Kenshi', 'Saving the Emperor'],
            internalConflict: 'Can his analytical mind adapt to a world where intellect alone isn\'t enough?',
          },
        ],
        subplots: [
          {
            id: 'subplot-washu-mentor',
            name: 'The Teacher and the Student',
            type: 'personal',
            description: "Washu's training of Sheldon forces both to confront their assumptions about intelligence and worth",
            resolution: 'A mentorship based on mutual respect emerges',
          },
          {
            id: 'subplot-political-intrigue',
            name: 'Shadows at Court',
            type: 'political',
            description: 'The assassination plot reveals deeper machinations within the Juraian Empire',
            resolution: 'Becomes a long-running political subplot',
          },
        ],
        promises: [
          'The assassins will return',
          "Sheldon\'s debt to the Emperor will be called upon",
          'Kenshi will become an important ally',
        ],
        payoffs: [
          "Sheldon\'s power awakening from Arc 1 pays off in combat",
          "Washu\'s interest in his abilities is justified by his growth",
        ],
        targetWordCount: 200000,
      });

      expect(tournamentArc).toBeDefined();
      expect(tournamentArc.keyEvents.length).toBe(6);

      // Arc 3: The Truth (Months 7-9)
      const truthArc = planner.createArc(plan.id, year1Era.id, {
        name: 'The Truth Between Worlds',
        description: `A dimensional rift threatens reality itself, and the only way to close it
        requires understanding its nature—which means Sheldon must finally confront the truth of
        how he came to be here. Washu, who has known all along, must decide whether to reveal what
        she knows. The arc explores identity, acceptance, and the nature of existence.`,
        startYear: 0.5,
        endYear: 0.75,
        arcType: ArcType.PERSONAL,
        centralConflict: 'Sheldon must accept the truth of his death and rebirth to save this reality',
        resolution: ResolutionType.REVELATION,
        keyEvents: [
          {
            id: 'rift-appears',
            name: 'The Wound in Reality',
            description: `A rift appears over Tokyo Bay, slowly expanding and causing reality to
            destabilize. Weather patterns shift, people report seeing alternate versions of
            themselves, and technology fails unpredictably. Washu determines the rift's dimensional
            signature matches the residue she found on Sheldon upon his arrival.`,
            year: 0.52,
            eventType: EventType.DISCOVERY,
            importance: 'pivotal',
            participants: ['Washu Hakubi', 'Sheldon Carter', 'Tenchi Masaki'],
            consequences: [
              'Earth faces an existential threat',
              'Washu must decide whether to reveal what she knows',
              "Sheldon\'s connection to the rift is undeniable",
            ],
          },
          {
            id: 'washu-revelation',
            name: "The Scientist\'s Confession",
            description: `Washu reveals to Sheldon what she deduced months ago: he died in another
            universe, was chosen by a ROB, and sent here through a process that created dimensional
            stress. The rift is a consequence of his arrival—a wound in reality that never healed.
            Sheldon's denial finally breaks as he processes his own death.`,
            year: 0.55,
            eventType: EventType.REVELATION,
            importance: 'pivotal',
            participants: ['Washu Hakubi', 'Sheldon Carter'],
            consequences: [
              'Sheldon must process his own death',
              'His identity crisis reaches a peak',
              'Washu becomes his anchor to sanity',
            ],
          },
          {
            id: 'identity-crisis',
            name: 'The Dark Night of the Soul',
            description: `Sheldon isolates himself, unable to process the revelation. Is he still
            Sheldon Carter if the original died? Are his memories his own or copies? Does anything
            he does matter if he's just a cosmic accident? Sasami, of all people, reaches him—with
            a simple meal and simpler wisdom: "You're the Sheldon who helped me with my homework.
            That's enough."`,
            year: 0.6,
            eventType: EventType.TRANSFORMATION,
            importance: 'pivotal',
            participants: ['Sheldon Carter', 'Sasami Jurai'],
            consequences: [
              'Sheldon begins accepting his new existence',
              'His bond with Sasami deepens profoundly',
              'He chooses to be this version of himself',
            ],
          },
          {
            id: 'rift-solution',
            name: 'The Equation of Existence',
            description: `Working with Washu, Sheldon develops a theory: the rift can be sealed if
            he accepts his existence in this universe—not just intellectually, but fundamentally.
            His denial was keeping the dimensional wound open. The solution requires him to
            establish a true anchor point: something that makes this reality his home.`,
            year: 0.68,
            eventType: EventType.DISCOVERY,
            importance: 'major',
            participants: ['Sheldon Carter', 'Washu Hakubi'],
            consequences: [
              'A solution exists but requires genuine emotional commitment',
              'Sheldon must identify what anchors him to this world',
              'The stakes become personal as well as universal',
            ],
          },
          {
            id: 'closing-the-rift',
            name: 'The Anchor',
            description: `At the rift's epicenter, Sheldon must project his acceptance through his
            powers. But intellectual acceptance isn't enough—the rift responds only to genuine
            emotion. In a breakthrough, he realizes his anchor: the family he's found here, the
            purpose he's discovered, the connections he's made despite his best efforts to remain
            detached. The rift closes as he truly chooses this life.`,
            year: 0.72,
            eventType: EventType.ACHIEVEMENT,
            importance: 'pivotal',
            participants: ['Sheldon Carter', 'Masaki Household', 'Washu Hakubi'],
            consequences: [
              'Reality is saved',
              'Sheldon has truly accepted his new existence',
              'His powers stabilize with his acceptance',
              'The household becomes official family',
            ],
          },
          {
            id: 'new-beginning',
            name: 'Home',
            description: `In the aftermath, Sheldon returns to his routine—but everything is different.
            He no longer speaks of "when I wake up" or "in my reality." He begins planning for the
            future: research projects with Washu, teaching curricula for Sasami, even a grudging
            acknowledgment that Tenchi's social skills might be worth studying. He writes in his
            journal: "Day 273. I appear to be home."`,
            year: 0.75,
            eventType: EventType.ACHIEVEMENT,
            importance: 'significant',
            participants: ['Sheldon Carter', 'Masaki Household'],
            consequences: [
              'Sheldon is truly integrated',
              'His character growth reaches a milestone',
              'Stage set for the final arc of Year 1',
            ],
          },
        ],
        majorCharacters: ['Sheldon Carter', 'Washu Hakubi', 'Sasami Jurai', 'Tenchi Masaki'],
        characterArcs: [
          {
            characterId: 'sheldon',
            arcType: 'growth',
            startState: 'In denial about his death and rebirth, emotionally guarded',
            endState: 'Fully accepting his new existence, emotionally opening',
            keyMoments: ["Washu\'s revelation", "Sasami\'s comfort", 'Choosing to stay'],
            internalConflict: 'What makes him "Sheldon Carter" if the original is dead?',
          },
          {
            characterId: 'washu',
            arcType: 'growth',
            startState: 'Detached observer, keeper of secrets',
            endState: "Emotional investment in Sheldon\'s wellbeing, taking responsibility",
            keyMoments: ['Deciding to reveal the truth', 'Helping him through the crisis'],
            internalConflict: 'Her scientific detachment versus her growing attachment',
          },
        ],
        subplots: [
          {
            id: 'subplot-sasami-wisdom',
            name: 'The Simple Truth',
            type: 'personal',
            description: "Sasami's childlike wisdom cuts through Sheldon's intellectual defense mechanisms",
            resolution: 'Establishes Sasami as emotionally important to Sheldon',
          },
          {
            id: 'subplot-reality-theory',
            name: 'The Nature of Existence',
            type: 'mystery',
            description: 'Sheldon and Washu develop new theories about dimensional travel and identity',
            resolution: 'Creates foundation for future JumpChain understanding',
          },
        ],
        promises: [
          'Sheldon will continue to grow emotionally',
          'His understanding of JumpChain will deepen',
          'The household bonds will strengthen',
        ],
        payoffs: [
          "Washu\'s early secrecy is explained",
          "Sheldon\'s denial arc reaches resolution",
          'The dimensional residue subplot is resolved',
        ],
        targetWordCount: 175000,
      });

      expect(truthArc).toBeDefined();
      expect(truthArc.keyEvents.length).toBe(6);

      // Arc 4: The First Threat (Months 10-12)
      const threatArc = planner.createArc(plan.id, year1Era.id, {
        name: 'The Shadow of Kagato',
        description: `A remnant of Kagato's influence, awakened by the dimensional rift, targets the
        Masaki household. For the first time, Sheldon must stand alongside his new family as a protector
        rather than a guest. The arc culminates in a confrontation that tests everything he's learned
        and establishes his role in the battles to come.`,
        startYear: 0.75,
        endYear: 1.0,
        arcType: ArcType.WAR,
        centralConflict: 'A fragment of Kagato seeks to possess or destroy Sheldon as a threat to its future resurrection',
        resolution: ResolutionType.VICTORY,
        keyEvents: [
          {
            id: 'shadow-awakens',
            name: "The Shadow\'s Stirring",
            description: `Ryoko begins experiencing nightmares—memories of her time under Kagato's
            control. But these aren't just dreams. A fragment of Kagato's consciousness, preserved
            in a hidden backup within Ryoko's gems, has been awakened by the dimensional disturbance.
            It"s weak but growing stronger, and it's noticed Sheldon"s unusual power signature.`,
            year: 0.77,
            eventType: EventType.DISCOVERY,
            importance: 'major',
            participants: ['Ryoko', 'Sheldon Carter', 'Washu Hakubi'],
            consequences: [
              "Ryoko\'s trauma resurfaces",
              'A new threat is identified',
              'Sheldon becomes a target',
            ],
          },
          {
            id: 'possession-attempt',
            name: 'The Attack',
            description: `The Kagato fragment attempts to possess Sheldon, seeing his JumpChain-granted
            abilities as the perfect vessel for resurrection. The attack comes during a quiet evening,
            turning the household into a battleground. Sheldon's mental defenses, honed by years of
            arrogance and reinforced by recent growth, prove surprisingly resistant—but not immune.`,
            year: 0.82,
            eventType: EventType.BATTLE,
            importance: 'pivotal',
            participants: ['Sheldon Carter', 'Kagato Fragment', 'Masaki Household'],
            consequences: [
              'Sheldon must fight on the mental plane',
              'The household rallies to defend him',
              'His vulnerabilities are exposed',
            ],
          },
          {
            id: 'ryoko-confession',
            name: "Ryoko\'s Guilt",
            description: `Ryoko, horrified that her gems housed the threat, offers to leave—believing
            her presence endangers everyone. Sheldon, of all people, stops her. "Your past actions
            under control are no more your fault than my original death was mine. The logical response
            is to eliminate the threat, not the victim." It's the most emotionally intelligent thing
            he's ever said, and it surprises everyone—including himself.`,
            year: 0.85,
            eventType: EventType.REVELATION,
            importance: 'major',
            participants: ['Sheldon Carter', 'Ryoko'],
            consequences: [
              'Sheldon and Ryoko develop mutual respect',
              'His emotional growth is demonstrated',
              'Ryoko stays and fights',
            ],
          },
          {
            id: 'final-preparation',
            name: 'The War Council',
            description: `The household, plus allies from the tournament arc (including Kenshi and
            Galaxy Police support from Kiyone), plan their assault on the Kagato fragment. Sheldon
            provides tactical analysis; Washu develops containment technology; Tenchi will deliver
            the killing blow with the Light Hawk Wings. Everyone has a role. For the first time,
            Sheldon is part of a team without being the leader—and he's okay with it.`,
            year: 0.88,
            eventType: EventType.ALLIANCE,
            importance: 'significant',
            participants: ['Full Cast'],
            consequences: [
              'Allies from earlier arcs return',
              'Sheldon learns to work within a team',
              'Battle plans are established',
            ],
          },
          {
            id: 'final-battle',
            name: 'The Battle for Tomorrow',
            description: `The confrontation occurs in subspace, where the Kagato fragment has gathered
            enough power to manifest. The battle is fierce—Ryoko faces her tormentor's ghost, Tenchi
            wields the Light Hawk Wings, and Sheldon provides crucial support through geometric barriers
            and energy redirection. The fragment is destroyed when Sheldon, in a moment of inspiration,
            uses his dimensional instability (a remnant of his arrival) to unmake the fragment's
            unstable existence.`,
            year: 0.95,
            eventType: EventType.BATTLE,
            importance: 'pivotal',
            participants: ['Full Cast', 'Kagato Fragment'],
            consequences: [
              'The Kagato threat is ended (for now)',
              'Ryoko finds closure',
              'Sheldon proves himself as a combatant and ally',
              'The household is stronger than ever',
            ],
          },
          {
            id: 'year-one-end',
            name: 'One Year Later',
            description: `The year ends with a celebration at the Masaki household. Sheldon presents
            Sasami with a completed scientific curriculum. He gives Washu a theoretical paper that
            earns her genuine praise. He even manages to compliment Tenchi's cooking without qualifiers.
            In his journal: "Day 365. One year since arrival. Initial hypothesis (coma/hallucination)
            definitively disproven. Current hypothesis: This is my life now. Confidence level:
            unexpectedly acceptable."`,
            year: 1.0,
            eventType: EventType.ACHIEVEMENT,
            importance: 'pivotal',
            participants: ['Full Cast'],
            consequences: [
              'Year 1 concludes on a high note',
              'All character arcs reach satisfying intermediate points',
              'Stage is set for Year 2 and beyond',
            ],
          },
        ],
        majorCharacters: ['Sheldon Carter', 'Ryoko', 'Tenchi Masaki', 'Washu Hakubi', 'Full Household'],
        characterArcs: [
          {
            characterId: 'sheldon',
            arcType: 'growth',
            startState: 'Accepted member of household, still somewhat isolated',
            endState: 'Full family member, team player, emotionally connected',
            keyMoments: ['Defending Ryoko', 'Working as part of team', 'Final celebration'],
            internalConflict: 'Can he truly be part of a family again?',
          },
          {
            characterId: 'ryoko',
            arcType: 'growth',
            startState: 'Haunted by past, guilty about threat she carries',
            endState: 'Finding closure, accepting support, respecting Sheldon',
            keyMoments: ['Nightmares return', "Sheldon\'s defense", 'Final battle'],
            internalConflict: "Can she escape Kagato\'s shadow?",
          },
        ],
        subplots: [
          {
            id: 'subplot-team-dynamics',
            name: 'Finding His Place in Battle',
            type: 'personal',
            description: 'Sheldon must learn to fight alongside others rather than leading or going alone',
            resolution: 'Discovers strength in teamwork',
          },
          {
            id: 'subplot-allies-return',
            name: 'The Network',
            type: 'political',
            description: 'Allies from the tournament arc return, establishing a network of support',
            resolution: 'Sheldon has built connections beyond the household',
          },
        ],
        promises: [
          "Kagato\'s complete resurrection may still be attempted",
          "Sheldon\'s role in future battles is established",
          'The household bonds will be tested further',
        ],
        payoffs: [
          'Tournament allies return',
          "Sheldon\'s dimensional instability becomes useful",
          'All character relationships reach new levels',
        ],
        targetWordCount: 200000,
      });

      expect(threatArc).toBeDefined();
      expect(threatArc.keyEvents.length).toBe(6);

      // Verify Year 1 has all four arcs
      const year1Arcs = plan.eras[0].arcs;
      expect(year1Arcs.length).toBe(4);

      // Calculate total word count for Year 1
      const totalYear1Words = year1Arcs.reduce((sum, arc) => sum + arc.targetWordCount, 0);
      expect(totalYear1Words).toBe(725000); // 150k + 200k + 175k + 200k

      console.log('\n=== YEAR 1 ARC SUMMARY ===');
      console.log(`Total Arcs: ${year1Arcs.length}`);
      console.log(`Total Key Events: ${year1Arcs.reduce((sum, arc) => sum + arc.keyEvents.length, 0)}`);
      console.log(`Total Character Arcs: ${year1Arcs.reduce((sum, arc) => sum + arc.characterArcs.length, 0)}`);
      console.log(`Total Subplots: ${year1Arcs.reduce((sum, arc) => sum + arc.subplots.length, 0)}`);
      console.log(`Total Target Word Count: ${totalYear1Words.toLocaleString()} words`);
    });

    it('should have NO prophecies in Book 1 (Year 1)', () => {
      // IMPORTANT: Book 1 takes place in a single universe (Tenchi Muyo)
      // and Sheldon has NO prophecy attached to his name in Book 1.
      //
      // BOOK 1 STRUCTURE:
      // - Book 1 = ENTIRE 1000-year saga (all 12,008 chapters)
      // - Each chapter = 1 month (12 chapters per year)
      // - Single universe (Tenchi Muyo) - no JumpChain hopping
      // - Sheldon has NO prophecy in Book 1 (not planning to add any)

      expect(plan.prophecies.length).toBe(0);

      console.log('\n=== BOOK 1 PROPHECY VERIFICATION ===');
      console.log('Prophecies in Book 1: 0 (correct - no prophecies for Sheldon in Book 1)');
      console.log('Book 1 structure:');
      console.log('  - ENTIRE 1000-year saga = all 12,008 chapters');
      console.log('  - Each chapter = 1 month (12 chapters/year)');
      console.log('  - Single universe: Tenchi Muyo');
      console.log('  - NO JumpChain universe hopping in Book 1');
    });

    it('should add millennium threads seeded in Year 1', () => {
      // Thread 1: The Sheldon Legacy
      const legacyThread = planner.addMillenniumThread(plan.id, {
        name: 'The Carter Methodology',
        description: `Sheldon's unique approach to science—combining multiple universe physics,
        JumpChain abilities, and alien technology—creates a new paradigm of understanding.
        This thread tracks how his methodology spreads, evolves, and influences civilizations
        across the millennium.`,
        threadType: MillenniumThreadType.LEGACY,
        startYear: 0,
        endYear: 1000,
        touchedEraIds: plan.eras.map(e => e.id),
        manifestations: plan.eras.map((era, idx) => ({
          eraId: era.id,
          description: idx === 0
            ? 'Initial development of methodology through Washu collaboration'
            : `Phase ${idx + 1} of methodology evolution`,
          intensity: Math.min(10, idx + 3),
        })),
        resolution: 'The Carter Methodology becomes foundational to understanding multiversal physics',
        keyMoments: [
          { year: 0.02, event: 'First debate with Washu plants the seeds', significance: 'Origin point' },
          { year: 0.55, event: 'Revelation of JumpChain nature adds new dimensions', significance: 'Methodology expands to include dimensional theory' },
          { year: 0.72, event: 'Closing the rift provides first practical application', significance: 'Theory becomes practice' },
        ],
      });

      // Thread 2: The Family Thread
      const familyThread = planner.addMillenniumThread(plan.id, {
        name: 'Found Family',
        description: `Sheldon, who spent his original life struggling with human connection,
        builds an ever-expanding family across his jumps. This thread tracks how his capacity
        for love grows, the people he brings into his life, and how family becomes his anchor
        across realities.`,
        threadType: MillenniumThreadType.LEGACY,
        startYear: 0,
        endYear: 1000,
        touchedEraIds: plan.eras.map(e => e.id),
        manifestations: plan.eras.map((era, idx) => ({
          eraId: era.id,
          description: idx === 0
            ? 'Reluctant adoption by Masaki household'
            : `Family expansion phase ${idx + 1}`,
          intensity: Math.min(10, idx + 4),
        })),
        resolution: 'Sheldon has built a family spanning universes and millennia',
        keyMoments: [
          { year: 0, event: 'Crash landing at Masaki household', significance: 'First found family begins' },
          { year: 0.6, event: 'Sasami reaches through his defenses', significance: 'Emotional walls begin falling' },
          { year: 1.0, event: 'Year 1 celebration', significance: 'Official family status' },
        ],
      });

      // Thread 3: The Kagato Shadow
      const shadowThread = planner.addMillenniumThread(plan.id, {
        name: 'The Shadow Legacy',
        description: `Kagato's defeat in the original timeline did not end his influence.
        Fragments of his consciousness, backup copies, and followers continue to threaten
        the multiverse. This thread tracks the ongoing conflict with Kagato's legacy.`,
        threadType: MillenniumThreadType.CONFLICT,
        startYear: 0.77,
        endYear: 500,
        touchedEraIds: plan.eras.slice(0, 6).map(e => e.id),
        manifestations: plan.eras.slice(0, 6).map((era, idx) => ({
          eraId: era.id,
          description: idx === 0
            ? 'Discovery of Kagato fragment, initial confrontation'
            : `Kagato legacy conflict phase ${idx + 1}`,
          intensity: Math.max(1, 7 - idx),
        })),
        resolution: 'Final elimination of all Kagato remnants',
        keyMoments: [
          { year: 0.77, event: 'Fragment discovered', significance: 'Thread begins' },
          { year: 0.95, event: 'Fragment destroyed', significance: 'First victory' },
        ],
      });

      expect(plan.millenniumThreads.length).toBe(3);

      console.log('\n=== MILLENNIUM THREADS ===');
      plan.millenniumThreads.forEach(thread => {
        console.log(`- ${thread.name}: ${thread.threadType} (Years ${thread.startYear}-${thread.endYear})`);
        console.log(`  Key moments: ${thread.keyMoments.length}`);
      });
    });

    it('should add crucible moments', () => {
      // Crucible 1: The Crash
      planner.addCrucibleMoment(plan.id, {
        name: 'The Arrival',
        description: "Sheldon\'s crash landing in the Tenchi universe marks the beginning of everything",
        year: 0,
        eraId: year1Era.id,
        significance: 'The moment that changes multiple timelines and sets the 1000-year saga in motion',
        worldBefore: {
          year: -1,
          political: { majorPowers: ['Jurai Empire', 'Galaxy Police'], conflicts: ['Minor piracy'], alliances: ['Jurai-GP Treaty'] },
          supernatural: { magicLevel: 'moderate', activeThreats: ['Remnant pirates'], protections: ['Juraian tree-ships'] },
        } as WorldState,
        worldAfter: {
          year: 0,
          political: { majorPowers: ['Jurai Empire', 'Galaxy Police'], conflicts: ['Minor piracy', 'Investigation of Carter'], alliances: ['Jurai-GP Treaty'] },
          supernatural: { magicLevel: 'moderate', activeThreats: ['Remnant pirates', 'Dimensional instability'], protections: ['Juraian tree-ships', 'Washu monitoring'] },
        } as WorldState,
        participants: ['Sheldon Carter', 'ROB', 'Tenchi Masaki'],
        consequences: [
          { description: 'Dimensional instability in the region', manifestsIn: 0.52, severity: 'major' },
          { description: 'Galaxy Police investigation', manifestsIn: 0.08, severity: 'significant' },
          { description: 'Juraian court interest', manifestsIn: 0.26, severity: 'major' },
        ],
      });

      // Crucible 2: The Rift Closure
      planner.addCrucibleMoment(plan.id, {
        name: 'Acceptance',
        description: 'Sheldon chooses to accept his new existence, closing the dimensional rift',
        year: 0.72,
        eraId: year1Era.id,
        significance: 'The moment Sheldon truly becomes a citizen of this reality',
        worldBefore: {
          year: 0.71,
          political: { majorPowers: ['Jurai Empire'], conflicts: ['Dimensional crisis'], alliances: ['Emergency coalition'] },
          supernatural: { magicLevel: 'high', activeThreats: ['Dimensional rift', 'Reality destabilization'], protections: ['Masaki household barrier'] },
        } as WorldState,
        worldAfter: {
          year: 0.73,
          political: { majorPowers: ['Jurai Empire'], conflicts: ['None major'], alliances: ['Strengthened Masaki-Jurai relations'] },
          supernatural: { magicLevel: 'moderate', activeThreats: ['Reduced'], protections: ['Stable dimensional anchor (Sheldon)'] },
        } as WorldState,
        participants: ['Sheldon Carter', 'Washu Hakubi', 'Masaki Household'],
        consequences: [
          { description: 'Sheldon becomes a dimensional anchor', manifestsIn: 0, severity: 'major' },
          { description: 'Political debt to Masaki household', manifestsIn: 5, severity: 'significant' },
          { description: 'Washu gains unprecedented dimensional data', manifestsIn: 1, severity: 'significant' },
        ],
      });

      expect(plan.crucibleMoments.length).toBe(2);

      console.log('\n=== CRUCIBLE MOMENTS ===');
      plan.crucibleMoments.forEach(moment => {
        console.log(`- Year ${moment.year}: ${moment.name}`);
        console.log(`  Consequences: ${moment.consequences.length}`);
      });
    });

    it('should add long-lived characters', () => {
      // Sheldon himself
      planner.addLongLivedCharacter(plan.id, {
        name: 'Sheldon Carter',
        longevitySource: 'slow_aging',
        activeRanges: [{ startYear: 0, endYear: 1000, status: 'protagonist' }],
        characterEvolution: [
          { year: 0, state: 'Denial, arrogance, emotional guardedness', keyChange: 'Arrival in new universe' },
          { year: 0.72, state: 'Acceptance, beginning emotional growth', keyChange: 'Chose to accept new existence' },
          { year: 1, state: 'Integrated family member, growing wisdom', keyChange: 'Completed first year growth arc' },
        ],
        eraRoles: plan.eras.map((era, idx) => ({
          eraId: era.id,
          role: 'protagonist' as const,
          description: idx === 0
            ? 'Arrival, integration, and first major battles'
            : `Continuing evolution in Era ${idx + 1}`,
        })),
        longTermRelationships: [
          {
            otherCharacterId: 'washu',
            relationshipType: 'mentor/rival',
            evolution: [
              { year: 0.02, status: 'Intellectual rivalry established' },
              { year: 0.5, status: 'Deepening respect through tournament' },
              { year: 0.72, status: 'True partnership in crisis' },
            ],
          },
          {
            otherCharacterId: 'sasami',
            relationshipType: 'teacher/family',
            evolution: [
              { year: 0.05, status: 'Reluctant tutor' },
              { year: 0.6, status: 'Deep emotional bond formed' },
              { year: 1.0, status: 'Cherished family member' },
            ],
          },
        ],
      });

      // Washu
      planner.addLongLivedCharacter(plan.id, {
        name: 'Washu Hakubi',
        longevitySource: 'immortal',
        activeRanges: [{ startYear: 0, endYear: 1000, status: 'major supporting' }],
        characterEvolution: [
          { year: 0, state: 'Curious observer, detached scientist', keyChange: 'Discovery of Sheldon' },
          { year: 0.55, state: 'Invested mentor, breaking own rules', keyChange: 'Revealed truth to Sheldon' },
          { year: 1, state: 'Committed partner in cosmic science', keyChange: 'Year of collaboration' },
        ],
        eraRoles: plan.eras.map((era, idx) => ({
          eraId: era.id,
          role: idx < 3 ? 'mentor' as const : 'background' as const,
          description: idx === 0
            ? 'Primary mentor and scientific collaborator'
            : `Supporting role in Era ${idx + 1}`,
        })),
        longTermRelationships: [
          {
            otherCharacterId: 'sheldon',
            relationshipType: 'student/rival/friend',
            evolution: [
              { year: 0.02, status: 'Fascinating specimen discovered' },
              { year: 0.5, status: 'Genuine respect developing' },
              { year: 1.0, status: 'True scientific partnership' },
            ],
          },
        ],
      });

      expect(plan.longLivedCharacters.length).toBe(2);

      console.log('\n=== LONG-LIVED CHARACTERS ===');
      plan.longLivedCharacters.forEach(char => {
        console.log(`- ${char.name}: ${char.longevitySource}`);
        console.log(`  Evolution points: ${char.characterEvolution.length}`);
        console.log(`  Relationships: ${char.longTermRelationships.length}`);
      });
    });

    it('should set comprehensive theme evolution', () => {
      planner.setThemeEvolution(plan.id, {
        centralTheme: 'The nature of identity and belonging across infinite possibilities',
        eraManifestations: plan.eras.map((era, idx) => ({
          eraId: era.id,
          themeExpression: idx === 0
            ? 'What makes us who we are when everything else changes?'
            : `Theme evolution phase ${idx + 1}`,
          dominantSubtheme: idx === 0
            ? 'Acceptance vs. denial'
            : `Subtheme ${idx + 1}`,
        })),
        thematicQuestions: [
          {
            question: 'If you die and are reborn with all your memories, are you still "you"?',
            exploredInEras: [plan.eras[0].id],
            resolution: 'Identity is choice, not continuity',
          },
          {
            question: 'Can someone fundamentally change who they are?',
            exploredInEras: plan.eras.slice(0, 3).map(e => e.id),
            resolution: 'Yes, through genuine connection and acceptance',
          },
          {
            question: 'What is the value of intelligence without wisdom?',
            exploredInEras: plan.eras.map(e => e.id),
          },
          {
            question: 'Can found family be as meaningful as blood?',
            exploredInEras: plan.eras.map(e => e.id),
            resolution: 'More so, because it is chosen',
          },
        ],
        counterThemes: [
          'Isolation as protection (rejected)',
          'Intelligence as superiority (challenged)',
          'Self-sufficiency as strength (evolved)',
        ],
        recurringSymbols: [
          {
            symbol: 'The equation',
            firstAppearance: 0,
            meaningEvolution: [
              { year: 0, meaning: 'Order, control, certainty' },
              { year: 0.55, meaning: 'Incomplete understanding' },
              { year: 0.72, meaning: 'Framework for connection, not barrier' },
            ],
          },
          {
            symbol: 'The crash landing',
            firstAppearance: 0,
            meaningEvolution: [
              { year: 0, meaning: 'Loss of control, trauma' },
              { year: 0.72, meaning: 'Necessary destruction for rebirth' },
              { year: 1.0, meaning: 'Cherished beginning' },
            ],
          },
        ],
      });

      expect(plan.themeEvolution.centralTheme).toBeDefined();
      expect(plan.themeEvolution.thematicQuestions.length).toBe(4);

      console.log('\n=== THEME EVOLUTION ===');
      console.log(`Central Theme: ${plan.themeEvolution.centralTheme}`);
      console.log(`Thematic Questions: ${plan.themeEvolution.thematicQuestions.length}`);
      console.log(`Recurring Symbols: ${plan.themeEvolution.recurringSymbols.length}`);
    });

    it('should configure JumpChain plan for Year 1', () => {
      planner.updateJumpPlan(plan.id, {
        totalJumps: 15,
        jumps: [
          {
            jumpNumber: 1,
            universe: 'Tenchi Muyo',
            yearsSpent: 10,
            startYear: 0,
            primaryGoals: [
              'Survive and adapt',
              'Master energy manipulation',
              'Build first found family',
              'Establish scientific methodology',
            ],
            powersGained: [
              'Geometric forcefield generation',
              'Energy signature detection',
              'Minor spatial manipulation',
              'Enhanced mental resistance',
            ],
            companionsRecruited: ['Potential: Sasami as student/family'],
            majorEvents: [
              'Crash landing and integration',
              'Tournament of Lights',
              'Dimensional rift crisis',
              'Kagato fragment battle',
            ],
          },
          // Placeholder for future jumps
          ...Array.from({ length: 14 }, (_, i) => ({
            jumpNumber: i + 2,
            universe: `Universe ${i + 2} [TBD]`,
            yearsSpent: 0,
            startYear: 10 + (i * 70),
            primaryGoals: [],
            powersGained: [],
            companionsRecruited: [],
            majorEvents: [],
          })),
        ],
        powerProgression: [
          {
            jumpNumber: 1,
            powerLevel: {
              tier: 'superhuman' as const,
              numericScale: 25,
              availablePowerTypes: ['energy', 'spatial', 'mental'],
              appropriateThreats: ['pirates', 'bounty hunters', 'minor cosmic entities'],
            },
          },
        ],
        chainGoals: [
          'Understand the nature of the multiverse',
          'Build a family that spans realities',
          'Develop science that unifies all physics',
          'Achieve cosmic relevance while maintaining humanity',
        ],
        endgamePlan: {
          targetJump: 15,
          method: 'Spark achieved through comprehensive understanding of reality',
          requirements: [
            'Visit at least 15 universes',
            'Develop unified field theory incorporating all observed physics',
            'Form lasting bonds in each reality',
            'Defeat a multiversal threat',
          ],
        },
      });

      expect(plan.jumpPlan).toBeDefined();
      expect(plan.jumpPlan!.jumps[0].majorEvents.length).toBe(4);

      console.log('\n=== JUMPCHAIN CONFIGURATION ===');
      console.log(`Total Planned Jumps: ${plan.jumpPlan!.totalJumps}`);
      console.log(`First Jump: ${plan.jumpPlan!.jumps[0].universe}`);
      console.log(`Chain Goals: ${plan.jumpPlan!.chainGoals.length}`);
    });

    it('should add world state snapshots', () => {
      // Initial state
      planner.addWorldStateSnapshot(plan.id, {
        year: 0,
        eraId: year1Era.id,
        state: {
          year: 0,
          political: {
            majorPowers: ['Jurai Empire', 'Galaxy Police Federation'],
            conflicts: ['Minor piracy', 'Border disputes'],
            alliances: ['Jurai-GP Treaty', 'Earth Protection Accord'],
          },
          technological: {
            level: 'Spacefaring civilization with bio-organic technology',
            keyAdvances: ['Juraian tree-ships', 'Dimensional travel'],
            lostKnowledge: ['Ancient Juraian combat arts'],
          },
          social: {
            populationTrend: 'stable',
            majorMovements: ['Galactic integration'],
            culturalTone: 'Peaceful expansion',
          },
          environmental: {
            stability: 'stable',
            majorChanges: [],
          },
          supernatural: {
            magicLevel: 'moderate',
            activeThreats: ['Remnant criminal organizations'],
            protections: ['Juraian royal family', 'Galaxy Police'],
          },
        },
      });

      // Mid-Year state
      planner.addWorldStateSnapshot(plan.id, {
        year: 0.5,
        eraId: year1Era.id,
        state: {
          year: 0.5,
          political: {
            majorPowers: ['Jurai Empire', 'Galaxy Police Federation'],
            conflicts: ['Investigation of Carter', 'Assassination plot fallout'],
            alliances: ['Jurai-GP Treaty', 'Earth Protection Accord', 'Masaki-Imperial connection'],
          },
          technological: {
            level: 'Spacefaring civilization with emerging dimensional understanding',
            keyAdvances: ['Juraian tree-ships', 'Dimensional travel', 'Carter Methodology foundations'],
          },
          social: {
            populationTrend: 'stable',
            majorMovements: ['Galactic integration', 'Interest in dimensional theory'],
            culturalTone: 'Cautious curiosity',
          },
          environmental: {
            stability: 'stressed',
            majorChanges: ['Dimensional instability detected'],
          },
          supernatural: {
            magicLevel: 'moderate',
            activeThreats: ['Dimensional rift forming', 'Unknown assassin faction'],
            protections: ['Juraian royal family', 'Galaxy Police', 'Washu monitoring'],
          },
        },
      });

      // End of Year 1
      planner.addWorldStateSnapshot(plan.id, {
        year: 1.0,
        eraId: year1Era.id,
        state: {
          year: 1.0,
          political: {
            majorPowers: ['Jurai Empire', 'Galaxy Police Federation'],
            conflicts: ['None major'],
            alliances: ['Jurai-GP Treaty', 'Earth Protection Accord', 'Masaki-Imperial connection', 'Carter-Jurai recognition'],
          },
          technological: {
            level: 'Spacefaring civilization with advancing dimensional understanding',
            keyAdvances: ['Juraian tree-ships', 'Dimensional travel', 'Dimensional anchor technology', 'Carter Methodology v1.0'],
          },
          social: {
            populationTrend: 'growing',
            majorMovements: ['Galactic integration', 'Dimensional studies expansion'],
            culturalTone: 'Hopeful after crisis',
          },
          environmental: {
            stability: 'stable',
            majorChanges: ['Dimensional stability restored'],
          },
          supernatural: {
            magicLevel: 'moderate',
            activeThreats: ['Kagato legacy remnants (reduced)'],
            protections: ['Juraian royal family', 'Galaxy Police', 'Masaki household', 'Sheldon as dimensional anchor'],
          },
        },
      });

      expect(plan.worldStateProgression.length).toBe(3);

      console.log('\n=== WORLD STATE PROGRESSION ===');
      plan.worldStateProgression.forEach(snap => {
        console.log(`- Year ${snap.year}: ${snap.changesSinceLastSnapshot.join(', ')}`);
      });
    });
  });

  describe('Validation and Roadmap Generation', () => {
    it('should validate the complete Year 1 plan', () => {
      const validation = planner.validatePlan(plan.id);

      console.log('\n=== PLAN VALIDATION ===');
      console.log(`Valid: ${validation.valid}`);
      console.log(`Years Planned: ${validation.coverage.yearsPlanned}`);
      console.log(`Eras Defined: ${validation.coverage.erasDefined}`);
      console.log(`Arcs Planned: ${validation.coverage.arcsPlanned}`);
      console.log(`Crucible Moments: ${validation.coverage.crucibleMoments}`);
      console.log(`Prophecies: ${validation.coverage.prophecies}`);
      console.log(`Threads: ${validation.coverage.threads}`);

      if (validation.issues.length > 0) {
        console.log('\nIssues:');
        validation.issues.forEach(issue => {
          console.log(`  - [${issue.severity}] ${issue.description}`);
        });
      }

      if (validation.warnings.length > 0) {
        console.log('\nWarnings:');
        validation.warnings.forEach(warning => {
          console.log(`  - ${warning}`);
        });
      }

      expect(validation.coverage.arcsPlanned).toBe(4);
      expect(validation.coverage.prophecies).toBe(0); // Book 1 has NO prophecies for Sheldon
      expect(validation.coverage.threads).toBe(3);
    });

    it('should generate a comprehensive roadmap', () => {
      const roadmap = planner.generateRoadmap(plan.id);

      console.log('\n=== GENERATION ROADMAP ===');
      console.log(`Total Segments: ${roadmap.totalSegments}`);
      console.log(`Total Estimated Words: ${roadmap.totalEstimatedWords.toLocaleString()}`);
      console.log(`Estimated Duration: ${roadmap.estimatedDuration}`);

      // Show Year 1 segments
      const year1Segments = roadmap.segments.filter(s => s.year < 1);
      console.log(`\nYear 1 Segments: ${year1Segments.length}`);

      // Group by priority
      const crucial = year1Segments.filter(s => s.type === 'crucial');
      const major = year1Segments.filter(s => s.type === 'major');
      const standard = year1Segments.filter(s => s.type === 'standard');

      console.log(`  Crucial: ${crucial.length}`);
      console.log(`  Major: ${major.length}`);
      console.log(`  Standard: ${standard.length}`);

      // Calculate Year 1 words
      const year1Words = year1Segments.reduce((sum, s) => sum + s.estimatedWords, 0);
      console.log(`\nYear 1 Estimated Words: ${year1Words.toLocaleString()}`);

      expect(year1Segments.length).toBeGreaterThan(0);
      expect(year1Words).toBeGreaterThan(500000);
    });

    it('should provide consistency requirements for key Year 1 moments', () => {
      const moments = [0, 0.25, 0.5, 0.75, 1.0];

      console.log('\n=== CONSISTENCY REQUIREMENTS ===');

      moments.forEach(year => {
        const requirements = planner.getSegmentConsistencyRequirements(plan.id, year);

        console.log(`\nYear ${year}:`);
        console.log(`  Era: ${requirements.eraContext?.name || 'N/A'}`);
        console.log(`  Tone: ${requirements.eraContext?.tone || 'N/A'}`);
        console.log(`  Power Level: ${requirements.eraContext?.powerLevel?.tier || 'N/A'}`);
        console.log(`  Active Threads: ${requirements.activeMillenniumThreads.length}`);
        console.log(`  Active Prophecies: ${requirements.activeProphecies.length}`);
        console.log(`  Long-Lived Characters: ${requirements.activeLongLivedCharacters.length}`);
        console.log(`  Active Consequences: ${requirements.activeConsequences.length}`);
      });

      const midYearReq = planner.getSegmentConsistencyRequirements(plan.id, 0.5);
      expect(midYearReq.activeMillenniumThreads.length).toBeGreaterThan(0);
    });

    it('should output complete Year 1 statistics', () => {
      const year1Era = plan.eras[0];
      const arcs = year1Era.arcs;

      // Comprehensive statistics
      const stats = {
        // Arc statistics
        totalArcs: arcs.length,
        totalKeyEvents: arcs.reduce((sum, arc) => sum + arc.keyEvents.length, 0),
        totalCharacterArcs: arcs.reduce((sum, arc) => sum + arc.characterArcs.length, 0),
        totalSubplots: arcs.reduce((sum, arc) => sum + arc.subplots.length, 0),
        totalPromises: arcs.reduce((sum, arc) => sum + arc.promises.length, 0),
        totalPayoffs: arcs.reduce((sum, arc) => sum + arc.payoffs.length, 0),

        // Word counts
        totalTargetWords: arcs.reduce((sum, arc) => sum + arc.targetWordCount, 0),

        // Event type breakdown
        eventTypes: {} as Record<string, number>,

        // Importance breakdown
        importanceBreakdown: { pivotal: 0, major: 0, significant: 0, minor: 0 },

        // Character appearances
        characterAppearances: {} as Record<string, number>,

        // Prophecy stats
        prophecies: plan.prophecies.length,
        prophecyComponents: plan.prophecies.reduce((sum, p) => sum + p.components.length, 0),
        prophecyForeshadowing: plan.prophecies.reduce((sum, p) => sum + p.foreshadowing.length, 0),

        // Thread stats
        threads: plan.millenniumThreads.length,
        threadKeyMoments: plan.millenniumThreads.reduce((sum, t) => sum + t.keyMoments.length, 0),

        // Crucible stats
        crucibleMoments: plan.crucibleMoments.length,
        totalConsequences: plan.crucibleMoments.reduce((sum, c) => sum + c.consequences.length, 0),

        // Long-lived character stats
        longLivedCharacters: plan.longLivedCharacters.length,
        characterEvolutionPoints: plan.longLivedCharacters.reduce((sum, c) => sum + c.characterEvolution.length, 0),
        characterRelationships: plan.longLivedCharacters.reduce((sum, c) => sum + c.longTermRelationships.length, 0),

        // Theme stats
        thematicQuestions: plan.themeEvolution.thematicQuestions.length,
        recurringSymbols: plan.themeEvolution.recurringSymbols.length,
        counterThemes: plan.themeEvolution.counterThemes.length,

        // World state stats
        worldSnapshots: plan.worldStateProgression.length,
      };

      // Calculate event types and importance
      arcs.forEach(arc => {
        arc.keyEvents.forEach(event => {
          stats.eventTypes[event.eventType] = (stats.eventTypes[event.eventType] || 0) + 1;
          stats.importanceBreakdown[event.importance]++;

          event.participants.forEach(participant => {
            stats.characterAppearances[participant] = (stats.characterAppearances[participant] || 0) + 1;
          });
        });
      });

      console.log('\n╔════════════════════════════════════════════════════════════════╗');
      console.log('║           YEAR 1 MAXIMUM STRESS TEST - FINAL STATISTICS        ║');
      console.log('╠════════════════════════════════════════════════════════════════╣');
      console.log('║ NARRATIVE STRUCTURE                                            ║');
      console.log(`║   Arcs:                    ${stats.totalArcs.toString().padStart(4)}                              ║`);
      console.log(`║   Key Events:              ${stats.totalKeyEvents.toString().padStart(4)}                              ║`);
      console.log(`║   Character Arcs:          ${stats.totalCharacterArcs.toString().padStart(4)}                              ║`);
      console.log(`║   Subplots:                ${stats.totalSubplots.toString().padStart(4)}                              ║`);
      console.log(`║   Promises Made:           ${stats.totalPromises.toString().padStart(4)}                              ║`);
      console.log(`║   Payoffs Delivered:       ${stats.totalPayoffs.toString().padStart(4)}                              ║`);
      console.log('╠════════════════════════════════════════════════════════════════╣');
      console.log('║ CONTENT VOLUME                                                 ║');
      console.log(`║   Target Word Count:       ${stats.totalTargetWords.toLocaleString().padStart(10)}                    ║`);
      console.log(`║   (~${Math.round(stats.totalTargetWords / 80000)} novels at 80k words each)                          ║`);
      console.log('╠════════════════════════════════════════════════════════════════╣');
      console.log('║ EVENT IMPORTANCE                                               ║');
      console.log(`║   Pivotal:                 ${stats.importanceBreakdown.pivotal.toString().padStart(4)}                              ║`);
      console.log(`║   Major:                   ${stats.importanceBreakdown.major.toString().padStart(4)}                              ║`);
      console.log(`║   Significant:             ${stats.importanceBreakdown.significant.toString().padStart(4)}                              ║`);
      console.log('╠════════════════════════════════════════════════════════════════╣');
      console.log('║ LONG-TERM SETUP                                                ║');
      console.log(`║   Prophecies:              ${stats.prophecies.toString().padStart(4)}                              ║`);
      console.log(`║   Prophecy Components:     ${stats.prophecyComponents.toString().padStart(4)}                              ║`);
      console.log(`║   Foreshadowing Moments:   ${stats.prophecyForeshadowing.toString().padStart(4)}                              ║`);
      console.log(`║   Millennium Threads:      ${stats.threads.toString().padStart(4)}                              ║`);
      console.log(`║   Thread Key Moments:      ${stats.threadKeyMoments.toString().padStart(4)}                              ║`);
      console.log('╠════════════════════════════════════════════════════════════════╣');
      console.log('║ WORLD BUILDING                                                 ║');
      console.log(`║   Crucible Moments:        ${stats.crucibleMoments.toString().padStart(4)}                              ║`);
      console.log(`║   Long-Term Consequences:  ${stats.totalConsequences.toString().padStart(4)}                              ║`);
      console.log(`║   World State Snapshots:   ${stats.worldSnapshots.toString().padStart(4)}                              ║`);
      console.log('╠════════════════════════════════════════════════════════════════╣');
      console.log('║ CHARACTER DEPTH                                                ║');
      console.log(`║   Long-Lived Characters:   ${stats.longLivedCharacters.toString().padStart(4)}                              ║`);
      console.log(`║   Evolution Points:        ${stats.characterEvolutionPoints.toString().padStart(4)}                              ║`);
      console.log(`║   Tracked Relationships:   ${stats.characterRelationships.toString().padStart(4)}                              ║`);
      console.log('╠════════════════════════════════════════════════════════════════╣');
      console.log('║ THEMATIC DEPTH                                                 ║');
      console.log(`║   Thematic Questions:      ${stats.thematicQuestions.toString().padStart(4)}                              ║`);
      console.log(`║   Recurring Symbols:       ${stats.recurringSymbols.toString().padStart(4)}                              ║`);
      console.log(`║   Counter-Themes:          ${stats.counterThemes.toString().padStart(4)}                              ║`);
      console.log('╠════════════════════════════════════════════════════════════════╣');
      console.log('║ TOP CHARACTER APPEARANCES                                      ║');

      const topCharacters = Object.entries(stats.characterAppearances)
        .sort(([, a], [, b]) => b - a)
        .slice(0, 5);

      topCharacters.forEach(([name, count]) => {
        const paddedName = name.substring(0, 25).padEnd(25);
        console.log(`║   ${paddedName} ${count.toString().padStart(4)}                  ║`);
      });

      console.log('╚════════════════════════════════════════════════════════════════╝');

      // Assertions to verify stress test met expectations
      expect(stats.totalArcs).toBe(4);
      expect(stats.totalKeyEvents).toBeGreaterThanOrEqual(20);
      expect(stats.totalTargetWords).toBeGreaterThanOrEqual(700000);
      expect(stats.prophecies).toBe(0); // Book 1 has NO prophecies for Sheldon
      expect(stats.threads).toBe(3);
    });
  });

  describe('Export Full Plan', () => {
    it('should export the complete Year 1 plan as JSON', () => {
      const json = planner.exportPlan(plan.id);
      const parsed = JSON.parse(json);

      console.log('\n=== EXPORT SUMMARY ===');
      console.log(`Plan Name: ${parsed.name}`);
      console.log(`Total Years: ${parsed.totalYears}`);
      console.log(`JSON Size: ${(json.length / 1024).toFixed(2)} KB`);
      console.log(`Eras: ${parsed.eras.length}`);
      console.log(`Year 1 Arcs: ${parsed.eras[0].arcs.length}`);

      expect(parsed.name).toBe('Son of Cosmos: The Complete Saga');
      expect(parsed.eras[0].arcs.length).toBe(4);

      // Optionally write to file for inspection
      // require('fs').writeFileSync('year1-stress-test-output.json', json);
    });
  });
});
