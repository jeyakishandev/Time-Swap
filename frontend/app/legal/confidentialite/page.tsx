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
              <p>Nous utilisons vos données uniquement pour :</p>
              <ul className="list-disc list-inside ml-4 space-y-1">
                <li>Fournir les services de la plateforme Time-Swap</li>
                <li>Authentifier votre identité</li>
                <li>Traiter les transactions de crédits</li>
                <li>Maintenir la sécurité de la plateforme</li>
                <li>Améliorer l'expérience utilisateur</li>
              </ul>
            </div>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-bold text-white mb-4">4. Partage des données</h2>
            <div className="text-gray-300 space-y-3">
              <p><strong>Nous ne partageons PAS vos données personnelles avec des tiers.</strong></p>
              <p>Vos données restent strictement confidentielles et ne sont utilisées que dans le cadre de cette démonstration technique.</p>
            </div>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-bold text-white mb-4">5. Sécurité des données</h2>
            <div className="text-gray-300 space-y-3">
              <p>Nous mettons en place des mesures de sécurité appropriées :</p>
              <ul className="list-disc list-inside ml-4 space-y-1">
                <li>Chiffrement des mots de passe (SHA-256)</li>
                <li>Authentification JWT sécurisée</li>
                <li>Validation des données côté serveur</li>
                <li>Protection contre les injections SQL</li>
                <li>HTTPS pour toutes les communications</li>
              </ul>
            </div>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-bold text-white mb-4">6. Vos droits (RGPD)</h2>
            <div className="text-gray-300 space-y-3">
              <p>Conformément au RGPD, vous disposez des droits suivants :</p>
              <ul className="list-disc list-inside ml-4 space-y-1">
                <li><strong>Droit d'accès :</strong> Consulter vos données personnelles</li>
                <li><strong>Droit de rectification :</strong> Corriger vos données</li>
                <li><strong>Droit d'effacement :</strong> Supprimer votre compte</li>
                <li><strong>Droit à la portabilité :</strong> Récupérer vos données</li>
                <li><strong>Droit d'opposition :</strong> Vous opposer au traitement</li>
              </ul>
              <p>Pour exercer ces droits, contactez-nous à : contact@timeswap.network</p>
            </div>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-bold text-white mb-4">7. Cookies</h2>
            <div className="text-gray-300 space-y-3">
              <p>Nous utilisons uniquement des cookies techniques nécessaires :</p>
              <ul className="list-disc list-inside ml-4 space-y-1">
                <li>Cookies de session pour l'authentification</li>
                <li>Cookies de préférences utilisateur</li>
              </ul>
              <p>Aucun cookie de tracking ou de publicité n'est utilisé.</p>
            </div>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-bold text-white mb-4">8. Conservation des données</h2>
            <div className="text-gray-300 space-y-3">
              <p>Vos données sont conservées :</p>
              <ul className="list-disc list-inside ml-4 space-y-1">
                <li>Pendant la durée de votre inscription</li>
                <li>Jusqu'à 30 jours après suppression du compte</li>
                <li>Les logs de sécurité sont conservés 1 an maximum</li>
              </ul>
            </div>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-bold text-white mb-4">9. Modifications</h2>
            <div className="text-gray-300 space-y-3">
              <p>Cette politique peut être modifiée à tout moment. Les modifications importantes seront notifiées par email.</p>
              <p>Nous vous encourageons à consulter régulièrement cette page.</p>
            </div>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-bold text-white mb-4">10. Contact</h2>
            <div className="text-gray-300 space-y-2">
              <p>Pour toute question concernant cette politique de confidentialité :</p>
              <p><strong>Email :</strong> contact@timeswap.network</p>
              <p><strong>Site web :</strong> https://timeswap.network</p>
            </div>
          </section>

          <div className="mt-8 p-4 bg-[#4A5C6A]/10 rounded-lg border border-[#4A5C6A]/20">
            <p className="text-[#9BA8AB] text-sm">
              <strong>Dernière mise à jour :</strong> {new Date().toLocaleDateString('fr-FR')}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}