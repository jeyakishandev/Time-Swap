export default function ConfidentialitePage() {
  return (
    <div className="max-w-4xl mx-auto px-6">
      <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-8 border border-white/20">
        <h1 className="text-4xl font-bold text-white mb-8">Politique de Confidentialité</h1>
        
        <div className="prose prose-invert max-w-none">
          <section className="mb-8">
            <h2 className="text-2xl font-bold text-white mb-4">1. Introduction</h2>
            <div className="text-gray-300 space-y-3">
              <p>Time-Swap Network s'engage à protéger votre vie privée et vos données personnelles.</p>
              <p>Cette politique de confidentialité explique comment nous collectons, utilisons et protégeons vos informations dans le cadre de cette démonstration technique.</p>
              <p><strong>Important :</strong> Il s'agit d'une application de démonstration et non d'un service commercial en production.</p>
            </div>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-bold text-white mb-4">2. Données collectées</h2>
            <div className="text-gray-300 space-y-4">
              <div>
                <h3 className="text-xl font-semibold text-white mb-2">2.1 Données d'inscription</h3>
                <ul className="list-disc list-inside ml-4 space-y-1">
                  <li>Adresse email</li>
                  <li>Nom d'utilisateur</li>
                  <li>Mot de passe (hashé avec SHA-256)</li>
                </ul>
              </div>
              
              <div>
                <h3 className="text-xl font-semibold text-white mb-2">2.2 Données d'utilisation</h3>
                <ul className="list-disc list-inside ml-4 space-y-1">
                  <li>Historique des transactions</li>
                  <li>Solde de crédits</li>
                  <li>Horodatage des connexions</li>
                </ul>
              </div>

              <div>
                <h3 className="text-xl font-semibold text-white mb-2">2.3 Données techniques</h3>
                <ul className="list-disc list-inside ml-4 space-y-1">
                  <li>Adresse IP (pour les logs de sécurité)</li>
                  <li>Type de navigateur</li>
                  <li>Cookies de session</li>
                </ul>
              </div>
            </div>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-bold text-white mb-4">3. Utilisation des données</h2>
            <div className="text-gray-300 space-y-3">
              <p>Vos données sont utilisées uniquement pour :</p>
              <ul className="list-disc list-inside ml-4 space-y-1">
                <li>Authentification et gestion des comptes</li>
                <li>Fonctionnement des transactions de crédits</li>
                <li>Amélioration de l'expérience utilisateur</li>
                <li>Sécurité et prévention de la fraude</li>
              </ul>
              <p><strong>Nous ne vendons jamais vos données à des tiers.</strong></p>
            </div>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-bold text-white mb-4">4. Stockage et sécurité</h2>
            <div className="text-gray-300 space-y-4">
              <div>
                <h3 className="text-xl font-semibold text-white mb-2">4.1 Sécurité des mots de passe</h3>
                <p>Les mots de passe sont hashés avec SHA-256 avant stockage. Aucun mot de passe en clair n'est jamais stocké.</p>
              </div>
              
              <div>
                <h3 className="text-xl font-semibold text-white mb-2">4.2 Base de données</h3>
                <p>Les données sont stockées dans une base SQLite locale pour cette démonstration.</p>
                <p>En production, nous utiliserions PostgreSQL avec chiffrement.</p>
              </div>

              <div>
                <h3 className="text-xl font-semibold text-white mb-2">4.3 Authentification</h3>
                <p>Utilisation de JWT (JSON Web Tokens) pour l'authentification sécurisée.</p>
              </div>
            </div>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-bold text-white mb-4">5. Vos droits</h2>
            <div className="text-gray-300 space-y-3">
              <p>Conformément au RGPD, vous disposez des droits suivants :</p>
              <ul className="list-disc list-inside ml-4 space-y-1">
                <li><strong>Droit d'accès :</strong> Consulter vos données personnelles</li>
                <li><strong>Droit de rectification :</strong> Corriger des données inexactes</li>
                <li><strong>Droit à l'effacement :</strong> Supprimer vos données</li>
                <li><strong>Droit à la portabilité :</strong> Récupérer vos données</li>
                <li><strong>Droit d'opposition :</strong> Vous opposer au traitement</li>
              </ul>
              <p>Pour exercer ces droits, contactez : privacy@timeswap.network</p>
            </div>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-bold text-white mb-4">6. Cookies</h2>
            <div className="text-gray-300 space-y-3">
              <p>Nous utilisons des cookies pour :</p>
              <ul className="list-disc list-inside ml-4 space-y-1">
                <li>Maintenir votre session de connexion</li>
                <li>Améliorer la sécurité</li>
                <li>Mémoriser vos préférences</li>
              </ul>
              <p>Vous pouvez désactiver les cookies dans les paramètres de votre navigateur.</p>
            </div>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-bold text-white mb-4">7. Partage de données</h2>
            <div className="text-gray-300 space-y-3">
              <p>Nous ne partageons vos données qu'avec :</p>
              <ul className="list-disc list-inside ml-4 space-y-1">
                <li>Vous-même (accès à votre propre compte)</li>
                <li>Les autres utilisateurs (nom d'utilisateur dans les transactions uniquement)</li>
              </ul>
              <p><strong>Jamais avec des tiers commerciaux.</strong></p>
            </div>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-bold text-white mb-4">8. Conservation des données</h2>
            <div className="text-gray-300 space-y-3">
              <p>Nous conservons vos données :</p>
              <ul className="list-disc list-inside ml-4 space-y-1">
                <li><strong>Compte actif :</strong> Tant que votre compte est actif</li>
                <li><strong>Données de transaction :</strong> 3 ans pour la traçabilité</li>
                <li><strong>Logs de sécurité :</strong> 1 an maximum</li>
              </ul>
            </div>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-bold text-white mb-4">9. Modifications</h2>
            <div className="text-gray-300">
              <p>Cette politique peut être modifiée. Les changements seront notifiés sur cette page.</p>
              <p><strong>Dernière mise à jour :</strong> Décembre 2024</p>
            </div>
          </section>

          <div className="mt-8 p-4 bg-green-500/20 rounded-lg border border-green-500/30">
            <p className="text-green-200 text-sm">
              <strong>Contact :</strong> Pour toute question sur cette politique de confidentialité, 
              contactez-nous à privacy@timeswap.network
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
