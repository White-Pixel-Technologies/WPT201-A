
import PlaceholderScreen from '../../components/PlaceholderScreen';
import PrivacyPolicyLink from '../../components/PrivacyPolicyLink';
import { t } from '../../i18n';

export default function Welcome() {
  return (
    <>
      <PlaceholderScreen title={t('onboarding.welcome')} />
      <PrivacyPolicyLink />
    </>
  );
}
