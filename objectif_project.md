évaluation
Mise en œuvre d’un pipeline CI/CD complet
Contexte


Vous êtes intégré·e dans une équipe DevOps en charge de la mise en place du déploiement automatisé
d’une API destinée à une application mobile. Le projet est encore en phase de développement, mais votre
mission est de préparer une infrastructure CI/CD complète, scalable, résiliente, incluant K
' La gestion d'infrastructure as codF
' Le déploiement automatisé de l’AP/
' La supervision du systèmF
' Des mécanismes de sauvegarde (snapshots%
' Une stratégie de retour arrière (rollback%
' Un versionnement maîtrisE
' Une gestion Git structurée (GitFlow)
Individuel
 Missio-
; Concevoir une infrastructure as code avec Terraform
 Automatiser la configuration des serveurs avec Ansible
 Intégrer un pipeline CI/CD avec GitHub Actions, GitLab CI ou Jenkins
 Mettre en œuvre une stratégie de branchement Git (GitFlow)
9 Gérer le versionnement sémantique de l’application ou des artefacts
 Implémenter des outils de logs et de monitoring
 Prévoir une sauvegarde d’état via des snapshots
 Concevoir une stratégie de rollback fonctionnelle.


Note : Le fonctionnement de l’API n’est pas l’objectif principal : ce projet vise à mettre en œuvre tout le cycle CI/CD..
 Livrables attendus
Un dépôt Git (public) contenant /
3< README.md complet et structuré, avec :

a. Présentation du projeC
O Contexte : brève description de l’API et de l’application mobile<
O Technologies utilisées.

b. Mise en place du GitFloA
O Schéma ou explication des branches utilisées : main, develop, feature, release, hotfix<
O Captures d’écran de l’historique de commit et des branches.

c. Pipeline CI/CD (explication + lien vers les fichiers,
O Fichier(s) YAML (GitHub Actions ou autre) avec description de chaque job /
O LinC
O TesC
O BuilG
O Packagin
O Déploiement stagin
O Déploiement productioL
O SnapshoC
O Rollback
 Livrables attendus
d. Packaging et versionnin
/ Description du processus de versionnement sémantique (SemVer) utilisé=
/ Utilisation de git tag, ou équivalent=
/ Dépôt ou stockage des artefacts (ex. GitHub Releases, Nexus, etc.)


e. Gestion des secrets et environnement4
/ Méthode utilisée (GitHub Secrets, .env, etc.F
/ Séparation staging / productio7
/ Bonnes pratiques suivies (sans exposer les secrets eux-mêmes).


f. Tests et log4
/ Capture ou lien vers l’exécution du pipeline avec les étapes visibles=
/ Exemple de log d’erreur ou de réussite commenté.

 Livrables attendus
g. Captures d’écran obligatoires (avec légende0
4J Exécution complète du pipeline CI/CF
)J Interface de staging (déployée0
J Interface de production (déployée0
'J Vue des branches Git (GitHub ou autre0
6J Historique de commits (main, develop0
J Tag Git/version utiliséN
J Dashboard/logs de monitorin$
J Déclenchement ou planification de snapsho1
J Restauration ou procédure de rollback + état restauré


h. Procédures documentée>
 Déploiement:
 Procédure de restauration (rollback) clairN
 Plan de versionnage et tag


 Livrables attendus
2. Structure du dépôt Gi
6 api/ : code de l’API REST (Node, Django, etc.:
6 terraform/: Scripts Terraform (infra:
6 ansible/: Rôles et playbooks Ansibl@
6 .github/workflows/ : fichiers YAML du pipeline (ou équivalent selon CI:
6 monitoring/: Logs & supervisio&
6 rollback/ : script ou procédure de restauratio&
6 snapshots/ : fichiers ou configuration de snapshot si applicabl@
6 .git/: Historique Git avec GitFlo
6 tags/: Versionnement sémantique (ex: v1.0.0:
6 README.md : documentation complète

 Critères d'évaluation
Critère
Infrastructure avec Terraform
Configuration avec Ansible
Pipeline CI/CD complet
Logs et monitoring
Snapshots (sauvegardes)
Rollback (restauration)
GitFlow (structure, branches, historique)
Versionnement sémantique
Documentation claire (README)
Points
3 points
3 points
3 points
2 points
2 points
2 points
2 points
1 point
2 points