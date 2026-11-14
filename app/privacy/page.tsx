import type { Metadata } from 'next';
import Link from 'next/link';
import Nav from '@/components/landing/Nav';
import Footer from '@/components/landing/Footer';
import styles from './privacy.module.css';

export const metadata: Metadata = {
  title: 'Politique de confidentialité — We Connect',
  description: 'Quelles données We Connect collecte, pourquoi, avec qui elles sont partagées, combien de temps elles sont conservées et comment exercer vos droits.',
};

const UPDATED = '14 novembre 2026';
const CONTACT = 'contact@weconnect.cards';

const SECTIONS = [
  { id: 'responsable',   title: 'Qui est responsable de vos données' },
  { id: 'donnees',       title: 'Les données que nous collectons' },
  { id: 'finalites',     title: 'Pourquoi nous les utilisons' },
  { id: 'public',        title: 'Ce qui est visible publiquement' },
  { id: 'sante',         title: 'Carte médicale : données de santé' },
  { id: 'clients-pro',   title: 'Données collectées par nos clients' },
  { id: 'partage',       title: 'Avec qui nous partageons vos données' },
  { id: 'transferts',    title: 'Transferts hors du Bénin' },
  { id: 'conservation',  title: 'Combien de temps nous les conservons' },
  { id: 'securite',      title: 'Sécurité' },
  { id: 'cookies',       title: 'Cookies et stockage local' },
  { id: 'droits',        title: 'Vos droits' },
  { id: 'modifications', title: 'Modifications de cette politique' },
];

export default function PrivacyPage() {
  return (
    <>
      <Nav />
      <main className={styles.page}>
        <article className={styles.doc}>
          <header className={styles.header}>
            <p className={styles.eyebrow}>Informations légales</p>
            <h1 className={styles.h1}>Politique de confidentialité</h1>
            <p className={styles.updated}>Dernière mise à jour : {UPDATED}</p>
          </header>

          <section className={styles.summary} aria-labelledby="en-bref">
            <h2 id="en-bref" className={styles.summaryTitle}>En bref</h2>
            <ul>
              <li>Nous collectons uniquement ce qui est nécessaire pour faire fonctionner votre carte NFC, votre profil et vos modules.</li>
              <li>Votre profil public est visible par toute personne qui touche votre carte ou ouvre votre lien : c’est vous qui choisissez ce qu’il contient.</li>
              <li>Nous ne vendons pas vos données et nous n’utilisons ni publicité ciblée ni outil de mesure d’audience tiers.</li>
              <li>Lorsqu’on consulte un profil, nous enregistrons la date et le type d’appareil, mais ni l’adresse IP ni la localisation.</li>
              <li>Vous pouvez modifier vos informations à tout moment et supprimer votre compte depuis vos paramètres.</li>
            </ul>
          </section>

          <nav className={styles.toc} aria-label="Sommaire">
            <p className={styles.tocTitle}>Sommaire</p>
            <ol>
              {SECTIONS.map((s) => <li key={s.id}><a href={`#${s.id}`}>{s.title}</a></li>)}
            </ol>
          </nav>

          <section id="responsable" className={styles.section}>
            <h2>1. Qui est responsable de vos données</h2>
            <p>
              Le site weconnect.cards, l’application et les cartes NFC We Connect sont exploités par <strong>We Connect</strong>, basé à Cotonou (Bénin).
              We Connect est responsable des traitements de données décrits dans cette politique, sauf dans les cas où nous agissons
              pour le compte d’un client professionnel (voir la section <a href="#clients-pro">Données collectées par nos clients</a>).
            </p>
            <p>Pour toute question sur vos données : <a href={`mailto:${CONTACT}`}>{CONTACT}</a>.</p>
            <p>
              Nous appliquons la loi n° 2017-20 du 20 avril 2018 portant Code du numérique en République du Bénin et, lorsqu’elle
              s’applique à nos utilisateurs situés dans l’Union européenne, la réglementation européenne sur la protection des données (RGPD).
            </p>
          </section>

          <section id="donnees" className={styles.section}>
            <h2>2. Les données que nous collectons</h2>

            <h3>Votre compte</h3>
            <p>Votre nom, votre adresse e-mail, votre mot de passe, votre offre (Standard, Pro ou Prestige) et les dates de votre abonnement.
              Votre mot de passe n’est jamais conservé par We Connect : il est géré par Firebase Authentication (Google), qui le stocke sous forme chiffrée.</p>

            <h3>Votre profil et vos cartes</h3>
            <p>Les informations que vous choisissez d’afficher : nom, poste, entreprise, biographie, accroche, photo, nom d’utilisateur, et vos liens
              (téléphone, WhatsApp, e-mail, réseaux sociaux, site web, localisation, prise de rendez-vous…). Nous conservons aussi les informations
              techniques de vos cartes : identifiant NFC, édition, statut (en attente, expédiée, active, désactivée).</p>

            <h3>Commandes, livraison et paiement</h3>
            <p>Pour livrer votre carte : nom complet, téléphone, adresse, ville et pays de livraison. Les paiements sont traités par notre
              prestataire FedaPay : nous lui transmettons votre nom et votre e-mail, et nous conservons la référence, le montant et le statut
              de la transaction. Nous ne voyons ni ne stockons vos données de carte bancaire ou de mobile money.</p>

            <h3>Statistiques de consultation</h3>
            <p>Quand quelqu’un touche votre carte, scanne votre QR code ou ouvre votre profil, nous enregistrons la date, le type d’appareil
              (mobile, tablette, ordinateur) et l’identifiant technique du navigateur. Nous enregistrons aussi les clics sur vos liens.
              Ces statistiques vous sont présentées dans votre tableau de bord. Nous n’enregistrons ni l’adresse IP ni la position des visiteurs.</p>

            <h3>Données des modules</h3>
            <p>Selon les modules que vous activez : informations médicales (carte médicale), numéro de téléphone et tampons des clients (carte de fidélité),
              nom, téléphone et e-mail des inscrits (pass événement), journaux d’entrée par zone (clé d’accès), informations des membres ou des agents
              (carte membre), ainsi que le contenu que vous publiez (menu, portfolio, certificat d’authenticité, lien d’avis Google).</p>

            <h3>Coordonnées laissées par vos contacts</h3>
            <p>Après avoir enregistré votre contact, un visiteur peut vous laisser son nom, son e-mail et son téléphone. Ces informations
              sont conservées dans votre espace pour que vous puissiez le recontacter.</p>

            <h3>Messages que vous nous envoyez</h3>
            <p>Si vous utilisez le formulaire de contact ou de demande de devis : nom, e-mail, entreprise et message. Ils nous sont transmis par e-mail.</p>

            <h3>Équipes</h3>
            <p>Si vous invitez des collaborateurs dans votre équipe, nous utilisons leur adresse e-mail pour les rattacher à votre compte.</p>
          </section>

          <section id="finalites" className={styles.section}>
            <h2>3. Pourquoi nous les utilisons</h2>
            <ul>
              <li><strong>Fournir le service</strong> : créer votre compte, afficher votre profil, faire fonctionner vos cartes et vos modules, vous montrer vos statistiques. <em>Base : exécution du contrat.</em></li>
              <li><strong>Livrer et facturer</strong> : traiter votre commande, la livraison et le paiement, tenir notre comptabilité. <em>Base : exécution du contrat et obligations légales.</em></li>
              <li><strong>Vous répondre</strong> : traiter vos demandes de contact, de devis et d’assistance. <em>Base : vos demandes et notre intérêt légitime à y répondre.</em></li>
              <li><strong>Sécuriser la plateforme</strong> : prévenir la fraude et les abus (par exemple en limitant les tentatives de code sur la clé d’accès). <em>Base : intérêt légitime.</em></li>
              <li><strong>Carte médicale</strong> : afficher les informations que vous avez choisi de rendre accessibles en cas d’urgence. <em>Base : votre consentement explicite.</em></li>
            </ul>
            <p>Nous n’utilisons pas vos données pour de la publicité ciblée et nous ne les vendons à personne.</p>
          </section>

          <section id="public" className={styles.section}>
            <h2>4. Ce qui est visible publiquement</h2>
            <p>Une carte NFC sert à partager : votre profil public est visible par toute personne qui touche votre carte, scanne votre QR code
              ou connaît votre lien. N’y mettez que ce que vous souhaitez partager. Vous pouvez modifier ou retirer une information, masquer certains champs
              ou désactiver une carte depuis votre tableau de bord.</p>
            <p>L’annuaire We Connect n’affiche votre profil que si vous l’avez activé dans vos réglages. Vous pouvez le retirer à tout moment.</p>
          </section>

          <section id="sante" className={styles.section}>
            <h2>5. Carte médicale : données de santé</h2>
            <p>Les informations médicales sont des données sensibles. Elles ne sont collectées que si vous activez le module Carte médicale et les saisissez vous-même.</p>
            <p>Par conception, les informations vitales (groupe sanguin, allergies, contact d’urgence) restent lisibles sans code, pour que les secours puissent y accéder.
              Le reste du dossier (traitements, antécédents, médecin, assurance…) peut être protégé par un code PIN que vous communiquez à vos proches.
              Vous pouvez modifier ou supprimer ces informations, ou désactiver le module, à tout moment.</p>
          </section>

          <section id="clients-pro" className={styles.section}>
            <h2>6. Données collectées par nos clients</h2>
            <p>Les entreprises et organisations qui utilisent We Connect (programme de fidélité, billetterie, contrôle d’accès, cartes membres…) collectent
              des données sur leurs propres clients, membres ou invités. Pour ces données, c’est l’organisation qui décide de leur utilisation : elle en est
              responsable, et We Connect les héberge et les traite pour son compte. Pour exercer vos droits sur ces données, adressez-vous d’abord à
              l’organisation concernée ; nous l’aiderons à vous répondre.</p>
          </section>

          <section id="partage" className={styles.section}>
            <h2>7. Avec qui nous partageons vos données</h2>
            <p>Uniquement avec les prestataires nécessaires au service, qui n’ont accès qu’aux données utiles à leur mission :</p>
            <ul>
              <li><strong>Google Firebase</strong> (Authentication, Firestore, Storage) : connexion, base de données et stockage des photos.</li>
              <li><strong>Vercel</strong> : hébergement du site et de l’application.</li>
              <li><strong>FedaPay</strong> : traitement des paiements.</li>
              <li><strong>Postmark</strong> : envoi des e-mails (confirmations, messages de contact).</li>
              <li><strong>Le livreur ou transporteur</strong> chargé de votre commande, le cas échéant : nom, téléphone et adresse de livraison.</li>
            </ul>
            <p>Nous pouvons aussi communiquer des données lorsque la loi l’exige, sur demande d’une autorité compétente.</p>
          </section>

          <section id="transferts" className={styles.section}>
            <h2>8. Transferts hors du Bénin</h2>
            <p>Certains de nos prestataires stockent ou traitent des données sur des serveurs situés hors du Bénin, notamment en Europe et aux États-Unis.
              Nous les choisissons pour leurs garanties de sécurité et nous encadrons ces transferts par leurs engagements contractuels de protection des données.</p>
          </section>

          <section id="conservation" className={styles.section}>
            <h2>9. Combien de temps nous les conservons</h2>
            <ul>
              <li><strong>Compte, profil, liens, statistiques</strong> : tant que votre compte existe. Quand vous supprimez votre compte depuis vos paramètres,
                votre profil, vos liens, votre nom d’utilisateur, vos statistiques et votre accès de connexion sont supprimés.</li>
              <li><strong>Commandes et paiements</strong> : pendant la durée imposée par nos obligations comptables et fiscales (dix ans pour les pièces comptables).</li>
              <li><strong>Données des modules et coordonnées laissées par vos contacts</strong> : tant que vous les gardez dans votre espace ; vous pouvez les supprimer à tout moment, et sur simple demande à <a href={`mailto:${CONTACT}`}>{CONTACT}</a>.</li>
              <li><strong>Messages de contact</strong> : le temps nécessaire pour traiter votre demande et assurer le suivi de la relation.</li>
              <li><strong>Cookie de session</strong> : 14 jours au maximum.</li>
            </ul>
          </section>

          <section id="securite" className={styles.section}>
            <h2>10. Sécurité</h2>
            <p>Les échanges avec le site sont chiffrés (HTTPS). Votre session de connexion utilise un cookie inaccessible aux scripts de la page,
              et votre mot de passe est géré par Firebase Authentication. Les tentatives de code répétées sur la clé d’accès sont bloquées.
              L’accès à l’administration est réservé à l’équipe We Connect. Aucun système n’étant infaillible, nous vous informerons
              en cas d’incident affectant vos données, conformément à la loi.</p>
          </section>

          <section id="cookies" className={styles.section}>
            <h2>11. Cookies et stockage local</h2>
            <p>Nous n’utilisons ni cookie publicitaire, ni outil de mesure d’audience tiers. Nous utilisons uniquement :</p>
            <ul>
              <li><strong>Un cookie de session</strong> (<code>__session</code>), strictement nécessaire pour vous garder connecté, valable 14 jours au maximum.</li>
              <li><strong>Le stockage local de votre navigateur</strong>, pour mémoriser vos préférences d’affichage (thème clair ou sombre, disposition de l’éditeur de profil).</li>
            </ul>
            <p>Ces éléments sont indispensables au fonctionnement du service ou purement pratiques : ils ne nécessitent pas votre consentement préalable.
              Vous pouvez les effacer depuis les réglages de votre navigateur ; vous serez alors déconnecté.</p>
          </section>

          <section id="droits" className={styles.section}>
            <h2>12. Vos droits</h2>
            <p>Vous disposez d’un droit d’accès, de rectification, de suppression et d’opposition sur vos données, ainsi que du droit d’en obtenir une copie
              et, lorsque le traitement repose sur votre consentement, de le retirer à tout moment.</p>
            <ul>
              <li><strong>Directement dans votre espace</strong> : modifier votre profil, masquer des champs, désactiver une carte ou un module, supprimer votre compte.</li>
              <li><strong>Par e-mail</strong> : <a href={`mailto:${CONTACT}`}>{CONTACT}</a>. Nous répondons dans un délai d’un mois et pouvons vous demander de justifier de votre identité.</li>
            </ul>
            <p>Si vous estimez que vos droits ne sont pas respectés, vous pouvez saisir l’Autorité de Protection des Données à caractère Personnel (APDP)
              du Bénin, ou l’autorité de protection des données de votre pays de résidence.</p>
          </section>

          <section id="modifications" className={styles.section}>
            <h2>13. Modifications de cette politique</h2>
            <p>Nous pouvons mettre à jour cette politique pour refléter l’évolution du service ou de la loi. La date de dernière mise à jour figure en haut de la page.
              En cas de changement important, nous vous en informerons par e-mail ou dans votre espace.</p>
          </section>

          <p className={styles.back}><Link href="/">← Retour à l’accueil</Link></p>
        </article>
      </main>
      <Footer />
    </>
  );
}
