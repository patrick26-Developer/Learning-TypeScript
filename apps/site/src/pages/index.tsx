import Link from '@docusaurus/Link';
import Translate, { translate } from '@docusaurus/Translate';
import useDocusaurusContext from '@docusaurus/useDocusaurusContext';
import Layout from '@theme/Layout';
import clsx from 'clsx';
import type { ReactNode } from 'react';

import styles from './index.module.css';

/**
 * Page d'accueil du site.
 *
 * NOTE SUR LE BILINGUISME
 * -----------------------
 * Tout texte visible passe par `<Translate>` ou `translate()`.
 * C'est ce qui permet à `pnpm --filter @atlas/site write-translations`
 * d'extraire automatiquement les chaînes vers
 * `i18n/en/code.json`, où elles sont ensuite traduites.
 *
 * Écrire du texte en dur ici le rendrait invisible à l'extraction :
 * il resterait en français sur la version anglaise du site.
 */

// ---------------------------------------------------------------------------
// Bandeau d'accroche
// ---------------------------------------------------------------------------
function Hero(): ReactNode {
  return (
    <header className={styles.hero}>
      <div className="container">
        {/* Balise native plutôt que le composant `@theme/Heading` : cette
            page d'accueil n'a pas besoin des ancres de sommaire (TOC) que
            fournit ce composant sur les pages de documentation. */}
        <h1 className={styles.heroTitle}>
          <Translate id="home.hero.title">Maîtrisez TypeScript, vraiment.</Translate>
        </h1>

        <p className={styles.heroSubtitle}>
          <Translate id="home.hero.subtitle">
            Une formation complète et gratuite, du premier type à l’architecture d’API de
            production. Théorie, exercices corrigés, mini-projets et trois applications finales — le
            tout dans un dépôt que vous clonez et faites tourner.
          </Translate>
        </p>

        <div className={styles.heroButtons}>
          <Link className="button button--primary button--lg" to="/orientation-parcours">
            <Translate id="home.hero.cta.primary">Par où commencer ?</Translate>
          </Link>
          <Link className="button button--secondary button--lg" to="/plan-de-formation">
            <Translate id="home.hero.cta.secondary">Voir le programme</Translate>
          </Link>
        </div>

        <div className={styles.stats}>
          <Stat value="21" label={translate({ id: 'home.stats.modules', message: 'modules' })} />
          <Stat value="6" label={translate({ id: 'home.stats.mini', message: 'mini-projets' })} />
          <Stat
            value="3"
            label={translate({ id: 'home.stats.capstones', message: 'projets finaux' })}
          />
          <Stat
            value="120 h+"
            label={translate({ id: 'home.stats.hours', message: 'de pratique' })}
          />
          <Stat
            value="FR / EN"
            label={translate({ id: 'home.stats.langs', message: 'bilingue' })}
          />
        </div>
      </div>
    </header>
  );
}

function Stat({ value, label }: { value: string; label: string }): ReactNode {
  return (
    <div className={styles.stat}>
      <span className={styles.statValue}>{value}</span>
      <span className={styles.statLabel}>{label}</span>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Ce qui distingue cette formation
// ---------------------------------------------------------------------------
function Differentiators(): ReactNode {
  const items = [
    {
      icon: '🔬',
      title: translate({ id: 'home.diff.1.title', message: 'Chaque ligne est expliquée' }),
      text: translate({
        id: 'home.diff.1.text',
        message:
          'Pas de code magique. Chaque exemple est commenté ligne par ligne, et chaque décision est justifiée — y compris celles qu’on aurait pu prendre autrement.',
      }),
    },
    {
      icon: '🧪',
      title: translate({ id: 'home.diff.2.title', message: 'Le code est réellement testé' }),
      text: translate({
        id: 'home.diff.2.text',
        message:
          'Les exercices ne vivent pas dans des blocs Markdown : ce sont de vrais paquets qui passent typecheck, lint et tests en intégration continue. Si une leçon devient fausse, le build casse.',
      }),
    },
    {
      icon: '🔐',
      title: translate({ id: 'home.diff.3.title', message: 'Strict, sûr, fiable' }),
      text: translate({
        id: 'home.diff.3.text',
        message:
          'Options strictes au maximum dès le premier exercice, lint type-aware, validation à l’exécution aux frontières, sécurité de la chaîne de dépendances. Le niveau réellement attendu en production.',
      }),
    },
    {
      icon: '🏗️',
      title: translate({ id: 'home.diff.4.title', message: 'Des projets, pas des démos' }),
      text: translate({
        id: 'home.diff.4.text',
        message:
          'Trois applications complètes — web rendu serveur, monopage temps réel et mobile hors-ligne — partageant un même contrat typé. Présentables en entretien.',
      }),
    },
    {
      icon: '🧭',
      title: translate({ id: 'home.diff.5.title', message: 'Cinq parcours, pas un seul' }),
      text: translate({
        id: 'home.diff.5.text',
        message:
          'Débutant complet, développeur JavaScript, venu d’un autre langage typé, montée en expertise, préparation d’entretien senior. Vous ne lisez que ce qui vous sert.',
      }),
    },
    {
      icon: '📋',
      title: translate({ id: 'home.diff.6.title', message: 'Les coulisses sont ouvertes' }),
      text: translate({
        id: 'home.diff.6.text',
        message:
          'Un journal d’audit consigne chaque décision technique, sa justification, et la dette assumée. Lire un vrai document d’architecture fait partie de la formation.',
      }),
    },
  ];

  return (
    <section className={clsx(styles.section, styles.sectionAlt)}>
      <div className="container">
        <h2 className={styles.sectionTitle}>
          <Translate id="home.diff.title">Ce qui change ici</Translate>
        </h2>
        <p className={styles.sectionLead}>
          <Translate id="home.diff.lead">
            Il existe beaucoup de tutoriels TypeScript. Voici ce que celui-ci fait différemment.
          </Translate>
        </p>

        <div className={styles.cards}>
          {items.map((item) => (
            <article key={item.title} className={styles.card}>
              <div className={styles.cardIcon} aria-hidden="true">
                {item.icon}
              </div>
              <h3 className={styles.cardTitle}>{item.title}</h3>
              <p className={styles.cardText}>{item.text}</p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}

// ---------------------------------------------------------------------------
// Aperçu du programme
// ---------------------------------------------------------------------------
function Curriculum(): ReactNode {
  const parts = [
    {
      badge: 'M00 → M04',
      title: translate({ id: 'home.curr.1.title', message: 'Origines & Fondations' }),
      text: translate({
        id: 'home.curr.1.text',
        message:
          'Pourquoi TypeScript existe, toolchain, système de types, inférence, fonctions. Mini-projet : une application en ligne de commande sans aucune dépendance.',
      }),
    },
    {
      badge: 'M05 → M08',
      title: translate({ id: 'home.curr.2.title', message: 'Structurer le code' }),
      text: translate({
        id: 'home.curr.2.text',
        message:
          'Interfaces, classes, génériques, unions discriminées, exhaustivité, modules et déclarations. Mini-projet : un parseur CSV typé par son schéma.',
      }),
    },
    {
      badge: 'M09 → M11',
      title: translate({ id: 'home.curr.3.title', message: 'Le niveau expert du typage' }),
      text: translate({
        id: 'home.curr.3.text',
        message:
          'Types conditionnels, infer, types mappés, littéraux de gabarit, branded types, machines à états. Puis sécurité, validation runtime et fiabilité.',
      }),
    },
    {
      badge: 'M12 → M14',
      title: translate({ id: 'home.curr.4.title', message: 'Qualité & industrialisation' }),
      text: translate({
        id: 'home.curr.4.text',
        message:
          'Asynchrone, erreurs, concurrence, annulation. Vitest et tests de types. Docker multi-stage, compose et intégration continue.',
      }),
    },
    {
      badge: 'M15 → M18',
      title: translate({ id: 'home.curr.5.title', message: 'Backend & APIs de production' }),
      text: translate({
        id: 'home.curr.5.text',
        message:
          'Express 5 puis NestJS 12, comparés honnêtement. Persistance sans base, puis PostgreSQL et Prisma. Authentification, RBAC, observabilité, cache, scalabilité.',
      }),
    },
    {
      badge: 'M19 → M20',
      title: translate({ id: 'home.curr.6.title', message: 'Frontend & projets finaux' }),
      text: translate({
        id: 'home.curr.6.text',
        message:
          'React 19 typé et contrats partagés de bout en bout. Puis NEXUS (Next.js), PULSE (React + Vite) et TRAIL (React Native + Expo).',
      }),
    },
  ];

  return (
    <section className={styles.section}>
      <div className="container">
        <h2 className={styles.sectionTitle}>
          <Translate id="home.curr.title">Le parcours en six temps</Translate>
        </h2>
        <p className={styles.sectionLead}>
          <Translate id="home.curr.lead">
            Chaque bloc se termine par un projet qui réinvestit tout ce qui précède. Une notion non
            réinvestie est une notion oubliée.
          </Translate>
        </p>

        <div>
          {parts.map((part) => (
            <div key={part.badge} className={styles.track}>
              <span className={styles.trackBadge}>{part.badge}</span>
              <div className={styles.trackBody}>
                <strong>{part.title}</strong>
                <span>{part.text}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

// ---------------------------------------------------------------------------
// Appel à l'action final
// ---------------------------------------------------------------------------
function FinalCta(): ReactNode {
  return (
    <section className={clsx(styles.finalCta, styles.sectionAlt)}>
      <h2 className={styles.sectionTitle}>
        <Translate id="home.cta.title">Trois commandes et vous commencez</Translate>
      </h2>
      <p>
        <Translate id="home.cta.text">
          Le dépôt est public, la formation est gratuite, et tout fonctionne en local. Aucune
          inscription.
        </Translate>
      </p>
      <div className={styles.heroButtons}>
        <Link className="button button--primary button--lg" to="/installation">
          <Translate id="home.cta.button">Installer et démarrer</Translate>
        </Link>
      </div>
    </section>
  );
}

// ---------------------------------------------------------------------------
// Assemblage
// ---------------------------------------------------------------------------
export default function Home(): ReactNode {
  const { siteConfig } = useDocusaurusContext();

  return (
    <Layout
      title={siteConfig.title}
      description={translate({
        id: 'home.meta.description',
        message:
          'Formation TypeScript complète et gratuite, de débutant à expert : théorie, exercices corrigés, mini-projets, APIs NestJS et Express, Docker, et trois projets finaux Next.js, React + Vite et Expo.',
      })}
    >
      <Hero />
      <main>
        <Differentiators />
        <Curriculum />
        <FinalCta />
      </main>
    </Layout>
  );
}
