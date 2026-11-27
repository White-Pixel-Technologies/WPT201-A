import PlaceholderScreen from '../../components/PlaceholderScreen';
import PrivacyPolicyLink from '../../components/PrivacyPolicyLink';
import { t } from '../../i18n';

export default function Signup() {
  return (
    <>
      <PlaceholderScreen title={t('signup.title')} />
      <PrivacyPolicyLink />
    </>
  );
}
