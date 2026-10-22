import { router } from 'expo-router';

import { EmptyState } from '../components';

export default function NotFound() {
  return (
    <EmptyState
      icon="mi:explore-off"
      title="Page introuvable"
      subtitle="Cette adresse ne correspond à aucun écran du kit."
      actionLabel="Retour à l’accueil"
      actionIcon="mi:home"
      onAction={() => router.navigate('/')}
    />
  );
}
