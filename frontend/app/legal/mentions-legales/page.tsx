export default function MentionsLegalesPage() {
  return (
    <div className="max-w-4xl mx-auto px-6">
      <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-8 border border-white/20">
        <h1 className="text-4xl font-bold text-white mb-8">Mentions Légales</h1>
        
        <div className="prose prose-invert max-w-none">
          <section className="mb-8">
            <h2 className="text-2xl font-bold text-white mb-4">1. Éditeur du site</h2>
            <div className="text-gray-300 space-y-2">
              <p><strong>Nom :</strong> Time-Swap Network</p>
              <p><strong>Forme juridique :</strong> Projet de démonstration</p>
              <p><strong>Développeur :</strong> Junior Developer</p>
              <p><strong>Email :</strong> contact@timeswap.network</p>
              <p><strong>Site web :</strong> https://timeswap.network</p>
            </div>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-bold text-white mb-4">2. Hébergement</h2>
            <div className="text-gray-300">
              <p>Ce site est hébergé dans le cadre d'un projet de démonstration technique.</p>
              <p><strong>Note :</strong> Il s'agit d'une application de démonstration et non d'un service commercial en production.</p>
            </div>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-bold text-white mb-4">3. Propriété intellectuelle</h2>
            <div className="text-gray-300 space-y-3">
              <p>L'ensemble de ce site relève de la législation française et internationale sur le droit d'auteur et la propriété intellectuelle.</p>
              <p>Tous les droits de reproduction sont réservés, y compris pour les documents téléchargeables et les représentations iconographiques et photographiques.</p>
              <p>La reproduction de tout ou partie de ce site sur un support électronique quel qu'il soit est formellement interdite sauf autorisation expresse du directeur de la publication.</p>
            </div>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-bold text-white mb-4">4. Collecte de données</h2>
            <div className="text-gray-300 space-y-3">
              <p>Dans le cadre de cette démonstration, les données collectées sont :</p>
              <ul className="list-disc list-inside ml-4 space-y-1">
                <li>Adresse email</li>
                <li>Nom d'utilisateur</li>
                <li>Mot de passe (hashé)</li>
                <li>Historique des transactions (données de démonstration)</li>
              </ul>
              <p><strong>Important :</strong> Ces données sont stockées localement et ne sont pas utilisées à des fins commerciales.</p>
            </div>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-bold text-white mb-4">5. Responsabilité</h2>
            <div className="text-gray-300 space-y-3">
              <p>Les informations contenues sur ce site sont aussi précises que possible et le site remis à jour à différentes périodes de l'année, mais peut toutefois contenir des inexactitudes ou des omissions.</p>
              <p>Si vous constatez une lacune, erreur ou ce qui parait être un dysfonctionnement, merci de bien vouloir le signaler par email, à l'adresse contact@timeswap.network, en décrivant le problème de la manière la plus précise possible.</p>
            </div>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-bold text-white mb-4">6. Liens hypertextes</h2>
            <div className="text-gray-300 space-y-3">
              <p>Des liens hypertextes peuvent être présents sur le site. L'utilisateur est informé qu'en cliquant sur ces liens, il sortira du site timeswap.network.</p>
              <p>Ce dernier n'a pas de contrôle sur les pages web sur lesquelles aboutissent ces liens et ne saurait en aucun cas être responsable de leur contenu.</p>
            </div>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-bold text-white mb-4">7. Cookies</h2>
            <div className="text-gray-300 space-y-3">
              <p>Le site timeswap.network peut être amené à vous demander l'acceptation des cookies pour des besoins de statistiques et d'affichage.</p>
              <p>Un cookie est une information déposée sur votre disque dur par le serveur du site que vous visitez.</p>
              <p>Il contient plusieurs données qui sont stockées sur votre ordinateur dans un simple fichier texte auquel un serveur accède pour lire et enregistrer des informations.</p>
            </div>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-bold text-white mb-4">8. Droit applicable</h2>
            <div className="text-gray-300">
              <p>Tout litige en relation avec l'utilisation du site timeswap.network est soumis au droit français.</p>
              <p>Il est fait attribution exclusive de juridiction aux tribunaux compétents de Paris.</p>
            </div>
          </section>

          <div className="mt-8 p-4 bg-blue-500/20 rounded-lg border border-blue-500/30">
            <p className="text-blue-200 text-sm">
              <strong>Note importante :</strong> Ce site est une démonstration technique. 
              Les informations légales présentées sont génériques et doivent être adaptées 
              selon le contexte réel d'utilisation.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
