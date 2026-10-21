import { router } from 'expo-router';
import type { ComponentType } from 'react';
import { StyleSheet, View } from 'react-native';

import { KitIconButton } from '../../components';
import { useKitTheme } from '../../theme';
import { DemoBar } from '../layouts/DemoBar';
import type { PageExample } from '../pageExamples';
import { AuthExample } from './AuthExample';
import { ExAppShell } from './ExAppShell';
import {
  ApplicationFormExample,
  BookingFormExample,
  CheckoutFormExample,
  ContactFormExample,
  OnboardingFormExample,
  SurveyFormExample,
} from './FormsExamples';

const FORMS: Record<string, ComponentType> = {
  contact: ContactFormExample,
  checkout: CheckoutFormExample,
  onboarding: OnboardingFormExample,
  survey: SurveyFormExample,
  booking: BookingFormExample,
  application: ApplicationFormExample,
};

/**
 * Écran d'une page d'exemple : shell applicatif (pages « Applications »), écran d'authentification ou
 * formulaire sous une barre avec retour.
 */
export function ExampleScreen({ page }: { page: PageExample }) {
  const { kit } = useKitTheme();
  if (page.shell) return <ExAppShell initial={page.shell} />;
  if (page.route.startsWith('auth/')) return <AuthExample variant={page.route.slice(5)} />;
  const Form = FORMS[page.slug] ?? ContactFormExample;
  return (
    <View style={[styles.fill, { backgroundColor: kit.bg }]} testID={`page-${page.slug}`}>
      <DemoBar
        leading={<KitIconButton icon="mi:arrow-back" accessibilityLabel="Retour" onPress={() => router.back()} />}
        title={page.title}
      />
      <Form />
    </View>
  );
}

const styles = StyleSheet.create({
  fill: { flex: 1 },
});
