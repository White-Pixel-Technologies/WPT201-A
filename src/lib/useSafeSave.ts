
import { useCallback, useRef, useState } from 'react';
import { useNetworkStatus } from './useNetworkStatus';
import { getDatabaseErrorKey } from './databaseErrors';
import { t } from '../i18n';

type SafeSaveAction = () => Promise<unknown | null>;

export function useSafeSave() {
  const { isOnline } = useNetworkStatus();
  const savingRef = useRef(false);

  const [isSaving, setIsSaving] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const save = useCallback(async (action: SafeSaveAction) => {
    if (savingRef.current) return false;

    if (!isOnline) {
      setErrorMessage(t('info.offline.save'));
      return false;
    }

    savingRef.current = true;
    setIsSaving(true);
    setErrorMessage('');

    try {
      const error = await action();

      if (error) {
        setErrorMessage(t(getDatabaseErrorKey(error)));
        return false;
      }

      return true;
    } catch (error) {
      setErrorMessage(t(getDatabaseErrorKey(error)));
      return false;
    } finally {
      savingRef.current = false;
      setIsSaving(false);
    }
  }, [isOnline]);

  const clearError = useCallback(() => {
    setErrorMessage('');
  }, []);

  return {
    save,
    isSaving,
    isOnline,
    errorMessage,
    clearError,
  };
}
