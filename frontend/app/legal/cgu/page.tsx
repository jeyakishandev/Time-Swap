export default function CGUPage() {
  return (
    <div className="max-w-4xl mx-auto px-6">
      <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-8 border border-white/20">
        <h1 className="text-4xl font-bold text-white mb-8">Conditions Générales d'Utilisation</h1>
        
        <div className="prose prose-invert max-w-none">
          <section className="mb-8">
            <h2 className="text-2xl font-bold text-white mb-4">1. Objet</h2>
            <div className="text-gray-300 space-y-3">
              <p>Les présentes conditions générales d'utilisation (CGU) régissent l'utilisation de la plateforme Time-Swap Network.</p>
              <p>Time-Swap est une plateforme de démonstration permettant l'échange de crédits entre utilisateurs dans un contexte d'apprentissage technique.</p>
              <p><strong>Important :</strong> Il s'agit d'une application de démonstration et non d'un service commercial en production.</p>
            </div>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-bold text-white mb-4">2. Acceptation des conditions</h2>
            <div className="text-gray-300 space-y-3">
              <p>L'utilisation de Time-Swap implique l'acceptation pleine et entière des présentes CGU.</p>
              <p>Si vous n'acceptez pas ces conditions, veuillez ne pas utiliser cette plateforme.</p>
              <p>Nous nous réservons le droit de modifier ces CGU à tout moment. Les modifications prendront effet dès leur publication.</p>
            </div>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-bold text-white mb-4">3. Inscription et compte utilisateur</h2>
            <div className="text-gray-300 space-y-4">
              <div>
                <h3 className="text-xl font-semibold text-white mb-2">3.1 Conditions d'inscription</h3>
                <ul className="list-disc list-inside ml-4 space-y-1">
                  <li>Être âgé d'au moins 16 ans</li>
                  <li>Fournir une adresse email valide</li>
                  <li>Choisir un nom d'utilisateur unique</li>
                  <li>Créer un mot de passe sécurisé</li>
                </ul>
              </div>
              
              <div>
                <h3 className="text-xl font-semibold text-white mb-2">3.2 Responsabilités de l'utilisateur</h3>
                <ul className="list-disc list-inside ml-4 space-y-1">
                  <li>Maintenir la confidentialité de ses identifiants</li>
                  <li>Notifier immédiatement toute utilisation non autorisée</li>
                  <li>Fournir des informations exactes et à jour</li>
                  <li>Respecter les règles de la communauté</li>
                </ul>
              </div>
            </div>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-bold text-white mb-4">4. Fonctionnement de la plateforme</h2>
            <div className="text-gray-300 space-y-4">
              <div>
                <h3 className="text-xl font-semibold text-white mb-2">4.1 Système de crédits</h3>
                <ul className="list-disc list-inside ml-4 space-y-1">
                  <li>Chaque utilisateur reçoit 100 crédits de départ</li>
                  <li>Les crédits permettent d'effectuer des transactions</li>
                  <li>Les transactions sont irréversibles</li>
                  <li>Le solde ne peut pas être négatif</li>
                </ul>
              </div>
              
              <div>
                <h3 className="text-xl font-semibold text-white mb-2">4.2 Transactions</h3>
                <ul className="list-disc list-inside ml-4 space-y-1">
                  <li>Toutes les transactions sont enregistrées</li>
                  <li>Chaque transaction nécessite un destinataire valide</li>
                  <li>Les montants doivent être positifs</li>
                  <li>Les transactions sont traitées instantanément</li>
                </ul>
              </div>
            </div>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-bold text-white mb-4">5. Utilisation acceptable</h2>
            <div className="text-gray-300 space-y-4">
              <div>
                <h3 className="text-xl font-semibold text-white mb-2">5.1 Utilisations autorisées</h3>
                <ul className="list-disc list-inside ml-4 space-y-1">
                  <li>Tests et démonstrations techniques</li>
                  <li>Apprentissage des fonctionnalités</li>
                  <li>Expérimentation avec les transactions</li>
                  <li>Découverte de l'interface utilisateur</li>
                </ul>
              </div>
              
              <div>
                <h3 className="text-xl font-semibold text-white mb-2">5.2 Utilisations interdites</h3>
                <ul className="list-disc list-inside ml-4 space-y-1">
                  <li>Utilisation à des fins commerciales réelles</li>
                  <li>Échange de vraies monnaies ou valeurs</li>
                  <li>Tentative de piratage ou d'intrusion</li>
                  <li>Création de multiples comptes frauduleux</li>
                  <li>Spam ou harcèlement d'autres utilisateurs</li>
                  <li>Utilisation de robots ou scripts automatisés</li>
                </ul>
              </div>
            </div>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-bold text-white mb-4">6. Sécurité et confidentialité</h2>
            <div className="text-gray-300 space-y-3">
              <p>Nous nous engageons à :</p>
              <ul className="list-disc list-inside ml-4 space-y-1">
                <li>Protéger vos données personnelles</li>
                <li>Utiliser des protocoles de sécurité modernes</li>
                <li>Ne jamais partager vos informations avec des tiers</li>
                <li>Maintenir la confidentialité des transactions</li>
              </ul>
              <p>Consultez notre <a href="/legal/confidentialite" className="text-blue-400 hover:text-blue-300 underline">Politique de Confidentialité</a> pour plus de détails.</p>
            </div>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-bold text-white mb-4">7. Disponibilité du service</h2>
            <div className="text-gray-300 space-y-3">
              <p>Nous nous efforçons de maintenir la disponibilité de la plateforme, mais :</p>
              <ul className="list-disc list-inside ml-4 space-y-1">
                <li>Des interruptions peuvent survenir pour maintenance</li>
                <li>Nous ne garantissons pas une disponibilité à 100%</li>
                <li>Les mises à jour peuvent temporairement interrompre le service</li>
                <li>En tant que démonstration, le service peut être arrêté sans préavis</li>
              </ul>
            </div>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-bold text-white mb-4">8. Limitation de responsabilité</h2>
            <div className="text-gray-300 space-y-3">
              <p>Time-Swap Network ne peut être tenu responsable :</p>
              <ul className="list-disc list-inside ml-4 space-y-1">
                <li>De la perte de crédits due à une erreur utilisateur</li>
                <li>Des interruptions temporaires du service</li>
                <li>Des dommages indirects ou consécutifs</li>
                <li>De l'utilisation frauduleuse de comptes</li>
              </ul>
              <p><strong>Rappel :</strong> Il s'agit d'une démonstration technique, les crédits n'ont aucune valeur réelle.</p>
            </div>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-bold text-white mb-4">9. Suspension et résiliation</h2>
            <div className="text-gray-300 space-y-3">
              <p>Nous nous réservons le droit de :</p>
              <ul className="list-disc list-inside ml-4 space-y-1">
                <li>Suspendre temporairement un compte en cas de violation</li>
                <li>Supprimer définitivement un compte en cas de manquement grave</li>
                <li>Modifier ou arrêter le service sans préavis</li>
              </ul>
              <p>Les utilisateurs peuvent supprimer leur compte à tout moment.</p>
            </div>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-bold text-white mb-4">10. Propriété intellectuelle</h2>
            <div className="text-gray-300 space-y-3">
              <p>Tous les éléments de Time-Swap (code, design, contenu) sont protégés par le droit d'auteur.</p>
              <p>L'utilisation de la plateforme ne confère aucun droit de propriété sur ces éléments.</p>
              <p>Il est interdit de copier, modifier ou distribuer le code source sans autorisation.</p>
            </div>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-bold text-white mb-4">11. Droit applicable et juridiction</h2>
            <div className="text-gray-300">
              <p>Les présentes CGU sont régies par le droit français.</p>
              <p>En cas de litige, les tribunaux français seront seuls compétents.</p>
            </div>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-bold text-white mb-4">12. Contact</h2>
            <div className="text-gray-300 space-y-3">
              <p>Pour toute question concernant ces CGU :</p>
              <ul className="list-disc list-inside ml-4 space-y-1">
                <li><strong>Email :</strong> legal@timeswap.network</li>
                <li><strong>Support :</strong> contact@timeswap.network</li>
              </ul>
            </div>
          </section>

          <div className="mt-8 p-4 bg-yellow-500/20 rounded-lg border border-yellow-500/30">
            <p className="text-yellow-200 text-sm">
              <strong>Dernière mise à jour :</strong> Décembre 2024<br/>
              <strong>Version :</strong> 1.0 - Démonstration technique
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
